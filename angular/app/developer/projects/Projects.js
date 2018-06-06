(function(){
    'use strict';

    angular
        .module('app')
        .config(route);

    route.$inject = ['$stateProvider'];

    function route($stateProvider) {
        $stateProvider
            .state('developer.project-list', {
                url: '/project-list',
                templateUrl: 'app/developer/projects/ProjectList.template.html',
                controller: 'DeveloperProjectList as vm',
            })
    }
})();