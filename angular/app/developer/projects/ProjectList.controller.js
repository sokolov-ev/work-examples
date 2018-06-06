'use strict';

angular
    .module('app')
    .controller('DeveloperProjectList', DeveloperProjectList);

DeveloperProjectList.$inject = ['Page', 'Auth', 'Project'];

function DeveloperProjectList(Page, Auth, Project) {
    let vm = this;
    let user = Auth.getUser();
    vm.projects = null;

    /////////

    Page.setTitle('Список проектов');

    Project.getUserProjects({id: user._id}, function(res) {
        if (res.success) {
            vm.projects = res.data.projects;
        }
    });
}