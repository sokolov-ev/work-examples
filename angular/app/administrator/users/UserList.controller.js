'use strict';

angular
    .module('app')
    .controller('AdminUserList', AdminUserList);

AdminUserList.$inject = ['$scope', 'Page', 'User', 'Flash', '$timeout', 'Project', '$state', 'Statistics'];

function AdminUserList($scope, Page, User, Flash, $timeout, Project, $state, Statistics) {
    let vm = this;

    vm.user = {};
    vm.users = [];
    vm.listProjects = [];

    vm.deleteModal = {
        title: '',
        description: '',
        removeFunction: removeUser,
    };

    vm.typeUsers = {
        blocked: "Удален",
        client: "Клиент",
        developer: "Разработчик",
        manager: "Менеджер",
        admin: "Админ",
    };

    vm.setUser = setUser;
    vm.clearUser = clearUser;
    vm.ajaxFilter = ajaxFilter;
    vm.createForm = createForm;
    vm.editUser = editUser;
    vm.editForm = editForm;
    vm.viewWorkdiary = viewWorkdiary;
    vm.viewUserProjects = viewUserProjects;

    vm.setScreensModal = setScreensModal;
    vm.setRealUserModal = setRealUserModal;

    Page.setTitle('Список пользователей');

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
        User.getListDevelopers({data: tableState}, function(res) {
            if (res.success) {
                vm.users = _.map(res.data.users, function(value) {
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
    };

    function setUser(data) {
        vm.user = data;
        vm.deleteModal.title = 'Удаление пользователя';
        vm.deleteModal.description = 'Вы действительно хотите удалить разработчика: "' + vm.user.last_name + ' ' + vm.user.first_name + '" ?';
        vm.deleteModal.removeFunction = removeUser;
    };

    function setScreensModal () {
        vm.deleteModal.title = 'Удаление скриншотов';
        vm.deleteModal.description = 'Вы действительно хотите удалить все скриншоты разработчика: "' + vm.user.last_name + ' ' + vm.user.first_name + '" ?';
        vm.deleteModal.removeFunction = removeScreenshots;
    };

    function setRealUserModal () {
        vm.deleteModal.title = 'Фактическое удаление пользователя';
        vm.deleteModal.description = 'Вы действительно хотите разработчика "' + vm.user.last_name + ' ' + vm.user.first_name + '" из БД и все его скриншоты?';
        vm.deleteModal.removeFunction = removeRealUser;
    };

    function clearUser() {
        vm.FormCreate.$setUntouched();
        vm.user = {
            email: '',
            first_name: '',
            last_name: '',
            project: '',
            role: 'developer',
            password: '',
        }
    };

    function createForm(data) {
        User.createUser({data: data}, function(res) {
            if (res.success) {
                let name = res.data.user.first_name + ' ' + res.data.user.last_name;
                Flash.create('success', 'Программист <strong>"' + name + '"</strong> успешно добавлен!');
                // update the user table.
                $scope.$broadcast('refreshStTable');
            }
        })
        .$promise.catch(function (err) {
            Flash.create('danger', '<strong>Пердупреждение!</strong> ' + err.data.errors[0]);
        });

        $('#createUser').modal('hide');
    };

    function editUser(data) {
        User.getUser({id: data.id}, function(res) {
            if (res.success) {
                vm.user = res.data.user;
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
            Flash.create('danger', '<strong>Пердупреждение!</strong> ' + err.data.errors[0]);
        });

        $('#editUser').modal('hide');
    };

    function removeUser () {
        User.deleteUser({id: vm.user.id}, function(res) {
            if (res.success) {
                // update the user table.
                $scope.$broadcast('refreshStTable');
            }
        });

        $('#deleteUser').modal('hide');
    };

    function removeRealUser () {
        User.actualRemoval({id: vm.user.id}, function(res) {
            if (res.success) {
                Flash.create('success', 'Пользователь <strong>"' + vm.user.last_name + ' ' + vm.user.first_name + '"</strong> и все его скриншоты успешно удалены!');

                $scope.$broadcast('refreshStTable');
            }
        })
        .$promise.catch(function (err) {
            Flash.create('danger', '<strong>Пердупреждение!</strong> ' + err.data.errors[0]);
        });

        $('#deleteModal').modal('hide');
        $('#editUser').modal('hide');
    };

    function removeScreenshots () {
        Statistics.removeScreenshots({id: vm.user.id}, function(res) {
            if (res.success) {
                Flash.create('success', 'Скриншоты пользователя <strong>"' + vm.user.last_name + ' ' + vm.user.first_name + '"</strong> успешно удалены!');
            }
        })
        .$promise.catch(function (err) {
            Flash.create('danger', '<strong>Пердупреждение!</strong> ' + err.data.errors[0]);
        });

        $('#deleteModal').modal('hide');
        $('#editUser').modal('hide');
    };

    function viewWorkdiary (userId, userRole, projects) {
        if ((userRole == 'developer' || userRole == 'blocked') && projects.length) {
            $state.go('admin.workdiary', {id: userId});
        }
    };

    function viewUserProjects (userId, projects) {
        if (projects.length) {
            $state.go('admin.user-projects', {id: userId});
        }
    };
}