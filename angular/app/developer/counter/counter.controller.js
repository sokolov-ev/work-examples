'use strict';

angular
    .module('app')
    .controller('DeveloperCounterController', DeveloperCounterController);

DeveloperCounterController.$inject = ['Page', 'config'];

function DeveloperCounterController(Page, config) {
    let vm = this;
    vm.url = config.server;
    
    /////////
    
    Page.setTitle('Десктоп приложение');

}