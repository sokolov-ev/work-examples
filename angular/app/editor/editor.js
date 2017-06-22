(function() {
    'use strict';

    angular
        .module('app')
        .config(configure);

    configure.$inject = ['$stateProvider'];

    function configure($stateProvider) {
        $stateProvider
            .state('editor', {
                url: '/editor',
                parent: 'adminLayout',
                templateUrl: '/static/app/editor/editor.template.html',
                controller: 'EditorController as Editor'
            });
    }
})();
