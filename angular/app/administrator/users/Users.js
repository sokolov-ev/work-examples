(function(){
    'use strict';

    angular
        .module('app')
        .config(route);

    route.$inject = ['$stateProvider'];

    function route($stateProvider) {
        $stateProvider
            .state('admin.users', {
                url: '/users',
                views: {
                    '': {
                        templateUrl: 'app/administrator/users/UserList.template.html',
                        controller: 'AdminUserList as vm',
                    },
                    'userCreate@admin.users': {
                        templateUrl: 'app/administrator/partials/UserListCreateModal.template.html',
                    },
                    'userEdit@admin.users': {
                        templateUrl: 'app/administrator/partials/UserListEditModal.template.html',
                    },
                    'userDelete@admin.users': {
                        templateUrl: 'app/administrator/partials/DeleteModal.tmplate.html',
                    },
                }
            })
            .state('admin.user-projects', {
                url: '/user-projects/:id',
                templateUrl: 'app/administrator/users/UserProjects.template.html',
                controller: 'AdminUserProjects as vm',
            });
    }
})();