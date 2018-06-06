'use strict';

angular
    .module('app')
    .controller('AdminProjectList', AdminProjectList);

AdminProjectList.$inject = ['Page', 'Project', '$scope'];

function AdminProjectList(Page, Project, $scope) {
    let vm = this;
    vm.project  = {};
    vm.projects = [];
    vm.ajaxFilter = ajaxFilter;
    vm.setProject = setProject;
    vm.clearProject = clearProject;
    vm.editForm   = editForm;
    vm.createForm = createForm;
    vm.removeProject = removeProject;

    Page.setTitle('Список проектов');

    ///////////

    function ajaxFilter(tableState) {
        Project.getAllProjects({data: tableState}, function(res){
            if (res.success) {
                vm.projects = res.data.projects;
            }
        });
    }

    function setProject(project) {
        vm.project = project;
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

    function editForm(data) {
        Project.editProject({id: vm.project.id}, {data: data}, function(res) {
            if (res.success) {
                // update the projects table.
                $scope.$broadcast('refreshStTable');
            }
        });

        $('#editProject').modal('hide');
    }

    function createForm(data) {
        Project.createProject({data: data}, function(res) {
            if (res.success) {
                // update the projects table.
                $scope.$broadcast('refreshStTable');
            }
        });

        $('#createProject').modal('hide');
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
