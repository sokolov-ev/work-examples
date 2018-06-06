'use strict';

angular
    .module('app')
    .controller('AdminProjectView', AdminProjectView);

AdminProjectView.$inject = ['$stateParams', 'Page', 'Project', 'User', 'Flash'];

function AdminProjectView($stateParams, Page, Project, User, Flash) {
    let vm = this;
    vm.id       = $stateParams.id;
    vm.project  = null;
    vm.user     = {};
    vm.users    = [];
    vm.allUsers = [];

    vm.typeUsers = {
        blocked: "Удален",
        client: "Клиент",
        developer: "Разработчик",
        manager: "Менеджер",
        admin: "Админ",
    };

    vm.selectedUsers     = null;
    vm.addUsers          = addUsers;
    vm.setUserProject    = setUserProject;
    vm.removeUserProject = removeUserProject;

    vm.workTime = 'day';
    vm.getTime  = getTime;

    init();

    ///////////

    function init() {
        Project.getProjectInfo({id: vm.id}, function(res) {
            if (res.success) {
                Page.setTitle(res.data.project.name);
                vm.users = res.data.project.Users;
                vm.project = res.data.project;

                getTime();
            }
        });

        let table = {
            search: {
               predicateObject: {},
            },
            sort: {
                predicate: null,
            }
        };

        User.getListDevelopers({data: table}, function(res){
            if (res.success) {
                vm.allUsers = res.data.users;
            }
        });
    }

    function setUserProject(user) {
        vm.user = user;
    }

    function removeUserProject() {
        Project.removeUser({user: vm.user.id, project: vm.id}, function(res) {
            if (res.success) {
                init();
            }
        })
        .$promise.catch(function (err) {
            Flash.create('warning', '<strong>Пердупреждение!</strong> ' + err.data.errors[0]);
        });

        $('#deleteUserProject').modal('hide');
    }

    function addUsers() {
        _.forEach(vm.selectedUsers, function(user) {
            Project.addUserProject({user: user.id, project: vm.id}, function(res) {
                if (res.success) {
                    init();
                }
            });
        });
    }

    function getTime() {
        let time = moment().startOf('day').unix();

        if (vm.workTime === 'week') {
            time = moment().startOf('week').add(1, 'days').unix();
        }

        if (vm.workTime === 'month') {
            time = moment().startOf('month').add(1, 'days').unix();
        }

        if (vm.workTime === 'all') {
            time = 0;
        }

        vm.users = _.reduce(vm.users, function(result, user, key) {
            user.work_time = _.sumBy(user.Sessions, function(session) {
                return _.sumBy(session.Stats, function(stat) {
                    if (time <= stat.save_time) {
                        return stat.work_time;
                    }
                });
            });

            result[key] = user;

            return result;
        }, []);
    }
}