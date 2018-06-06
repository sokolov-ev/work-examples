(function(){
    'use strict';

    angular
        .module('app')
        .config(route);

    route.$inject = ['$stateProvider'];

    function route($stateProvider) {
        $stateProvider
            .state('manager.project-list', {
                url: '/projects',
                views: {
                    '': {
                        templateUrl: 'app/manager/projects/ProjectList.template.html',
                        controller: 'ManagerProjectList as vm',
                    },
                    'projectCreate@manager.project-list': {
                        templateUrl: 'app/manager/partials/ProjectListCreateModal.template.html',
                    },
                    'projectEdit@manager.project-list': {
                        templateUrl: 'app/manager/partials/ProjectListEditModal.template.html',
                    },
                    'projectDelete@manager.project-list': {
                        templateUrl: 'app/manager/partials/DeleteModal.tmplate.html',
                    },
                }
            })
            .state('manager.project-view', {
                url: '/project/:id',
                templateUrl: 'app/manager/projects/ProjectView.template.html',
                controller: 'ManagerProjectView as vm',
            });
    }
})();