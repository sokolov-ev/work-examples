'use strict';

angular
    .module('app', [
        'ui.router', 
        'ngResource',
        'smart-table',
    ]);

angular
    .module('app')
    .constant('appConfig', {
        apiRootUrl: `http://${window.location.hostname}:${window.location.port}`,
    });

angular
    .module('app')
    .config(configure);

configure.$inject = ['$locationProvider', '$urlRouterProvider'];

function configure($locationProvider, $urlRouterProvider) {
    $locationProvider.html5Mode(true);
    $urlRouterProvider.otherwise("/questions");
}
