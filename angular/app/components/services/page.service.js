(function(){
    'use strict';

    angular
        .module('app')
        .factory('Page', Page);

    Page.$inject = [];

    function Page() {
        let title = 'Teamgeist';
        let defaultClases = 'layout-top-nav skin-black ';
        let classes = '';

        return {
            setTitle: function(data) {
                title = data;
            },
            getTitle: function() {
                return title;
            },
            setClasses: function(data) {
                classes = data;
            },
            getClasses: function() {
                return defaultClases + classes;
            },
        };
    }
})();
