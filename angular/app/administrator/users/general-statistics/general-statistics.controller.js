'use strict';

angular
    .module('app')
    .controller('GeneralStatisticsController', GeneralStatisticsController);

GeneralStatisticsController.$inject = ['Statistics'];

function GeneralStatisticsController(Statistics) {
    let vm = this;
    vm.total = 0;
    vm.users = {};
    vm.ajaxFilter = ajaxFilter;

    /////////////
    
    function ajaxFilter(tableState) {
        Statistics.getGeneralStatistics({data: tableState}, function(res) {
            if (res.success) {
                let result = _.reduce(res.data.users, function(result, user, key) {
                    user.work_time = _.sumBy(user.Sessions, function(session) { 
                        return _.sumBy(session.Stats, function(stat) {
                            return stat.work_time;
                        });
                    });
                    
                    delete user.Sessions;

                    result[key] = user;

                    return result;
                }, []);

                vm.total = _.sumBy(result, function(user) {
                    return user.work_time;
                });
                
                vm.users = result;
            }
        });
    }
}