(function(){
    'use strict';

    angular
        .module('app')
        .config(route);

    route.$inject = ['$stateProvider'];

    function route($stateProvider) {
        $stateProvider
            .state('admin.projects', {
                url: '/projects',
                views: {
                    '': {
                        templateUrl: 'app/administrator/projects/ProjectList.template.html',
                        controller: 'AdminProjectList as vm',
                    },
                    'projectCreate@admin.projects': {
                        templateUrl: 'app/administrator/partials/ProjectListCreateModal.template.html',
                    },
                    'projectEdit@admin.projects': {
                        templateUrl: 'app/administrator/partials/ProjectListEditModal.template.html',
                    },
                    'projectDelete@admin.projects': {
                        templateUrl: 'app/administrator/partials/DeleteModal.tmplate.html',
                    },
                }
            })
            .state('admin.project-view', {
                url: '/project/:id',
                templateUrl: 'app/administrator/projects/ProjectView.template.html',
                controller: 'AdminProjectView as vm',
            });
    }
})();