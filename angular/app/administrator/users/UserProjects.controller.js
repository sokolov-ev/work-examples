'use strict';

angular
    .module('app')
    .controller('AdminUserProjects', AdminUserProjects);

AdminUserProjects.$inject = ['Page', 'User', '$stateParams', 'Project'];

function AdminUserProjects(Page, User, $stateParams, Project) {
    let vm = this;
    let id = $stateParams.id;

    vm.userId = 0;
    vm.userName = '';
    vm.projects = [];

    init();

    ////////////

    function init() {
        User.getUser({id: id}, function(res) {
            if (res.success) {
                vm.userId = res.data.user.id;
                vm.userName = res.data.user.last_name + ' ' + res.data.user.first_name;
                Page.setTitle('Список проектов ' + vm.userName);
            }
        });

        Project.getUserProjects({id: id}, function(res) {
            if (res.success) {
                vm.projects = res.data.projects;
            }
        });
    };
}