(function(){
    'use strict';

    angular
        .module('app')
        .controller('ManagerWorkDiaryController', ManagerWorkDiaryController);

    ManagerWorkDiaryController.$inject = ['Page', 'User', 'Statistics', '$stateParams', '$state'];

    function ManagerWorkDiaryController(Page, User, Statistics, $stateParams, $state) {
        let vm = this;

        // variables
        vm.selectedDay = $stateParams.day || moment().format('YYYY/MM/DD');
        vm.developer  = {
            id: $stateParams.id,
            name: null,
        };
        vm.work = {
            days: 0,
            week: 0,
            offlineTime: 0,
            currentTime: moment().format("HH:mm"),
            error: false,
            errorComment: false,
        };
        vm.totalTimeToDay = 0;
        vm.statisticsOfDay = {};

        vm.offlineTime = {
            id: null,
            start: new Date(vm.selectedDay),
            end: null,
            time: 0,
            comment: '',
            user: null,
            project: null,
        };

        vm.offlineArray = [];

        vm.listProjects    = [];
        vm.currentProjects = 'all';

        vm.days = [];
        vm.selectedStats   = {};
        vm.selectedHour    = {};
        vm.dirtyStatistics = [];
        vm.removeTime      = 0;
        vm.removeStatIds   = [];

        // functions

        vm.init = init;
        vm.reloadStatOfWeek = reloadStatOfWeek;
        vm.getDay = getDay;
        vm.setToDay = setToDay;
        vm.getStatisticDay = getStatisticDay;
        vm.calculateOfflineStat = calculateOfflineStat;
        vm.setOfflineStat = setOfflineStat;

        vm.calculateRemoveStat = calculateRemoveStat;
        vm.calculateRemoveHour = calculateRemoveHour;
        vm.removeStat = removeStat;
        vm.selectHours = selectHours;
        vm.deselectAll = deselectAll;

        vm.editOffline = editOffline;
        vm.clearOfflineForm = clearOfflineForm;

        vm.removeOffline = removeOffline;

        vm.init();

        ////////////

        function init() {
            User.getUser({id: vm.developer.id}, function(res) {
                if (res.success) {
                    vm.listProjects        = res.data.user.Projects;
                    vm.developer.id        = res.data.user.id;
                    vm.offlineTime.user    = res.data.user.id;
                    vm.offlineTime.project = vm.listProjects[0].id;
                    vm.developer.name      = res.data.user.last_name + ' ' + res.data.user.first_name;

                    Page.setTitle(vm.developer.name);
                }
            });

            vm.reloadStatOfWeek();

            if (vm.selectedDay) {
                $('#datepicker').val(moment(new Date(vm.selectedDay)).format('YYYY/MM/DD'));
            } else {
                $('#datepicker').val(moment().format('YYYY/MM/DD'));
            }

            $('.w-snaps__content').on('click', 'img', function(event) {
                zoom.to({ element: $(this)[0], padding: 2, scrolloff: true, pan: false });
            });
        }

        function reloadStatOfWeek() {
            Statistics.getProjectTotal({user_id: vm.developer.id}, function(res) {
                if (res.success) {
                    vm.work.days = res.data;

                    $('#datepicker').datepicker({
                        language: 'ru',
                        format: 'yyyy-mm-dd',
                        autoclose: true,
                        beforeShowDay: function(date) {
                            if (~vm.work.days.indexOf(moment(date).format('YYYY-MM-DD'))) {
                                return {classes: 'active-day'};
                            }
                        }
                    });

                    $('#datepicker').datepicker().on('changeDate', function (event) {
                        vm.getDay();
                    });

                    vm.getDay();
                }
            });
        }

        function getDay() {
            let toDayTime = $('#datepicker').datepicker('getDate');

            $state.go('manager.workdiary', {id: vm.developer.id, day: moment(new Date(toDayTime)).format('YYYY-MM-DD')}, {notify: false});
            vm.offlineTime.start = new Date(toDayTime);

            vm.getStatisticDay(toDayTime);
        }

        function setToDay() {
            let toDayTime = moment(new Date()).format('YYYY/MM/DD');
            $('#datepicker').datepicker('update', toDayTime);

            $state.go('manager.workdiary', {id: vm.developer.id, day: moment(new Date(toDayTime)).format('YYYY-MM-DD')}, {notify: false});
            vm.offlineTime.start = new Date(toDayTime);

            vm.getStatisticDay(toDayTime);
        }

        function getStatisticDay(toDayTime) {
            let projects = [];

            if (vm.currentProjects == 'all') {
                _.forEach(vm.listProjects, function(value, key) {
                    projects.push(value.id);
                });
            } else {
                projects.push(vm.currentProjects);
            }

            let data = {
                day: toDayTime,
                project_id: projects,
                user_id: vm.developer.id,
            };

            Statistics.getProjectPeriod(data).$promise.then(function(res) {
                if (res.success) {
                    let hour = null;
                    let minute = null;
                    let length = 0;
                    let newStatTime = 0;
                    let computeTime = 0;
                    let managerStat = [];

                    vm.offlineArray = [];
                    vm.totalTimeToDay = 0;
                    vm.work.offlineTime = 0;
                    vm.work.week = res.data.week;
                    vm.dirtyStatistics = angular.copy(res.data.day);
                    vm.days = angular.copy(res.data.day);

                    _.map(vm.days, function(stat) {
                        if (stat.mode == 'manager') {
                            computeTime = Math.ceil(stat.work_time/600);

                            newStatTime = angular.copy(stat.save_time);
                            stat.whatTime = moment.unix(newStatTime).format("HH:mm");

                            vm.offlineArray.push(stat);
                            vm.work.offlineTime += stat.work_time;

                            for (let i = 1; i < computeTime; i++) {
                                newStatTime += 600;

                                managerStat.push({
                                    comment: stat.comment,
                                    id: stat.id,
                                    image: stat.image,
                                    keyboard: stat.keyboard,
                                    mode: stat.mode,
                                    mouse: stat.mouse,
                                    save_time: newStatTime,
                                    work_time: 0,
                                });
                            }
                        }

                        return stat;
                    });

                    if (managerStat && managerStat.length) {
                        vm.days = vm.days.concat(managerStat);
                    }

                    vm.statisticsOfDay = {};

                    vm.days.forEach(function(stat) {

                        hour = moment.unix(stat.save_time).format('H');
                        minute = moment.unix(stat.save_time).format('mm');

                        vm.statisticsOfDay[hour] = vm.statisticsOfDay[hour] || [null, null, null, null, null, null];

                        if (vm.statisticsOfDay[hour][minute[0]] && vm.statisticsOfDay[hour][minute[0]].stat) {

                            vm.statisticsOfDay[hour][minute[0]].stat.push(stat);
                            vm.statisticsOfDay[hour][minute[0]].offline = {
                                coll: 2,
                                type: stat.mode,
                                comment: stat.comment,
                            };
                        } else {
                            vm.statisticsOfDay[hour][minute[0]] = {
                                stat: [stat],
                                offline: {
                                    coll: 2,
                                    type: stat.mode,
                                    comment: stat.comment,
                                },
                            };
                        }

                        vm.totalTimeToDay += stat.work_time;
                    });

                    _.map(vm.statisticsOfDay, function(hours) {
                        length = 0;

                        if (!hours[length]) {
                            hours[length] = {
                                offline: {
                                    coll: 2,
                                    type: 'empty',
                                    comment: null,
                                }
                            };
                        }

                        for (let minute = 1; minute < 6; minute++) {
                            if (!hours[minute]) {
                                hours[minute] = {
                                    offline: {
                                        coll: 2,
                                        type: 'empty',
                                        comment: null,
                                    }
                                };
                            }

                            if (hours[length].offline.type == hours[minute].offline.type && hours[length].offline.comment == hours[minute].offline.comment) {

                                hours[length].offline.coll += 2;
                                hours[minute].offline.coll = 0;

                            } else {
                                length = minute;
                            }
                        }

                        return hours;
                    });
                }

                if (!vm.days.length) {
                    vm.totalTimeToDay = 0;
                }
            });
        };

        function calculateOfflineStat() {
            vm.work.errorComment = false;

            let start = moment(new Date(vm.offlineTime.start)).unix();
            let end = start + (parseInt(vm.offlineTime.time, 10) * 60);

            let conflict = _.filter(vm.dirtyStatistics, function(item) {
                return (start < item.save_time && item.save_time < end);
            });

            if (!vm.offlineTime.comment.length) {
                vm.work.errorComment = true;
            } else {
                if (conflict && conflict.length) {
                    $('#conflictOfflineStat').modal('show');
                } else {
                    vm.setOfflineStat();
                }
            }
        };

        function setOfflineStat () {
            let start = moment(new Date(vm.offlineTime.start)).unix();
            let time = (parseInt(vm.offlineTime.time, 10) * 60);
            let end = start + time;

            let data = {
                id: vm.offlineTime.id,
                start: start,
                end: end,
                time: time,
                comment: vm.offlineTime.comment,
                project: vm.offlineTime.project,
                user: vm.offlineTime.user,
            };

            Statistics.setOffline({data}, function(res){
                if (res.success) {
                    vm.reloadStatOfWeek();
                    vm.work.error = false;
                } else {
                    vm.work.error = true;
                }

                $('#conflictOfflineStat').modal('hide');
            }).$promise.catch(function(err) {
                vm.work.error = true;
            });
        };

        function calculateRemoveStat () {
            let ids = _.chain(vm.selectedStats)
                       .map(function(item, key) {
                            if (item) {
                                return key;
                            }

                            return null;
                       })
                       .filter()
                       .value();

            let stats = _.filter(vm.dirtyStatistics, function(item) {return ids.indexOf(item.id.toString()) !== -1;});
            vm.removeTime = _.sumBy(stats, function(item) {return item.work_time;});
            vm.removeStatIds = _.map(stats, function(item) {return item.id;});
        };

        function calculateRemoveHour (hour) {
            let time = '';

            _.forEach(vm.dirtyStatistics, function(item) {
                time = moment.unix(item.save_time).format('H');

                if (hour == time) {
                    vm.selectedStats[item.id] = vm.selectedHour[hour];
                }
            });

            calculateRemoveStat();
        };

        function selectHours () {
            let time = '';
            let stats = _.filter(vm.dirtyStatistics, function(item) {return vm.removeStatIds.indexOf(item.id) !== -1;});

            _.forEach(stats, function(item) {
                time = moment.unix(item.save_time).format('H');
                vm.selectedHour[time] = true;
            });
        };

        function deselectAll () {
            vm.removeTime = 0;
            vm.removeStatIds = [];
            vm.selectedHour = {};
            vm.selectedStats = {};
        }

        function removeStat () {
            let data = {
                ids: vm.removeStatIds,
            };

            Statistics.removeStat({data}, function(res) {
                if (res.success) {
                    $('#removeStat').modal('hide');
                    vm.deselectAll();
                    vm.reloadStatOfWeek();
                }
            }).$promise.catch(function(err) {
                console.error(err);
            });
        };

        function editOffline(offline) {
            vm.offlineTime.id      = offline.id;
            vm.offlineTime.start   = new Date(moment.unix(offline.save_time));
            vm.offlineTime.time    = (parseInt(offline.work_time, 10) / 60);
            vm.offlineTime.comment = offline.comment;
        };

        function clearOfflineForm () {
            vm.offlineTime.id      = null;
            vm.offlineTime.start   = new Date(vm.selectedDay);
            vm.offlineTime.time    = 0;
            vm.offlineTime.comment = '';
        }

        function removeOffline (offline) {
            vm.selectedStats[offline.id] = true;

            calculateRemoveStat();
            $('#removeStat').modal('show');
        }
    }
}());