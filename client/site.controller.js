'use strict';

angular.module('siteApp')
  .controller('SiteCtrl', function ($scope, $rootScope) {
   $scope.message = "Hello from Site Controller"

  })

  .controller('MainSiteCtrl', function ($scope, $state) {

    $scope.message = "Hello From Site Main Controller"

});



