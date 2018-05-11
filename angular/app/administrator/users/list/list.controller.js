'use strict';

angular
    .module('app')
    .controller('AdminUsersController', AdminUsersController);

AdminUsersController.$inject = ['$scope', 'Page', 'User', 'Flash'];

function AdminUsersController($scope, Page, User, Flash) {
    let vm = this;
    vm.user = {};
    vm.users = [];
    vm.setUser = setUser;
    vm.clearUser = clearUser;
    vm.ajaxFilter = ajaxFilter;
    vm.createForm = createForm;
    vm.editUser = editUser;
    vm.editForm = editForm;
    vm.removeUser = removeUser;
    vm.generateToken = generateToken;

    Page.setTitle('Список пользователей');

    /////////

    function ajaxFilter(tableState) {
        User.getListDevelopers({data: tableState}, function(res) {
            if (res.success) {
                vm.users = res.data.users;
            }
        });
    }

    function setUser(data) {
        vm.user = data;
    }

    function clearUser() {
        vm.FormCreate.$setUntouched();
        vm.user = {
            email: '',
            first_name: '',
            last_name: '',
            role: 'developer',
            office_loc_token: '',
            password: '',
        }
    }

    function createForm(data) {

        if (data.role != 'developer') {
            data.office_loc_token = '';
        }

        User.createUser({data: data}, function(res) {
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

        $('#createUser').modal('hide');
    }

    function editUser(data) {
        User.getUser({id: data.id}, function(res) {
            if (res.success) {
                vm.user = res.data.user;
            }
        });
    }

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

        $('#editUser').modal('hide');
    }

    function removeUser() {
        User.deleteUser({id: vm.user.id}, function(res) {
            if (res.success) {
                // update the user table.
                $scope.$broadcast('refreshStTable');
            }
        });

        $('#deleteUser').modal('hide');
    }

    function generateToken() {
        vm.user.office_loc_token = Math.random().toString(36).substring(7);;
    }
}