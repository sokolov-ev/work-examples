(function() {
    'use strict';
    angular
      .module('app')
      .controller('QuestionsController', QuestionsController);

    QuestionsController.$inject = ['Qestion'];

    function QuestionsController(Qestion) {
        let vm = this;
        let flag = true;
        vm.total = 0;
        vm.currentCount = 0;
        vm.questions    = null;
        vm.technologies = null;
        vm.ajaxFilter   = ajaxFilter;
        vm.answer = {
            image: null,
            question: null,
            answers: null,
            multiselect: null,
        };
        vm.getQuestion  = getQuestion;

        /////////////

        function ajaxFilter(tableState) {
            if (_.isEmpty(tableState.search.predicateObject)) {
                tableState.search.predicateObject = {};
            }

            tableState.search.predicateObject['isAnswered'] = "true";

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
            Qestion.technologies({}, function(res) {
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

        function getQuestion(id) {
            Qestion.get({id}, function(res){
                vm.answer.image    = res.data.image;
                vm.answer.question = res.data.question;
                vm.answer.answers  = res.data.answers;
                vm.answer.multiselect = res.data.multiselect;

                $('#modalAnswer').modal('show');
            });
        }
    }
})();
