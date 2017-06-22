(function() {
    'use strict';

    angular
        .module('app')
        .config(configure);

    configure.$inject = ['$stateProvider'];

    function configure($stateProvider) {
        $stateProvider
            .state('quaere', {
                url: '/quaere/:id',
                parent: 'adminLayout',
                templateUrl: '/static/app/quaere/quaere.template.html',
                controller: 'QuaereController as Quaere'
            });
    }
})();
