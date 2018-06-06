(function(){

    'use strict';

    angular
        .module('app', [
            'ui.router',
            'ngResource',
            'ngFlash',
            'ngMessages',
            'smart-table',
            'ui.select',
            'LocalStorageModule',
        ]);

    angular
        .module('app')
        .constant('config', {
            url: `http://${window.location.hostname}:${window.location.port}/dashboard/v1`,
            server: `http://${window.location.hostname}:${window.location.port}`,
        });

    angular
        .module('app')
        .config(configure);

    angular
        .module('app')
        .run(runing);

    configure.$inject = ['$httpProvider', '$locationProvider', '$urlRouterProvider', 'uiSelectConfig', 'localStorageServiceProvider'];

    function configure($httpProvider, $locationProvider, $urlRouterProvider, uiSelectConfig, localStorageServiceProvider) {
        $locationProvider.html5Mode(true);
        $urlRouterProvider.otherwise('/login');

        uiSelectConfig.theme = 'bootstrap';

        $httpProvider.interceptors.push(requestInterceptor);

        localStorageServiceProvider.setPrefix('teamgeist');

        function requestInterceptor($q, Flash, $rootScope, localStorageService) {
            return {
                request: function(config) {
                    config.headers = config.headers || {};
                    let token = localStorageService.get('token');

                    if (token) {
                        config.headers.Authorization = 'Bearer ' + token;
                    }

                    return config;
                },
                requestError: function(config) {
                    return config;
                },
                response: function(res) {
                    return res;
                },
                responseError: function(res) {
                    if (res.status === 401) {
                        if (res.data && !_.isEmpty(res.data.errors)) {
                            Flash.create('danger', '<strong>Ошибка!</strong> ' + res.data.errors[0]);
                        } else {
                            Flash.create('danger', '<strong>Ошибка!</strong> Вы не авторизованы');
                        }

                        localStorageService.remove('token');

                        return $rootScope.$state.go('login');
                    }
                    return $q.reject(res);
                }
            };
        }
    }

    runing.$inject = ['$rootScope', '$state', '$stateParams', 'Page', 'Auth'];

    function runing($rootScope, $state, $stateParams, Page, Auth) {
        $rootScope.$state = $state;
        $rootScope.$stateParams = $stateParams;
        $rootScope.Page = Page;

        moment().locale('ru');

        // check user authorization and role
        $rootScope.$on('$stateChangeStart',
            function (event, toState, toParams, fromState, fromParams) {

                if (toState.data.setBodyClass) {
                    Page.setClasses('select-week');
                } else {
                    Page.setClasses('');
                }

                Auth.checkAccess(event, toState, toParams, fromState, fromParams);
            }
        );
    }

})();
