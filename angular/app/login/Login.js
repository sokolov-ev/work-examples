(function(){
    'use strict';

    angular
        .module('app')
        .config(route);

    route.$inject = ['$stateProvider'];

    function route($stateProvider) {
        $stateProvider
            .state('login', {
                url: '/login',
                parent: 'centered',
                templateUrl: 'app/login/Login.template.html',
                controller: 'LoginController',
                controllerAs: 'Login',
                data: {
                    authorized: false,
                }
            })
            .state('logout', {
                url: '/logout',
                template: '',
                controller: ['$state', 'Auth', 'localStorageService', function($state, Auth, localStorageService) {
                    Auth
                        .logout()
                        .then(function(res) {
                            if (res.data.success) {
                                localStorageService.remove('token');
                                $state.go('login');
                            }
                        });
                }],
                data: {
                    authorized: true,
                }
            });
    }
})();