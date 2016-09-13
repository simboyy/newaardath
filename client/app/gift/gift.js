'use strict';

angular.module('shopnxApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('gift', {
        title: 'Details of items in your Gift list',
        url: '/gift',
        templateUrl: 'app/gift/gift.html'
        // controller: 'CartCtrl'
      });
  });
