(function(){

})();

'use strict';

angular
    .module('app')
    .factory('DateTime', DateTime);

DateTime.$inject = [];

function DateTime() {

    return {
        getHours: function(data) {
            return hours(data);   
        },
    };

    /////////
    
    function hours(data) {
        return moment(data).format('hh:mm');
    }
}