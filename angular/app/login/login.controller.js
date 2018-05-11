'use strict';

angular
    .module('app')
    .controller('LoginController', LoginController);

LoginController.$inject = ['$localStorage', '$state', 'Auth', 'Flash', 'Page'];

function LoginController($localStorage, $state, Auth, Flash, Page) {
    let vm = this;
    vm.submitForm = submitForm;
    vm.loginForm = {
        email: '',
        passwd: '',
    }

    /////////////

    init();
    
    function init() {
        Page.setTitle('Login page');

        checkAuth();
    }

    function submitForm(data) {
        Auth.login(data)
            .then(function(res) {
                if (res.status) {
                    $localStorage.token = res.data.data.token;
                    checkAuth();
                }
            })
            .catch(function(err) {
                Flash.create('danger', '<strong>Error!</strong> ' + err.data.message);
            });
    };

    function checkAuth()
    {
        if (Auth.isAuthorized()) {
            Auth.defaultRedirect();
        }
    }
}