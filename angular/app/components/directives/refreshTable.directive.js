'use strict';

angular
    .module('app')
    .directive('refreshTable', refreshTable);

function refreshTable() {
    return {
        restrict: 'EA',
        require:'stTable',
        link: function(scope,elem,attr,table) {
            scope.$on('refreshStTable', function() {
                table.pipe(table.tableState());
            });
        }
    }
}
