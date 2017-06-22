(function() {
    'use strict';
    
    angular
      .module('app')
      .controller('StatisticsController', StatisticsController);

    StatisticsController.$inject = ['Statistics'];

    function StatisticsController(Statistics) {
        let vm = this;
        vm.data = null;

        //////////

        function init() {
            Statistics.get(function(res) {
                vm.data = res.data;
            });
        }
        init();
    }
})();
