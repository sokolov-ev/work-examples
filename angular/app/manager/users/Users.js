(function(){
    'use strict';

    angular
        .module('app')
        .config(route);

    route.$inject = ['$stateProvider'];

    function route($stateProvider) {
        $stateProvider
            .state('manager.developers', {
                url: '/developers',
                views: {
                    '': {
                        templateUrl: 'app/manager/users/UserList.template.html',
                        controller: 'ManagerUserList as vm',
                    },
                    'devCreate@manager.developers': {
                        templateUrl: 'app/manager/partials/UserListCreateModal.template.html',
                    },
                    'devEdit@manager.developers': {
                        templateUrl: 'app/manager/partials/UserListEditModal.template.html',
                    },
                    'devDelete@manager.developers': {
                        templateUrl: 'app/manager/partials/DeleteModal.tmplate.html',
                    },
                }
            })
            .state('manager.user-projects', {
                url: '/user-projects/:id',
                templateUrl: 'app/manager/users/UserProjects.template.html',
                controller: 'ManagerUserProjects as vm',
            });
    }
})();