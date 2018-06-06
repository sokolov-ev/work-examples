'use strict';

angular
    .module('app')
    .controller('ManagerUserList', ManagerUserList);

ManagerUserList.$inject = ['Page', 'User', 'Auth', '$scope', 'Flash', 'Project', '$state'];

function ManagerUserList(Page, User, Auth, $scope, Flash, Project, $state) {
    let vm = this;

    let user = Auth.getUser();
    vm.developer  = null;
    vm.developers = [];
    vm.listProjects = [];

    vm.deleteModal = {
        title: '',
        description: '',
        removeFunction: removeUser,
    };

    vm.ajaxFilter = ajaxFilter; // filter and sort data in the developers table
    vm.setUser    = setUser;    // set the developer which will work
    vm.clearUser  = clearUser;
    vm.createForm = createForm; // sending form with the data of the developer being created
    vm.editUser   = editUser;   // get data for developer editing
    vm.editForm   = editForm;   // sending edited developer data
    vm.viewWorkdiary = viewWorkdiary;
    vm.viewUserProjects = viewUserProjects;

    Page.setTitle('Список программистов');

    initData();

    ////////////

    function initData() {
        Project.getProjects(function(res) {
            if (res.success) {
                vm.listProjects = res.data.projects;
            }
        });
    };

    function ajaxFilter(tableState) {
        if (tableState.search.predicateObject.type === 'all') {
            User.getListDevelopers({data: tableState}, function(res){
                if (res.success) {
                    vm.developers = _.map(res.data.users, function(value) {
                        value.projects = _.map(value.Projects, function(item) { return item.name; });

                        if (value.projects.length == 1) {
                            value.projects_title = value.projects[0];
                            value.projects_tooltip = null;
                        } else if (value.projects.length > 1) {
                            value.projects_title = value.projects.length + ' Проекта';
                            value.projects_tooltip = value.projects.join('\n');
                        }

                        return value;
                    });
                }
            });
        }

        if (tableState.search.predicateObject.type === 'my') {
            tableState.id = user._id;

            User.getManagerDevelopers({data: tableState}, function(res) {
                if (res.success) {
                    vm.developers = _.map(res.data.users, function(value) {
                        value.projects = _.map(value.Projects, function(item) { return item.name; });

                        if (value.projects.length == 1) {
                            value.projects_title = value.projects[0];
                            value.projects_tooltip = null;
                        } else if (value.projects.length > 1) {
                            value.projects_title = value.projects.length + ' Проекта';
                            value.projects_tooltip = value.projects.join('\n');
                        }

                        return value;
                    });
                }
            });
        }
    };

    function setUser(developer) {
        vm.developer = developer;
        vm.deleteModal.title = 'Удаление пользователя';
        vm.deleteModal.description = 'Вы действительно хотите удалить разработчика: "' + vm.developer.last_name + ' ' + vm.developer.first_name + '" ?';
    };

    function clearUser() {
        vm.FormCreate.$setUntouched();
        vm.developer = {
            email: '',
            first_name: '',
            last_name: '',
            project: '',
            password: '',
        }
    };

    function createForm(developer) {
        User.createUser({data: developer}, function(res) {
            if (res.success) {
                let name = res.data.user.first_name + ' ' + res.data.user.last_name;
                Flash.create('success', 'Программист <strong>"' + name + '"</strong> успешно добавлен!');
                // update the user table.
                $scope.$broadcast('refreshStTable');
            }
        })
        .$promise.catch(function (err) {
            Flash.create('warning', '<strong>Пердупреждение!</strong> ' + err.data.errors[0]);
        });

        $('#createDeveloper').modal('hide');
    };

    function editUser(developer) {
        User.getUser({id: developer.id}, function(res){
            if (res.success) {
                vm.developer = res.data.user;
            }
        });
    };

    function editForm(data) {
        User.editUser({id: data.id}, {data: data}, function(res) {
            if (res.success) {
                // update the user table.
                $scope.$broadcast('refreshStTable');
            }
        })
        .$promise.catch(function (err) {
            Flash.create('warning', '<strong>Пердупреждение!</strong> ' + err.data.errors[0]);
        });

        $('#editDeveloper').modal('hide');
    };

    function removeUser() {
        User.deleteUser({id: vm.developer.id}, function(res) {
            if (res.success) {
                // update the user table.
                $scope.$broadcast('refreshStTable');
            }
        });

        $('#deleteModal').modal('hide');
    };

    function viewWorkdiary (userId, userRole, projects) {
        if ((userRole == 'developer' || userRole == 'blocked') && projects.length) {
            $state.go('manager.workdiary', {id: userId});
        }
    };

    function viewUserProjects (userId, projects) {
        if (projects.length) {
            $state.go('manager.user-projects', {id: userId});
        }
    };
}