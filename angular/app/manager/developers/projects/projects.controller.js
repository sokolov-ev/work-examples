'use strict';

angular
    .module('app')
    .controller('ManagerDevProjectsController', ManagerDevProjectsController);

ManagerDevProjectsController.$inject = ['Page', 'User', '$stateParams', 'Project', '$state'];

function ManagerDevProjectsController(Page, User, $stateParams, Project, $state) {
    let vm = this;
    let id = $stateParams.id;
    vm.projects = null;

    ////////////

    User.getUser({id: id}, function(res) {
        if (res.success) {
            Page.setTitle(res.data.user.last_name + ' ' + res.data.user.first_name);
        }
    });

    Project.getUserProjects({id: id}, function(res) {
        if (res.success) {
            vm.projects = res.data.projects;

            // if (vm.projects && vm.projects.length == 1) {
            //     $state.go('manager.developer-work-diary', {id: id, project: vm.projects[0].id});
            // }
        }
    });
}