(function() {
    'use strict';
    angular
      .module('app')
      .controller('EditorController', EditorController);

    EditorController.$inject = ['Qestion'];

    function EditorController(Qestion) {
        let vm = this;
        let flag = true;
        vm.total = 0;
        vm.currentCount = 0;
        vm.questions = null;
        vm.technologies = null;
        vm.ajaxFilter = ajaxFilter;

        /////////////
        
        function ajaxFilter(tableState) {
            Qestion.all({data: tableState}, function(res) {
                vm.questions = res.data.questions;

                tableState.pagination.numberOfPages = Math.ceil(res.data.count / tableState.pagination.number);
                vm.total = res.data.count;
                vm.currentCount = tableState.pagination.start + 1;

                if (flag) {
                    init();
                }
            });
        }

        function init() {
            Qestion.technologiesAll({}, function(res) {
                let data = res.data;

                data = _.chain(data)
                        .unshift({_id: 'all', count: vm.total})
                        .map(function(val){
                            val.text = _.startCase(val._id);
                            return val;
                        })
                        .value();

                vm.technologies = data;
                flag = false;
            });
        }
    }
})();
