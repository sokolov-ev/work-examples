(function(){
    'use strict';

    angular
        .module('app')
        .factory('Statistics', Statistics);

    Statistics.$inject = ['$resource', 'config'];

    function Statistics($resource, config) {

        return $resource(config.url + '/statistic/:controller/:id',
        {
            controller : '@controller',
            id : '@id'
        },
        {
            getAllStatistics: {
                method: 'POST',
                params: {
                    controller: 'all-statistics',
                }
            },
            getProjectPeriod: {
                method: 'POST',
                params: {
                    controller: 'period',
                }
            },
            getProjectTotal: {
                method: 'POST',
                params: {
                    controller: 'total',
                }
            },
            getGeneralStatistics: {
                method: 'POST',
                params: {
                    controller: 'general-statistics',
                }
            },
            setOffline: {
                method: 'POST',
                params: {
                    controller: 'set-offline'
                }
            },
            removeStat: {
                method: 'POST',
                params: {
                    controller: 'delete'
                }
            },
            removeScreenshots: {
                method: 'DELETE',
                params: {
                    controller: 'delete-screenshots'
                }
            },
        });
    }
})();
