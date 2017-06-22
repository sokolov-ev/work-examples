(function(){
    'use strict';

    angular
        .module('app')
        .factory('Testing', Testing);

    Testing.$inject = ['$resource', 'appConfig'];

    function Testing($resource, appConfig) {
        return $resource(appConfig.apiRootUrl + '/api/testing/:controller/:id',
        {
            controller : '@controller',
            id : '@id'
        },
        {
            send: {
                method: 'POST',
                params: {
                    controller: 'code',
                },
            },            
        });
    }
})();
