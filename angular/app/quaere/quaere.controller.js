(function() {
    'use strict';
    angular
      .module('app')
      .controller('QuaereController', QuaereController);

    QuaereController.$inject = ['$stateParams', '$state', 'Qestion', 'Testing'];

    function QuaereController($stateParams, $state, Qestion, Testing) {
        let vm = this;
        let id = $stateParams.id;
        let CodeMir  = null;
        let textarea = angular.element(document.querySelector('#testingcode'));

        vm.technologies = [];
        vm.answered     = null;
        vm.multiselect  = '';
        vm.image        = null;
        vm.isAnswered   = false;
        vm.created      = 0;
        vm.cheked       = cheked;
        vm.viewQuaere     = viewQuaere;
        vm.updateQuaere   = updateQuaere;
        vm.answeredQuaere = answeredQuaere;
        vm.deleteQuaere   = deleteQuaere;

        vm.form = {
            category: '',
            score: 0,
            question: '',
            answers: [],
        };

        vm.codeResult = {
            out: null,
            err: null
        };

        vm.testingCode = testingCode;

        //////////////////

        function cheked() {
            vm.form.answers.forEach(function(item, key) {
                item.answered = false;

                if (key == vm.answered) {
                    item.answered = true;
                }
            });
        }

        function viewQuaere() {
            Qestion.technologies({}, function(res) {
                vm.technologies = res.data;
            });

            Qestion.get({id: id}, function(response) {
                vm.form.category = response.data.category;
                vm.form.score = parseFloat(response.data.score);
                vm.form.question = response.data.question;
                vm.form.answers = response.data.answers;
                vm.multiselect = response.data.multiselect;
                vm.image = response.data.image;
                vm.isAnswered = response.data.isAnswered;
                vm.created = moment(response.data.created * 1000).format("YYYY-MM-DD HH:mm");

                let modeConf = (vm.form.category == 'php') ? "application/x-httpd-php" : "text/javascript";

                CodeMir = CodeMirror.fromTextArea(textarea[0], {
                    lineNumbers: true,
                    matchBrackets: true,
                    mode: modeConf,
                    indentUnit: 4,
                    indentWithTabs: true
                });
            });
        }
        viewQuaere();

        function updateQuaere(data) {
            Qestion.update({id: id}, data, function(response) {
                if (response.status == 'ok') {
                    location.reload();
                }
            });
        }

        function deleteQuaere() {
            Qestion.delete({id: id}, function(response) {
                $("#delteQuere").modal('hide');

                if (response.status == 'ok') {
                    $state.go('questions');
                }

                if (response.status == 'bad') {
                    location.reload();
                }
            });
        }

        function answeredQuaere() {
            Qestion.answered({id: id}, function(response) {
                if (response.status == 'ok') {
                    vm.isAnswered = response.data;
                }
            });
        }

        function testingCode() {
            CodeMir.save();

            if (vm.form.category == 'php') {
                Testing.send({code: textarea.val()}, function(res) {
                    vm.codeResult = res.result;
                });
            } else {
                try {
                    vm.codeResult.out = eval(textarea.val());
                } catch (e) {
                    vm.codeResult.err = e.message;
                }
            }
        }
    }
})();
