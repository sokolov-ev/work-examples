'use strict';

angular
    .module('app')
    .controller('AdminViewUserController', AdminViewUserController);

AdminViewUserController.$inject = ['Page', 'User', '$stateParams', 'Project'];

function AdminViewUserController(Page, User, $stateParams, Project) {
    let vm = this;
    let id = $stateParams.id;
    vm.statistic = false;
    vm.projects = null;

    ////////////

    User.getUser({id: id}, function(res) {
        if (res.success) {
            Page.setTitle(res.data.user.last_name + ' ' + res.data.user.first_name);
            
            vm.statistic = res.data.user.role === 'developer';
        }
    });

    Project.getUserProjects({id: id}, function(res) {
        if (res.success) {
            vm.projects = res.data.projects;
        }
    });
}