'use strict';

angular
    .module('app')
    .controller('AdminViewStatisticsController', AdminViewStatisticsController);

AdminViewStatisticsController.$inject = ['Page', 'User', 'Statistics', '$stateParams'];

function AdminViewStatisticsController(Page, User, Statistics, $stateParams) {
    let vm = this;
    let develop = $stateParams.id;
    let project = $stateParams.project;

    vm.work  = 0;
    vm.today = 0;
    vm.statistics = [];
    vm.reload     = reload;
    vm.setToDay   = setToDay;
    vm.developer  = {
        id: null,
        name: null,
    };

    vm.offline = {
        time: 0,
        id: '',
        offlineTime: 0,
        error: false,
    };
    vm.addOfflineTime = addOfflineTime;

    init();

    ////////////

    function init() {
        User.getUser({id: develop}, function(res) {
            if (res.success) {
                vm.developer.id   = res.data.user.id;
                vm.developer.name = res.data.user.last_name + ' ' + res.data.user.first_name;
            }
        });

        reload();

        $('#datepicker').val(moment().format('YYYY/MM/DD'));

        $('.w-snaps__content').on('click', 'img', function(event) {
            zoom.to({ element: $(this)[0], padding: 2, scrolloff: true, pan: false });
        });
    }

    function reload() {
        Statistics.getProjectTotal({project_id: project, user_id: develop}, function(res) {
            if (res.success) {
                vm.work = res.data;

                Page.setTitle(vm.work.name);

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
        let getDate = $('#datepicker').datepicker('getDate');

        let data = {
            start_time: moment(getDate).startOf('day').unix(),
            end_time: moment(getDate).endOf('day').unix(),
            project_id: project,
            user_id: develop,
        };

        getStatisticDay(data);
    }

    function setToDay() {
        $('#datepicker').datepicker('update', moment(new Date()).format('YYYY/MM/DD'));

        let data = {
            start_time: moment().startOf('day').unix(),
            end_time: moment().endOf('day').unix(),
            project_id: project,
            user_id: develop,
        };

        getStatisticDay(data);
    }

    function getStatisticDay(data) {
        Statistics.getProjectPeriod(data).$promise.then(function(res) {
            if (res.success) {
                let hour = null;
                let minute = null;
                let temp = [];
                vm.today = 0;

                res.data.forEach(function(stat) {
                    if (stat.mode == 'manager') {
                        vm.offline.id = stat.id;
                        vm.offline.time = stat.work_time / 60;
                        vm.offline.offlineTime = stat.work_time;
                    } else {
                        hour = moment.unix(stat.save_time).format('H');
                        minute = moment.unix(stat.save_time).format('mm');

                        temp[hour] = temp[hour] || [null,null,null,null,null,null];
                        temp[hour][minute[0]] = stat;
                    }

                    vm.today += stat.work_time;
                });

                vm.statistics = _.chain(temp)
                                 .map(function(item, key) {
                                    if (item !== undefined) {
                                        return {hour: key, minute: item};
                                    }
                                 })
                                 .filter()
                                 .value();
            }

            if (!res.data.length) {
                vm.today = 0;
            }
        });
    }

    function addOfflineTime() {
        let data = {
            id: vm.offline.id,
            time: vm.offline.time,
            project: project,
            user: develop,
        };

        Statistics.setOffline({data: data}, function(res){
            if (res.success) {
                setToDay();
                vm.offline.error = false;
            } else {
                vm.offline.error = true;
            }
        }).$promise.catch(function(err) {
            vm.offline.error = true;
        });
    }
}