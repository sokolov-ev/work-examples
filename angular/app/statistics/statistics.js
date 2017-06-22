(function() {
    'use strict';

    angular
        .module('app')
        .config(configure);

    configure.$inject = ['$stateProvider'];

    function configure($stateProvider) {
        $stateProvider
            .state('statistics', {
                url: '/statistics',
                parent: 'adminLayout',
                templateUrl: '/static/app/statistics/statistics.template.html',
                controller: 'StatisticsController as Statistics'
            });
    }
})();
