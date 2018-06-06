'use strict';

angular
    .module('app')
    .filter('unixIntoHours', unixIntoHours);

function unixIntoHours() {
    return function(input) {
        if (input) {
            return moment.unix(input).format("HH:mm");
        }

        return '00:00';
    }
}