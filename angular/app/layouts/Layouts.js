(function(){
    'use strict';

    angular
        .module('app')
        .config(route);

    route.$inject = ['$stateProvider'];

    function route($stateProvider) {
        $stateProvider
            .state('centered', {
                templateUrl: 'app/layouts/Centered.template.html',
            })
            .state('developer', {
                url: '/developer',
                templateUrl: 'app/layouts/Developer.template.html',
                data: {
                    authorized: true,
                    role: 'developer',
                }
            })
            .state('manager', {
                url: '/manager',
                templateUrl: 'app/layouts/Manager.template.html',
                data: {
                    authorized: true,
                    role: 'manager',
                }
            })
            .state('admin', {
                url: '/admin',
                templateUrl: 'app/layouts/Admin.template.html',
                data: {
                    authorized: true,
                    role: 'admin',
                }
            });
    }
})();