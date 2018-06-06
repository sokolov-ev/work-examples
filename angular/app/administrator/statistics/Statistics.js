(function(){
    'use strict';

    angular
        .module('app')
        .config(route);

    route.$inject = ['$stateProvider'];

    function route($stateProvider) {
        $stateProvider
            .state('admin.general-statistics', {
                url: '/statistics/:format/:day',
                templateUrl: 'app/administrator/statistics/Statistics.template.html',
                controller: 'AdminStatistics as vm',
                data: {
                    setBodyClass: true,
                },
                params: {
                    day: {squash: true, value: null},
                    format: {squash: true, value: null},
                }
            })
            .state('admin.workdiary', {
                url: '/workdiary/:id/:day',
                templateUrl: 'app/administrator/statistics/Workdiary.template.html',
                controller: 'AdminWorkdiary as vm',
                params: {
                    day: {squash: true, value: null}
                }
            })
    }
})();