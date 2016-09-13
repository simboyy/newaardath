'use strict';

angular.module('siteApp')

  .config(function ($stateProvider) {
  	
    $stateProvider
      .state('site', {
        title: 'Aardath',
        url: '/',
        templateUrl: './index.html',
        controller: 'SiteCtrl',
       
      })

      .state('about', {
        title: 'Aardath -About',
        url: '/about',
        templateUrl: './about.html',
        controller: 'SiteCtrl',
        
      })
      .state('blog', {
        title: 'Aardath- Blog',
        url: '/blog',
        templateUrl: './blog.html',
        controller: 'SiteCtrl',
        
      })
     .state('businesses', {
        title: 'Aardath-Businesses',
        url: '/businesses',
        templateUrl: './businesses.html',
        controller: 'SiteCtrl',
       
      })
     .state('contact', {
        title: 'Aardath-Contact',
        url: '/contact',
        templateUrl: './contact.html',
        controller: 'SiteCtrl',
        
      });
      
  
  });
