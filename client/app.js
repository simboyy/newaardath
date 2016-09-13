'use strict';

angular.module('siteApp', [
 
  'ui.router',
  //'ui.bootstrap',
  //'shopnxApp'
  
])
  

  
  .run(function ($rootScope, $state) {

    $rootScope.$on('$stateChangeSuccess', function (evt, toState) {
        window.document.title = toState.title + ' - Aardath';
    });

  });

  // .run(run);
  // run.$inject = ['$rootScope'];
  // function run ($rootScope) { // The function to display a loading spinner on ajax request
  //
  