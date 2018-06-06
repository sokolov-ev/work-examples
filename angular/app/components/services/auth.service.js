(function(){
    'use strict';

    angular
        .module('app')
        .factory('Auth', auth);

    auth.$inject = ['$http', '$state', 'config', 'localStorageService'];

    function auth($http, $state, config, localStorageService) {

        return {
            login: function (data) {
                return $http.post(config.url + '/auth/login', data);
            },
            logout: function () {
                return $http.get(config.url + '/auth/logout');
            },
            getUser: function () {
                return getUser();
            },
            isAuthorized: function () {
                return isAuthorized();
            },
            checkAccess: function(event, toState, toParams, fromState, fromParams) {
                return checkAccess(event, toState, toParams, fromState, fromParams);
            },
            defaultRedirect: function () {
                return defaultRedirect();
            },
        };

        /////////

        function urlBase64Decode(str) {
            let output = str.replace('-', '+').replace('_', '/');
            switch (output.length % 4) {
                case 0:
                    break;
                case 2:
                    output += '==';
                    break;
                case 3:
                    output += '=';
                    break;
                default:
                throw 'Illegal base64url string!';
            }

            return window.atob(output);
        }

        function getUser() {
            let token = localStorageService.get('token');
            let user = {};

            if (token) {
                let encoded = token.split('.')[1];
                user = JSON.parse(urlBase64Decode(encoded));
            }

            return user;
        }

        function isAuthorized() {
            let user = getUser();

            if ((!_.isEmpty(user)) && (user.exp > moment().unix())) {
                return true;
            }

            localStorageService.remove('token');
            return false;
        }

        function checkAccess(event, toState, toParams, fromState, fromParams) {
            if (toState.data !== undefined) {
                if (toState.data.authorized !== undefined && toState.data.authorized && !isAuthorized()) {
                    event.preventDefault();
                    $state.go('login');
                }

                if (toState.data.role !== undefined) {
                    if (!isAuthorized()) {
                        event.preventDefault();
                        $state.go('login');
                    }

                    const user = getUser();

                    if (toState.data.role != user.role) {
                        event.preventDefault();
                        defaultRedirect();
                    }
                }
            }
        }

        function defaultRedirect() {
            const user = getUser();

            if (user.role == 'manager') {
                $state.go('manager.developers');
            } else if (user.role == 'developer') {
                $state.go('developer.project-list');
            } else if (user.role == 'admin') {
                $state.go('admin.users');
            } else {
                localStorageService.remove('token');
                $state.go('login');
            }
        }
    }
})();
