(function() {
    'use strict';

    angular
        .module('app')
        .config(configure);

    configure.$inject = ['$stateProvider'];

    function configure($stateProvider) {
        $stateProvider
            .state('questions', {
                url: '/questions',
                parent: 'adminLayout',
                templateUrl: '/static/app/questions/questions.template.html',
                controller: 'QuestionsController as Questions'
            });
    }
})();
