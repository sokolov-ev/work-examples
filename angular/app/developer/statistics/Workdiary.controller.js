'use strict';

angular
    .module('app')
    .controller('DeveloperWorkdiary', DeveloperWorkdiary);

DeveloperWorkdiary.$inject = ['$stateParams', 'Statistics', 'Auth', 'Page'];

function DeveloperWorkdiary($stateParams, Statistics, Auth, Page) {
    let vm = this;
    let projectId = $stateParams.id;
    let user = Auth.getUser();

    vm.days = [];
    vm.work = {
        days: [],
        week: 0,
        offlineTime: 0,
    };
    vm.totalTimeToDay = 0;
    vm.statistics = [];
    vm.reloadStatOfWeek = reloadStatOfWeek;
    vm.setToDay = setToDay;
    vm.offline = 0;

    vm.selectedStats   = {};
    vm.selectedHour    = {};
    vm.dirtyStatistics = [];
    vm.removeTime      = 0;
    vm.removeStatIds   = [];

    vm.unlockDay = true;

    vm.calculateRemoveStat = calculateRemoveStat;
    vm.calculateRemoveHour = calculateRemoveHour;
    vm.removeStat = removeStat;
    vm.selectHours = selectHours;
    vm.deselectAll = deselectAll;

    init();

    ///////////

    function init() {
        reloadStatOfWeek();

        $('#datepicker').val(moment().format('YYYY/MM/DD'));

        $('.w-snaps__content').on('click', 'img', function(event) {
            zoom.to({ element: $(this)[0], padding: 2, scrolloff: true, pan: false });
        });
    }

    function reloadStatOfWeek() {
        Statistics.getProjectTotal({user_id: user._id}, function(res) {
            if (res.success) {
                vm.work.days = res.data;

                $('#datepicker').datepicker({
                    language: 'ru',
                    format: 'yyyy/mm/dd',
                    autoclose: true,
                    beforeShowDay: function(date) {
                        if (~vm.work.days.indexOf(moment(date).format('YYYY-MM-DD'))) {
                            return {classes: 'active-day'};
                        }
                    }
                });

                $('#datepicker').datepicker().on('changeDate', function (event) {
                    getDay();
                });

                getDay()
            }
        });
    }

    function getDay() {
        let toDayTime = $('#datepicker').datepicker('getDate');

        let data = {
            day: toDayTime,
            project_id: projectId,
            user_id: user._id,
        };

        getStatisticDay(data);
    }

    function setToDay() {
        let toDayTime = moment(new Date()).format('YYYY/MM/DD');
        $('#datepicker').datepicker('update', toDayTime);

        let data = {
            day: toDayTime,
            project_id: projectId,
            user_id: user._id,
        };

        getStatisticDay(data);
    }

    function getStatisticDay(data) {
        vm.unlockDay = moment(data.day).format('YYYY-MM-DD') == moment().format('YYYY-MM-DD');

        Statistics.getProjectPeriod(data).$promise.then(function(res) {
            if (res.success) {
                let hour = null;
                let minute = null;
                let length = 0;
                let newStatTime = 0;
                let computeTime = 0;
                let managerStat = [];

                vm.totalTimeToDay = 0;
                vm.work.week = res.data.week;
                vm.dirtyStatistics = angular.copy(res.data.day);
                vm.days = angular.copy(res.data.day);

                _.map(vm.days, function(stat) {
                    if (stat.mode == 'manager') {
                        computeTime = Math.ceil(stat.work_time/600);

                        newStatTime = angular.copy(stat.save_time);
                        stat.whatTime = moment.unix(newStatTime).format("HH:mm");

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
    }

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
            if (item.mode != 'manager') {
                time = moment.unix(item.save_time).format('H');

                if (hour == time) {
                    vm.selectedStats[item.id] = vm.selectedHour[hour];
                }
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
}