'use strict';

angular
    .module('app')
    .controller('ManagerDevelopersController', ManagerDevelopersController);

ManagerDevelopersController.$inject = ['Page', 'User', 'Auth', '$scope', 'Flash', 'Project'];

function ManagerDevelopersController(Page, User, Auth, $scope, Flash, Project) {
    let vm = this;
    let user = Auth.getUser();
    vm.developer  = null;
    vm.developers = [];
    vm.ajaxFilter = ajaxFilter; // filter and sort data in the developers table
    vm.setUser    = setUser;    // set the developer which will work
    vm.clearUser  = clearUser;
    vm.createForm = createForm; // sending form with the data of the developer being created
    vm.editUser   = editUser;   // get data for developer editing
    vm.editForm   = editForm;   // sending edited developer data
    vm.removeUser = removeUser; // removing a developer from the table and database
    vm.listProjects = [];

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
                    vm.developers = res.data.users;
                }
            });
        }

        if (tableState.search.predicateObject.type === 'my') {
            tableState.id = user._id;

            User.getManagerDevelopers({data: tableState}, function(res) {
                if (res.success) {
                    vm.developers = res.data.users;
                }
            });
        }
    }

    function setUser(developer) {
        vm.developer = developer;
    }

    function clearUser() {
        vm.FormCreate.$setUntouched();
        vm.developer = {
            email: '',
            first_name: '',
            last_name: '',
            project: '',
            office_loc_token: '',
            password: '',
        }
    }

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
    }

    function editUser(developer) {
        User.getUser({id: developer.id}, function(res){
            if (res.success) {
                vm.developer = res.data.user;
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

        $('#editDeveloper').modal('hide');
    }

    function removeUser() {
        User.deleteUser({id: vm.developer.id}, function(res) {
            if (res.success) {
                // update the user table.
                $scope.$broadcast('refreshStTable');
            }
        });

        $('#deleteDeveloper').modal('hide');
    }
}