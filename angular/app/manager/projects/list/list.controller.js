'use strict';

angular
    .module('app')
    .controller('ManagerProjectListController', ManagerProjectListController);

ManagerProjectListController.$inject = ['Page', 'Auth', 'Project', '$scope'];

function ManagerProjectListController(Page, Auth, Project, $scope) {
    let vm = this;
    let user = Auth.getUser();
    vm.project  = {};
    vm.projects = [];
    vm.ajaxFilter = ajaxFilter;
    vm.setProject = setProject;
    vm.editForm   = editForm;
    vm.createForm = createForm;
    vm.clearProject = clearProject;
    vm.removeProject = removeProject;
    
    Page.setTitle('Список проектов');

    ///////////

    function ajaxFilter(tableState) {
        if (tableState.search.predicateObject.projects === 'all') {
            Project.getAllProjects({data: tableState}, function(res){
                if (res.success) {
                    vm.projects = res.data.projects;
                }
            });
        }
        
        if (tableState.search.predicateObject.projects === 'my') {
            Project.getManagerProjects({data: tableState}, function(res) {
                if (res.success) {
                    vm.projects = res.data.projects;
                }
            });
        }
    }

    function setProject(project) {
        vm.project = project;
    }

    function editForm(data) {
        Project.editProject({id: vm.project.id}, {data: data}, function(res) {
            if (res.success) {
                let index = vm.projects.indexOf(vm.project);
                vm.projects[index] = _.assignIn(vm.projects[index], data);
                $('#editProject').modal('hide');
            }
        });
    }

    function createForm(data) {
        Project.createProject({data: data}, function(res) {
            if (res.success) {
                $scope.$broadcast('refreshStTable');
                $('#createProject').modal('hide');
            }
        });
    }

    function clearProject() {
        vm.FormCreate.$setUntouched();
        vm.project = {
            name: '',
            description: '',
            status: 'open',
            type: 'internal',
        };
    }

    function removeProject() {
        Project.deleteProject({id: vm.project.id}, function(res) {
            if (res.success) {
                // update the user table.
                $scope.$broadcast('refreshStTable');
            }
        });

        $('#deleteProject').modal('hide');
    }
}
