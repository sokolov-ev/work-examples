'use strict';

angular
    .module('app')
    .filter('secondsIntoHours', secondsIntoHours);

function secondsIntoHours() {
    return function(input) {
        if (input) {
            let sec_num = parseInt(input, 10);
            let hours   = Math.floor(sec_num / 3600);
            let minutes = Math.floor((sec_num - (hours * 3600)) / 60);

            if (minutes < 10) {
                minutes = '0' + minutes;
            }

            if (hours < 10) {
                hours = '0' + hours;
            }

            return hours + ':' + minutes;
        }

        return '00:00';
    }
}