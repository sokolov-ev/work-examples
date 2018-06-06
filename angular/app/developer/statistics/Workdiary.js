(function(){
    'use strict';

    angular
        .module('app')
        .config(route);

    route.$inject = ['$stateProvider'];

    function route($stateProvider) {
        $stateProvider
            .state('developer.workdiary', {
                url: '/workdiary/:id',
                templateUrl: 'app/developer/statistics/Workdiary.template.html',
                controller: 'DeveloperWorkdiary as vm',
            });
    }
})();