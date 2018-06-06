(function () {
    'use strict';

    angular
        .module('app')
        .directive('onErrorSrc', onErrorSrc);

    function onErrorSrc() {
        return {
            link: function(scope, element, attrs) {
                element.bind('error', function () {
                    attrs.$set('src', '/assets/images/empty-image.png');
                });
            }
        };
    }
})();