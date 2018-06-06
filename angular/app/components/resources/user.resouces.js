(function(){
    'use strict';

    angular
        .module('app')
        .factory('User', User);

    User.$inject = ['$resource', 'config'];

    function User($resource, config) {
        return $resource(config.url + '/user/:controller/:id',
        {
            controller: '@controller',
            id: '@id',
        },
        {
            getListDevelopers: {
                method: 'POST',
                params: {
                    controller: 'table'
                }
            },
            getManagerDevelopers: {
                method: 'POST',
                params: {
                    controller: 'manager-table'
                }
            },
            getUser: {
                method: 'GET',
                params: {
                    controller: 'developer'
                }
            },
            createUser: {
                method: 'POST',
                params: {
                    controller: 'developer'
                }
            },
            editUser: {
                method: 'PUT',
                params: {
                    controller: 'developer'
                }
            },
            deleteUser: {
                method: 'DELETE',
                params: {
                    controller: 'developer'
                }
            },
            actualRemoval: {
                method: 'DELETE',
                params: {
                    controller: 'actual-delete'
                }
            },
        });
    }
})();
