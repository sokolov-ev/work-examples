(function(){
    'use strict';

    angular
        .module('app')
        .factory('Statistics', Statistics);

    Statistics.$inject = ['$resource', 'appConfig'];

    function Statistics($resource, appConfig) {

        return $resource(appConfig.apiRootUrl + '/api/statistics/:controller/:id',
        {
            controller : '@controller',
            id : '@id'
        },
        {
            get: {
                method: 'GET',
            },            
        });
    }
})();
