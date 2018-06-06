(function(){
    'use strict';

    angular
        .module('app')
        .config(route);

    route.$inject = ['$stateProvider'];

    function route($stateProvider) {
        $stateProvider
            .state('manager.workdiary', {
                url: '/workdiary/:id/:day',
                templateUrl: 'app/manager/statistics/Workdiary.template.html',
                controller: 'ManagerWorkDiaryController as vm',
                params: {
                    day: {squash: true, value: null}
                }
            })
            .state('manager.general-statistics', {
                url: '/statistics/:format/:day',
                templateUrl: 'app/manager/statistics/Statistics.template.html',
                controller: 'StatisticsManagerController as vm',
                data: {
                    setBodyClass: true,
                },
                params: {
                    day: {squash: true, value: null},
                    format: {squash: true, value: null},
                }
            })
    }
})();