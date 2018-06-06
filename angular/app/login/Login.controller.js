'use strict';

angular
    .module('app')
    .controller('LoginController', LoginController);

LoginController.$inject = ['Auth', 'Flash', 'Page', 'localStorageService'];

function LoginController(Auth, Flash, Page, localStorageService) {
    let vm = this;

    vm.loginForm = {
        email: '',
        passwd: '',
    }

    vm.submitForm = submitForm;

    init();

    /////////////

    function init() {
        Page.setTitle('Login page');

        checkAuth();
    };

    function submitForm(data) {
        Auth.login(data)
            .then(function(res) {
                if (res.status) {
                    localStorageService.set('token', res.data.data.token);
                    checkAuth();
                }
            })
            .catch(function(err) {
                Flash.create('danger', '<strong>Error!</strong> ' + err.data.message);
            });
    };

    function checkAuth() {
        if (Auth.isAuthorized()) {
            localStorageService.clearAll(/statistics-dates$/);
            Auth.defaultRedirect();
        }
    };
}