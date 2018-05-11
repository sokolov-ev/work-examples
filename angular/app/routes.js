(function(){
    'use strict';

    angular
        .module('app')
        .config(route);

    route.$inject = ['$stateProvider'];

    function route($stateProvider) {
        $stateProvider
            // auth
            .state('login', {
                url: '/login',
                parent: 'centered',
                templateUrl: 'app/login/login.template.html',
                controller: 'LoginController',
                controllerAs: 'Login',
                data: {
                    authorized: false,
                }
            })
            .state('logout', {
                url: '/logout',
                template: '',
                controller: ['$state', '$localStorage', 'Auth', function($state, $localStorage, Auth) {
                    Auth
                        .logout()
                        .then(function(res) {
                            if (res.data.success) {
                                delete $localStorage.token;
                                $state.go('login');
                            }
                        });
                }],
                data: {
                    authorized: true,
                }
            })
            // layouts
            .state('centered', {
                templateUrl: 'app/layouts/centered.template.html',
            })
            .state('developer', {
                url: '/developer',
                templateUrl: 'app/layouts/developer.template.html',
                controller: 'InitLayoutController',
                data: {
                    authorized: true,
                    role: 'developer',
                }
            })
            .state('manager', {
                url: '/manager',
                templateUrl: 'app/layouts/manager.template.html',
                controller: 'InitLayoutController',
                data: {
                    authorized: true,
                    role: 'manager',
                }
            })
            .state('admin', {
                url: '/admin',
                templateUrl: 'app/layouts/admin.template.html',
                controller: 'InitLayoutController',
                data: {
                    authorized: true,
                    role: 'admin',
                }
            })
            // manager
            .state('manager.developers', {
                url: '/developers',
                views: {
                    '': {
                        templateUrl: 'app/manager/developers/list/list.template.html',
                        controller: 'ManagerDevelopersController',
                        controllerAs: 'Developers'
                    },
                    'devCreate@manager.developers': {
                        templateUrl: 'app/manager/developers/list/partials/modal-create.template.html',
                    },
                    'devEdit@manager.developers': {
                        templateUrl: 'app/manager/developers/list/partials/modal-edit.template.html',
                    },
                    'devDelete@manager.developers': {
                        templateUrl: 'app/manager/developers/list/partials/modal-delete.template.html',
                    },
                }
            })
            .state('manager.developer-projects', {
                url: '/developer/projects/:id',
                templateUrl: 'app/manager/developers/projects/projects.template.html',
                controller: 'ManagerDevProjectsController',
                controllerAs: 'Projects'
            })
            .state('manager.developer-work-diary', {
                url: '/developer/work-diary/:id/:day',
                templateUrl: 'app/manager/developers/workdiary/workdiary.template.html',
                controller: 'ManagerWorkDiaryController',
                controllerAs: 'vm',
                params: {
                    day: {squash: true, value: null}
                }
            })
            .state('manager.project-list', {
                url: '/projects',
                views: {
                    '': {
                        templateUrl: 'app/manager/projects/list/list.template.html',
                        controller: 'ManagerProjectListController',
                        controllerAs: 'ProjectList'
                    },
                    'projectCreate@manager.project-list': {
                        templateUrl: 'app/manager/projects/list/partials/modal-create.template.html',
                    },
                    'projectEdit@manager.project-list': {
                        templateUrl: 'app/manager/projects/list/partials/modal-edit.template.html',
                    },
                    'projectDelete@manager.project-list': {
                        templateUrl: 'app/manager/projects/list/partials/modal-delete.template.html',
                    },
                }
            })
            .state('manager.project-view', {
                url: '/project-view/:id',
                templateUrl: 'app/manager/projects/view/view.template.html',
                controller: 'ManagerProjectViewController',
                controllerAs: 'ProjectView'
            })
            .state('manager.general-statistics', {
                url: '/statistics/:format/:day',
                templateUrl: 'app/manager/statistics/statistics.template.html',
                controller: 'StatisticsManagerController',
                controllerAs: 'vm',
                data: {
                    setBodyClass: true,
                },
                params: {
                    day: {squash: true, value: null},
                    format: {squash: true, value: null},
                }
            })
            // developer
            .state('developer.counter', {
                url: '/counter',
                templateUrl: 'app/developer/counter/counter.template.html',
                controller: 'DeveloperCounterController',
                controllerAs: 'Counter'
            })
            .state('developer.project-list', {
                url: '/project-list',
                templateUrl: 'app/developer/projects/list/list.template.html',
                controller: 'DeveloperProjectListController',
                controllerAs: 'ProjectsList'
            })
            .state('developer.project-view', {
                url: '/project-view/:id',
                templateUrl: 'app/developer/projects/view/view.template.html',
                controller: 'DeveloperProjectViewController as vm',
            })
            // admin
            .state('admin.projects', {
                url: '/projects',
                views: {
                    '': {
                        templateUrl: 'app/administrator/projects/list/list.template.html',
                        controller: 'AdminProjectsController',
                        controllerAs: 'AdminProjects'
                    },
                    'projectCreate@admin.projects': {
                        templateUrl: 'app/administrator/projects/list/partials/modal-create.template.html',
                    },
                    'projectEdit@admin.projects': {
                        templateUrl: 'app/administrator/projects/list/partials/modal-edit.template.html',
                    },
                    'projectDelete@admin.projects': {
                        templateUrl: 'app/administrator/projects/list/partials/modal-delete.template.html',
                    },
                }
            })
            .state('admin.project-view', {
                url: '/project/:id',
                templateUrl: 'app/administrator/projects/view/view.template.html',
                controller: 'AdminProjectViewController',
                controllerAs: 'AdminProjectView'
            })
            .state('admin.general-statistics', {
                url: '/general-statistics',
                templateUrl: 'app/administrator/users/general-statistics/general-statistics.template.html',
                controller: 'GeneralStatisticsController',
                controllerAs: 'GeneralStatistics'
            })
            .state('admin.users', {
                url: '/users',
                views: {
                    '': {
                        templateUrl: 'app/administrator/users/list/list.templete.html',
                        controller: 'AdminUsersController',
                        controllerAs: 'AdminUsers'
                    },
                    'userCreate@admin.users': {
                        templateUrl: 'app/administrator/users/list/partials/modal-create.template.html',
                    },
                    'userEdit@admin.users': {
                        templateUrl: 'app/administrator/users/list/partials/modal-edit.template.html',
                    },
                    'userDelete@admin.users': {
                        templateUrl: 'app/administrator/users/list/partials/modal-delete.template.html',
                    },
                }
            })
            .state('admin.user-projects', {
                url: '/user-projects/:id',
                templateUrl: 'app/administrator/users/projects/projects.template.html',
                controller: 'AdminViewUserController',
                controllerAs: 'AdminViewUser'
            })
            .state('admin.user-statistcs', {
                url: '/user/:id/project/:project',
                templateUrl: 'app/administrator/users/statistics/statistics.template.html',
                controller: 'AdminViewStatisticsController',
                controllerAs: 'AdminViewStatistics'
            })
    }
})();