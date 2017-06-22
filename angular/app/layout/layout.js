(function() {
    'use strict';

    angular
        .module('app')
        .config(configure);

    configure.$inject = ['$stateProvider'];

    function configure($stateProvider) {
        $stateProvider
            .state('adminLayout', {
                templateUrl: '/static/app/layout/admin.template.html',
            });
    }
})();
