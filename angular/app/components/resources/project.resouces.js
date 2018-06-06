(function(){
    'use strict';

    angular
        .module('app')
        .factory('Project', Project);

    Project.$inject = ['$resource', 'config'];

    function Project($resource, config) {

        return $resource(config.url + '/project/:controller/:id/:user/:project',
        {
            controller : '@controller',
            id : '@id'
        },
        {
            getProjects: {
                method: 'GET',
                params: {
                    controller: 'all-projects'
                }
            },
            getAllProjects: {
                method: 'POST',
                params: {
                    controller: 'projects'
                }
            },
            getManagerProjects: {
                method: 'POST',
                params: {
                    controller: 'manager-table'
                }
            },
            getUserProjects: {
                method: 'GET',
                params: {
                    controller: 'user-projects'
                }
            },
            getProjectInfo: {
                method: 'GET',
                params: {
                    controller: 'project'
                }
            },
            createProject: {
                method: 'POST',
                params: {
                    controller: 'project'
                }
            },
            editProject: {
                method: 'PUT',
                params: {
                    controller: 'project'
                }
            },
            deleteProject: {
                method: 'DELETE',
                params: {
                    controller: 'project'
                }
            },
            addUserProject: {
                method: 'POST',
                params: {
                    controller: 'user-add'
                }
            },
            removeUser: {
                method: 'DELETE',
                params: {
                    controller: 'user-remove',
                    user: '@user',
                    project: '@project'
                }
            },
        });
    }
})();
