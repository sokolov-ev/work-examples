'use strict';

angular
    .module('app')
    .directive('confirmPassword', confirmPassword);


function confirmPassword() {
    return {
        restrict: 'EA',
        require: '?ngModel',
        scope: {
            otherModelValue: "=confirmPassword"
        },
        link: function(scope, elem, attrs, ngModel) {
            if(!ngModel) return; // do nothing if no ng-model

            ngModel.$validators.confirmPassword = function(modelValue) {
                return modelValue == scope.otherModelValue;
            };

            scope.$watch("otherModelValue", function() {
                ngModel.$validate();
            });
        }
    }
}