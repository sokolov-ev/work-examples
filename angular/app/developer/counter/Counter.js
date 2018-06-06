(function(){
    'use strict';

    angular
        .module('app')
        .config(route);

    route.$inject = ['$stateProvider'];

    function route($stateProvider) {
        $stateProvider
            .state('developer.counter', {
                url: '/counter',
                templateUrl: 'app/developer/counter/CounterDasboard.template.html',
                controller: 'CounterDasboard as vm',
            });
    }
})();