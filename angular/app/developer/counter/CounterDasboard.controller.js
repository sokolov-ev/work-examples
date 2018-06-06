'use strict';

angular
    .module('app')
    .controller('CounterDasboard', CounterDasboard);

CounterDasboard.$inject = ['Page', 'config'];

function CounterDasboard(Page, config) {
    let vm = this;
    vm.url = config.server;

    /////////

    Page.setTitle('Десктоп приложение');

}