var Document = require('../models/Document');
var DocumentUnit = require('../models/DocumentUnit');
var DocumentVersion = require('../models/DocumentVersion');
var Unit = require('../models/Unit');
var guid = require('guid');
var Bookshelf = require('../utils/bookshelf');
var knex = Bookshelf.knex;
var amazonService = require("./amazonService")();
var _ = require('lodash');
var cache = require("../utils/cache");
var updateDataService =require('../utils/updateDataService')();
var filterService = require('../services/filterService')();
var moment = require('moment');

var documentService = function () {

    var get = function (planId, done) {
        Document
            .forge({id: planId})
            .fetch({withRelated: ['units', 'units.area']})
            .then(function (plan) {
                done(null, plan.toJSON())
            })
            .catch(function (err) {
                err.method = "documentsService - get";
                done(err, null);
            });
    };

    var getPlansByProjectId = function (payload, projectId, timezone, done) {
        Bookshelf
            .transaction(function (t) {
                return Document
                    .forge()
                    .query(function (qb) {
                        filterService.documentsFilterQuery(qb, payload, projectId, timezone);
                    })
                    .fetchPage({
                        pageSize: payload.paging.limit,
                        page: payload.paging.page,
                        transacting: t,
                        withRelated: ['units.area',{'units': function (qb) {
                                qb.join("areas", "areas.id", "=", "units.area_id");
                                    qb.where('areas.project_id', projectId)}}]
                    });
            })
            .then(function(result) {
                var plans = JSON.parse(JSON.stringify(result.models));

                done(null, {
                    units: plans,
                    unitTypes: [],
                    pagination: result.pagination
                });
            })
            .catch(function(err) {
                err.method = "documentService - getPlansByProjectId";
                done(err);
            });
    };

    var existPlanInUnits = function(units, plan) {
        var message = '';
        var unitsNames = [];
        var exist = _.chain(units)
                .filter(function(unit) {
                    return _.find(unit.documents, function(item) {
                        return item.name == plan.name && item.plan_ext == plan.fileType;
                    });
                })
                .forEach(function(unit) {
                    unitsNames.push(unit.name);
                })
                .value();

        if (exist && exist.length) {
            if (unitsNames.length == 1) {
                message = 'Plan "' + plan.name + '" is already assigned to "' + unitsNames.join() + '".';
            } else {
                message = 'Plan "' + plan.name + '" is already assigned to units ("' + unitsNames.join('", "') + '")';
            }

            return message;
        } else {
            return null;
        }
    };

    var updateDocumentToUnits = function (projectId, planId, req, userId, done) {
        var unitsId    = req.body.units;
        var planUpdate = req.body.document;

        var oldDataPlan = {};
        var oldUnitsId  = [];
        var newUnitsId  = [];
        var removeUnitsId  = [];
        var restoreUnitsId = [];
        var insertUnitsId  = [];

        var checkUnits = [];
        var planUnits  = [];

        var base64Data = null;
        var imageData  = null;

        var savePlan = {
            user_id: userId,
            update_date: moment().toISOString(),
        };

        var savePlanVersion = {
            user_id: userId,
            update_date: moment().toISOString(),
        };

        var planVersion = {
            id: guid.raw(),
            user_id: userId,
            document_id: planId,
            version: 0
        };

        Document
            .forge()
            .query(function(qb){
                qb.where('id', planId);
                qb.andWhere('is_deleted', false);
            })
            .fetch({withRelated: ['units', 'documnetUnitsIncludeDeleted.unit']})
            .then(function(planFind) {
                if (!planFind) {
                    return {error: 'Plan not found'};
                }

                oldDataPlan = planFind.toJSON();

                planVersion.path = oldDataPlan.path;

                oldUnitsId = _.chain(oldDataPlan.documnetUnitsIncludeDeleted)
                              .filter(function(item) {
                                return item.is_deleted == false;
                              })
                              .map(function(item) {
                                return item.unit_id;
                              })
                              .value();

                restoreUnitsId = _.chain(oldDataPlan.documnetUnitsIncludeDeleted)
                                  .filter(function(item) {
                                    return item.is_deleted == true && item.unit && item.unit.id && unitsId.indexOf(item.unit.id) !== -1;
                                  })
                                  .map(function(item) {
                                    return item.unit_id;
                                  })
                                  .value();

                newUnitsId = _.difference(unitsId, oldUnitsId);
                removeUnitsId = _.difference(oldUnitsId, unitsId);
                insertUnitsId = _.difference(newUnitsId, restoreUnitsId);

                if (oldDataPlan.name != planUpdate.name) {
                    checkUnits = unitsId;
                } else {
                    checkUnits = newUnitsId;
                }

                return Unit
                    .forge()
                    .query(function(qb){
                        qb.whereIn('id', checkUnits);
                        qb.andWhere('is_deleted', false);
                    })
                    .fetchAll({withRelated: ['documents']});
            })
            .then(function(units) {
                if (units.error || !units.length) {
                    return units;
                }

                var exist = existPlanInUnits(units.toJSON(), planUpdate);

                if (exist) {
                    return {error: exist};
                } else {
                    return {};
                }
            })
            .then(function(result) {
                if (result.error) {
                    return result;
                }

                if (oldDataPlan.name != planUpdate.name) {
                    savePlan.name = planUpdate.name;
                }

                if (planUpdate.data) {
                    var path = projectId + '/' + guid.raw();
                    base64Data = planUpdate.data.replace(/^data:([a-z]+\/[a-z0-9\-\+]+(;[a-z\-]+\=[a-z0-9\-]+)?)?(;base64),/, "");
                    imageData = new Buffer(base64Data, 'base64');

                    return amazonService
                        .insertPromise(path, imageData, planId, userId)
                        .then(function(data) {
                            savePlan.path = path;
                            savePlan.name = planUpdate.name;
                            savePlan.plan_ext = planUpdate.fileType;

                            savePlanVersion.path = path;
                            planVersion.path = path;

                            return {};
                        });
                } else {
                    return {};
                }
            })
            .then(function(result) {
                if (result.error) {
                    return result;
                }

                if (insertUnitsId && insertUnitsId.length) {
                    insertUnitsId.forEach(function (unitId) {
                        planUnits.push({
                            id: guid.raw(),
                            document_id: planId,
                            unit_id: unitId,
                            user_id: userId,
                        });
                    });

                    return knex(DocumentUnit.prototype.tableName).insert(planUnits);
                } else {
                    return {};
                }
            })
            .then(function(result) {
                if (result.error) {
                    return result;
                }

                if (restoreUnitsId && restoreUnitsId.length) {
                    return knex(DocumentUnit.prototype.tableName)
                        .where('document_id', planId)
                        .whereIn('unit_id', restoreUnitsId)
                        .update({is_deleted: false, user_id: userId, update_date: moment().toISOString()});
                } else {
                    return {};
                }
            })
            .then(function(result) {
                if (result.error) {
                    return result;
                }

                if (removeUnitsId && removeUnitsId.length) {
                    return knex(DocumentUnit.prototype.tableName)
                        .where('document_id', planId)
                        .whereIn('unit_id', removeUnitsId)
                        .update({is_deleted: true, user_id: userId, update_date: moment().toISOString()});
                } else {
                    return {};
                }
            })
            .then(function(result) {
                if (result.error) {
                    return result;
                }

                return DocumentVersion
                    .forge()
                    .query(function(qb){
                        qb.where('document_id', planId);
                        qb.andWhere('is_deleted', false);
                    })
                    .fetch({})
                    .then(function(version) {
                        if (version) {
                            return {};
                        } else {
                            return knex(DocumentVersion.prototype.tableName).insert(planVersion);
                        }
                    });
            })
            .then(function(result) {
                if (result.error) {
                    return result;
                }

                return DocumentVersion
                    .forge(savePlanVersion)
                    .where("document_id", planId)
                    .save(null, {method: "update"});
            })
            .then(function(result) {
                if (result.error) {
                    return result;
                }

                return Document
                    .forge(savePlan)
                    .where("id", planId)
                    .save(null, {method: "update"});
            })
            .then(function(result) {
                if (result.error) {
                    done({message: result.error}, null);
                } else {
                    cache.buildupDelete('*documents*', function (afterSave) {
                        done(null, result);
                    });
                }
            })
            .catch(function(err) {
                done(err, null);
            });
    };

    var insertDocumentToUnits = function (req, projectId, userId, done) {
        var exist = null;
        var unitsId = req.body.units;
        var planSave = req.body.document;

        if (!unitsId) {
            return done({message: 'Empty units id.'}, null);
        }

        Unit.forge()
            .query(function(qb){
                qb.whereIn('id', unitsId);
                qb.andWhere('is_deleted', false);
            })
            .fetchAll({withRelated: ['documents']})
            .then(function(units) {
                if (units) {
                    exist = existPlanInUnits(units.toJSON(), planSave);
                }
            })
            .then(function() {
                return Document
                    .forge()
                    .query(function(qb){
                        qb.where('name', planSave.name);
                        qb.andWhere('plan_ext', planSave.fileType);
                        qb.andWhere('is_deleted', false);
                    })
                    .fetch({withRelated: ['units']});
            })
            .then(function(planFind) {
                if (exist) {
                    done({message: exist}, null);
                } else {
                    if (planFind) {
                        planFind = planFind.toJSON();

                        var unitsOld = _.map(planFind.units, function(item) {return item.id;});
                        var unitsAll = unitsOld.concat(unitsId);

                        req.body.units = unitsAll;
                        req.body.document.data = null;

                        updateDocumentToUnits(projectId, planFind.id, req, userId, done);
                    } else {
                        insertDocumenetsListToUnits(planSave, unitsId, projectId, userId, done);
                    }
                }
            })
            .catch(function(err) {
                err.method = "documentsService - insertDocumentsToUnits";
                done(err, null);
            });
    };

    var insertDocumenetsListToUnits = function(planSave, unitsId, projectId, userId, done) {
        var plan = {};
        var planVersion = {};
        var planUnits = [];

        if (!planSave.id) {
            planSave.id = guid.raw();
        }

        if (!planSave.path) {
            planSave.path = projectId + "/" + planSave.id;
        }

        var base64Data = planSave.data.replace(/^data:([a-z]+\/[a-z0-9\-\+]+(;[a-z\-]+\=[a-z0-9\-]+)?)?(;base64),/, "");
        var imageData = new Buffer(base64Data, 'base64');

        amazonService.insert(planSave.path, imageData, planSave.id, userId, function (err, data) {
            if (err) {
                err.method = "documentsService - errorInsertToAmazon";
                done(err, null);
            } else {
                plan = {
                    id: planSave.id,
                    name: planSave.name,
                    path: planSave.path,
                    plan_ext: planSave.fileType,
                    user_id: userId,
                };

                planVersion = {
                    id: guid.raw(),
                    path: planSave.path,
                    user_id: userId,
                    document_id: planSave.id,
                    version: 0
                };

                knex(Document.prototype.tableName)
                    .insert(plan)
                    .then(function (data) {
                        unitsId.forEach(function (unitId) {
                            planUnits.push({
                                id: guid.raw(),
                                document_id: plan.id,
                                unit_id: unitId,
                                user_id: userId,
                            });
                        });

                        return knex(DocumentUnit.prototype.tableName).insert(planUnits);
                    })
                    .then(function(docUnits) {
                        return knex(DocumentVersion.prototype.tableName).insert(planVersion);
                    })
                    .then(function() {
                        updateDataService.update(userId);

                        done(null, plan);
                    })
                    .catch(function (err) {
                        err.method = "documentsService - insertDocumenetsListToUnitsFromClients";
                        done(err, null);
                    });
            }
        });
    };

    var updateUnit = function (documentId, units, done, userId) {
        knex('documents_units')
            .where('document_id', '=', documentId).andWhere('unit_id', '=', units.old_unit)
            .update({unit_id: units.new_unit, user_id: userId}).then(function (objectAfterSave) {
                cache.buildupDelete('*documents*', function (objectAfterSave) {
                    done(null, objectAfterSave);
                });
            })
            .catch(function (err) {
                err.method = "documentsService - updateUnit";
                done(err);
            });
    };

    var update = function (planId, updateJson, done) {
        Document
            .forge()
            .where({id: planId})
            .save(updateJson, {patch: true})
            .then(function (updatedPlan) {
                done(null, updatedPlan);
            })
            .catch(function (err) {
                err.method = "documentsService - update";
                done(err, null);
            });
    };

    var removeDocumentsUnits = function (plansId, userId, isDelete, done) {
        knex(DocumentUnit.prototype.tableName)
            .whereIn('document_id', plansId)
            .update({is_deleted: isDelete, user_id: userId})
            .then(function (result) {
                return knex('documents_versions')
                    .whereIn('document_id', plansId)
                    .update({is_deleted: isDelete, user_id: userId});
            })
            .then(function (result) {
                return knex('documents')
                    .whereIn('id', plansId)
                    .update({is_deleted: isDelete, user_id: userId});
            })
            .then(function(objectAfterSave) {
                cache.buildupDelete('*documents*', function (data) {
                    done(null, objectAfterSave);
                });
            })
            .catch(function (err) {
                err.method = "documentsService - removeDocumentsUnits";
                done(err, null);
            });
    };

    var removeDocumentToUnits = function(projectId, documentId, userId, done) {
        knex(DocumentUnit.prototype.tableName)
            .where('document_id', '=', documentId)
            .update({is_deleted: true, user_id: userId})
            .then(function (result) {
                return knex('documents_versions')
                    .where('document_id', '=', documentId)
                    .update({is_deleted: true, user_id: userId});
            })
            .then(function (result) {
                return knex('documents')
                    .where('id', '=', documentId)
                    .update({is_deleted: true, user_id: userId});
            })
            .then(function(objectAfterSave) {
                cache.buildupDelete('*documents*', function (data) {
                    done(null, objectAfterSave);
                });
            })
            .catch(function (err) {
                err.method = "documentsService - removeDocumentToUnits";
                done(err, null);
            });
    };

    return {
        get: get,
        update: update,
        updateUnit: updateUnit,
        insertDocumentToUnits: insertDocumentToUnits,
        updateDocumentToUnits: updateDocumentToUnits,
        removeDocumentToUnits: removeDocumentToUnits,
        removeDocumentsUnits: removeDocumentsUnits,
    };
};

module.exports = documentService;
