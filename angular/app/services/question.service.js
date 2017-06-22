// (() => {
//     'use strict';
    
//     angular
//         .module('app')
//         .factory('QestionMg', questionMg);

//     questionMg.$inject = ['$resource', 'appConfig'];

//     function questionMg($resource, appConfig) {
//         return $resource(appConfig.apiRootUrl + '/api/v2/admin/questions', {id: '@id'}, {
//             'all':    {method:'POST', isArray: false},
//             'sync':   {method:'GET'},
//             'save':   {method:'POST'},
//             'remove': {method:'DELETE'},
//             'delete': {method:'DELETE'}
//         });
//     };
// })();


(function(){
    'use strict';

    angular
        .module('app')
        .factory('Qestion', Qestion);

    Qestion.$inject = ['$resource', 'appConfig'];

    function Qestion($resource, appConfig) {

        return $resource(appConfig.apiRootUrl + '/api/questions/:controller/:id/:selection',
        {
            controller: '@controller',
            id: '@id',
            selection: '@selection',
        },
        {
            all: {
                method: 'POST',
                isArray: false
            },
            get: {
                method: 'GET',
            },
            update: {
                method: 'PUT',
            },
            delete: {
                method: 'DELETE',
            },
            answered: {
                method: 'GET',
                params: {
                    controller: 'answered'
                },
            },
            technologies: {
                method: 'GET',
                isArray: false,
                params: {
                    controller: 'technologies',
                    selection: 'one',
                }
            },
            technologiesAll: {
                method: 'GET',
                isArray: false,
                params: {
                    controller: 'technologies',
                    selection: 'all',
                }
            },
            
        });
    }
})();
