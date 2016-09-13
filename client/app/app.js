'use strict';

angular.module('shopnxApp', [
  'ngCookies',
  'ngResource',
  'ngAnimate',
  'toastr',
  'ngSanitize',
  'btford.socket-io',
  'ui.router',
  //'ui.bootstrap',
  'tableSort',
  'checklist-model',
  'rzModule',
  'infinite-scroll',
  'darthwade.dwLoading',
  'angularMoment',
  'ui.select',
  'ngMaterial',
  'ngTouch', 
  'ngFader',
  'ngFaderMP',
  'ngFaderOI',
  'irontec.simpleChat',
  'ui.bootstrap',
  'ngPasswordStrength',
  'naif.base64',
  'sir-accordion',
  // Angular modules
    'ngFabForm',
    'ngMessages',

    // Custom modules 

    // 3rd Party Modules
    'angularify.semantic.dropdown',
    'angularify.semantic.wizard',
    'ngCart',
    '720kb.tooltips',
    'angularSpinner',
    'ngAutodisable'
  
])
  .config(function ($stateProvider, $urlRouterProvider, $locationProvider, $httpProvider) {
    $urlRouterProvider
      .otherwise('/');
    $locationProvider.html5Mode(true);
    $httpProvider.interceptors.push('authInterceptor');
  })

  .factory('authInterceptor', function ($rootScope, $q, $cookieStore, $location) {
    return {
      // Add authorization token to headers
      request: function (config) {
        config.headers = config.headers || {};
        if ($cookieStore.get('token')) {
          config.headers.Authorization = 'Bearer ' + $cookieStore.get('token');
        }
        return config;
      },

      // Intercept 401s and redirect you to login
      responseError: function(response) {
        if(response.status === 401) {
          $location.path('/login');
          // remove any stale tokens
          $cookieStore.remove('token');
          return $q.reject(response);
        }
        else {
          return $q.reject(response);
        }
      }
    };
  })

  .directive("passwordVerify", function() {
   return {
      require: "ngModel",
      scope: {
        passwordVerify: '='
      },
      link: function(scope, element, attrs, ctrl) {
        scope.$watch(function() {
            var combined;

            if (scope.passwordVerify || ctrl.$viewValue) {
               combined = scope.passwordVerify + '_' + ctrl.$viewValue; 
            }                    
            return combined;
        }, function(value) {
            if (value) {
                ctrl.$parsers.unshift(function(viewValue) {
                    var origin = scope.passwordVerify;
                    if (origin !== viewValue) {
                        ctrl.$setValidity("passwordVerify", false);
                        return undefined;
                    } else {
                        ctrl.$setValidity("passwordVerify", true);
                        return viewValue;
                    }
                });
            }
        });
     }
   };
})
  .directive('wallopSlider', function () {
    return {
      template: '<div class="wallop-slider {{animationClass}}"><ul class="wallop-slider__list"><li class="wallop-slider__item {{itemClasses[$index]}}" ng-repeat="i in images"><img src="{{i}}"></li></ul><button ng-show="images.length>1" class="st-button wallop-slider__btn wallop-slider__btn--previous btn btn--previous" ng-disabled="prevDisabled" ng-click="onPrevButtonClicked()">Previous</button><button ng-show="images.length>1" class="st-button wallop-slider__btn wallop-slider__btn--next btn btn--next" ng-disabled="nextDisabled" ng-click="onNextButtonClicked()">Next</button></div>',
      restrict: 'EA',
      transclude: true,
      replace: false,
      scope: {
        images: '=',
        animation: '@',
        currentItemIndex: '=',
        onNext: '&',
        onPrevious: '&'
      },
      controller: function($scope, $timeout) {

        $scope.itemClasses = [];

        $scope.$watch('images', function(images) {
          if (images.length) {
            _goTo(0);
          }
        });

        $scope.$watch('itemClasses', function(itemClasses) {
          console.log('itemClasses', itemClasses);
        });

        // set animation class corresponding to animation defined in CSS. e.g. rotate, slide
        if ($scope.animation) {
          $scope.animationClass = 'wallop-slider--' + $scope.animation;
        }

        var _displayOptions = {
          btnPreviousClass: 'wallop-slider__btn--previous',
          btnNextClass: 'wallop-slider__btn--next',
          itemClass: 'wallop-slider__item',
          currentItemClass: 'wallop-slider__item--current',
          showPreviousClass: 'wallop-slider__item--show-previous',
          showNextClass: 'wallop-slider__item--show-next',
          hidePreviousClass: 'wallop-slider__item--hide-previous',
          hideNextClass: 'wallop-slider__item--hide-next'
        };

        function updateClasses() {
          if ($scope.itemClasses.length !== $scope.images.length) {
            $scope.itemClasses = [];
            for (var i=0; i<$scope.images.length; i++) {
              $scope.itemClasses.push('');
            }
          }
        }
        function _nextDisabled() {
          console.log('$scope.currentItemIndex', $scope.currentItemIndex, $scope.images.length);

          return ($scope.currentItemIndex + 1) === $scope.images.length;
        }
        function _prevDisabled() {
          return !$scope.currentItemIndex;
        }
        function _updatePagination() {
          $scope.nextDisabled = _nextDisabled();
          $scope.prevDisabled = _prevDisabled();
        }
        function _clearClasses() {
          for (var i=0; i<$scope.images.length; i++) {
            $scope.itemClasses[i] = '';
          }

        }

        // go to slide
        function _goTo(index) {
          console.log('_goTo', index);
          if (index >= $scope.images.length || index < 0 || index === $scope.currentItemIndex) {

            if (!index) {
              $scope.itemClasses[0] = _displayOptions.currentItemClass;
            }
            return;
          }

          _clearClasses();

          $scope.itemClasses[$scope.currentItemIndex] = (index > $scope.currentItemIndex) ? _displayOptions.hidePreviousClass : _displayOptions.hideNextClass;

          var currentClass = (index > $scope.currentItemIndex) ? _displayOptions.showNextClass : _displayOptions.showPreviousClass;
          $scope.itemClasses[index] = _displayOptions.currentItemClass + ' ' + currentClass;

          $scope.currentItemIndex = index;

          _updatePagination();

        }

        // button event handlers
        // consider using the ng-tap directive to remove delay
        $scope.onPrevButtonClicked = function () {
          _goTo($scope.currentItemIndex - 1);
        };
        $scope.onNextButtonClicked = function () {
          _goTo($scope.currentItemIndex + 1);
        };
        
        $scope.$watch('currentItemIndex', function(newVal, oldVal) {
          if (oldVal > newVal) {
            if (typeof $scope.onPrevious === 'function') {
              $scope.onPrevious();
            }
          } else {
            if (typeof $scope.onNext === 'function') {
              $scope.onNext();
            }
          }
        });

      }
    };
})
.config(function($mdThemingProvider) {
  // Extend the red theme with a different color and make the contrast color black instead of white.
  // For example: raised button text will be black instead of white.
  var neonRedMap = $mdThemingProvider.extendPalette('red', {
    '500': '#ff0000',
    'contrastDefaultColor': 'dark'
  });
  // Register the new color palette map with the name <code>neonRed</code>
  $mdThemingProvider.definePalette('neonRed', neonRedMap);
  // Use that theme for the primary intentions
  $mdThemingProvider.theme('default')
    .primaryPalette('neonRed');
})
  .run(function ($rootScope, Auth, $state) {

    // Redirect to login if route requires auth and you're not logged in
    $rootScope.$on('$stateChangeStart', function (event, next) {
      Auth.isLoggedInAsync(function(loggedIn) {
        if (next.authenticate && !loggedIn) {
          event.preventDefault();
          Auth.saveAttemptUrl();
          $state.go('login');
        }
      });
    });

    $rootScope.$on('$stateChangeSuccess', function (evt, toState) {
        window.document.title = toState.title + ' - Aardath';
    });

    $rootScope.spinner = {
      active: false,
      on: function () {
        this.active = true;
      },
      off: function () {
        this.active = false;
      }
    };
  })

  .value('paymentMethods', [
            { name: 'PayPal', icon: 'paypal' },
             { name: 'PayNow', icon: 'paynow' },
              { name: 'Visa', icon: 'Visa' },
               { name: 'Master', icon: 'paynow' }
           
           
           
        ])
        .value('adslItems', [
            { id: 'adsl1', image: "homebasic.png", name: "ADSL Home Basic", adsl_package: ["Download Allowance 2GB", "Monthly Fee (No Contract)", "Download Speed of up to 1Mbps"], price: "15" },
            { id: 'adsl2', image: "homeplus.png", name: "ADSL Home Plus", adsl_package: ["Download Allowance 10GB", "Monthly Fee (No Contract)", "Download Speed of up to 1Mbps"], price: "25" },
            { id: 'adsl3', image: "homepremier.png", name: "ADSL Home Premier", adsl_package: ["Download Allowance 25GB", "Monthly Fee (No Contract)", "Download Speed of up to 1Mbps"], price: "42" },
            { id: 'adsl4', image: "infinitypro.png", name: "ADSL Infinity Pro", adsl_package: ["Monthly Fee (No Contract)", "Download Speed of up to 1Mbps"], price: "89" },
            { id: 'adsl5', image: "infinitymaster.png", name: "ADSL Infinity Master", adsl_package: ["Monthly Fee (No Contract)", "Download Speed of up to 2Mbps"], price: "125" },
            { id: 'adsl6', image: "infinitysupreme.png", name: "ADSL Infinity Supreme", adsl_package: ["Monthly Fee (No Contract)", "Download Speed of up to 4Mbps"], price: "150" }
        ])
        .value('wifiItems', [
            { id: 'wifi1', image: "3kg-300x300.png", name: "3 KG ", price: "1.00" },
            { id: 'wifi2', image: "5kg-300x300.png", name: "5 KG ", price: "2.00" },
            { id: 'wifi3', image: "9kg-300x300.png", name: "9 KG ", price: "5.00" },
            { id: 'wifi3', image: "comboo-300x300.png", name: "Combo Bundle", price: "7.00" }
            
        ])
        .value('months', [
            { value: '01', name: 'January' },
            { value: '02', name: 'February' },
            { value: '03', name: 'March' },
            { value: '04', name: 'April' },
            { value: '05', name: 'May' },
            { value: '06', name: 'June' },
            { value: '07', name: 'July' },
            { value: '08', name: 'August' },
            { value: '09', name: 'September' },
            { value: '10', name: 'October' },
            { value: '11', name: 'November' },
            { value: '12', name: 'December' }
        ])
        .value('countries', [
            { "code": "af", "name": "Afghanistan" },
            { "code": "ax", "name": "Aland Islands" },
            { "code": "al", "name": "Albania" },
            { "code": "dz", "name": "Algeria" },
            { "code": "as", "name": "American Samoa" },
            { "code": "ad", "name": "Andorra" },
            { "code": "ao", "name": "Angola" },
            { "code": "ai", "name": "Anguilla" },
            { "code": "ag", "name": "Antigua" },
            { "code": "ar", "name": "Argentina" },
            { "code": "am", "name": "Armenia" },
            { "code": "aw", "name": "Aruba" },
            { "code": "au", "name": "Australia" },
            { "code": "at", "name": "Austria" },
            { "code": "az", "name": "Azerbaijan" },
            { "code": "bs", "name": "Bahamas" },
            { "code": "bh", "name": "Bahrain" },
            { "code": "bd", "name": "Bangladesh" },
            { "code": "bb", "name": "Barbados" },
            { "code": "by", "name": "Belarus" },
            { "code": "be", "name": "Belgium" },
            { "code": "bz", "name": "Belize" },
            { "code": "bj", "name": "Benin" },
            { "code": "bm", "name": "Bermuda" },
            { "code": "bt", "name": "Bhutan" },
            { "code": "bo", "name": "Bolivia" },
            { "code": "ba", "name": "Bosnia" },
            { "code": "bw", "name": "Botswana" },
            { "code": "bv", "name": "Bouvet Island" },
            { "code": "br", "name": "Brazil" },
            { "code": "vg", "name": "British Virgin Islands" },
            { "code": "bn", "name": "Brunei" },
            { "code": "bg", "name": "Bulgaria" },
            { "code": "bf", "name": "Burkina Faso" },
            { "code": "ar", "name": "Burma" },
            { "code": "bi", "name": "Burundi" },
            { "code": "tc", "name": "Caicos Islands" },
            { "code": "kh", "name": "Cambodia" },
            { "code": "cm", "name": "Cameroon" },
            { "code": "ca", "name": "Canada" },
            { "code": "cv", "name": "Cape Verde" },
            { "code": "ky", "name": "Cayman Islands" },
            { "code": "cf", "name": "Central African Republic" },
            { "code": "td", "name": "Chad" },
            { "code": "cl", "name": "Chile" },
            { "code": "cn", "name": "China" },
            { "code": "cx", "name": "Christmas Island" },
            { "code": "cc", "name": "Cocos Islands" },
            { "code": "co", "name": "Colombia" },
            { "code": "km", "name": "Comoros" },
            { "code": "cg", "name": "Congo Brazzaville" },
            { "code": "cd", "name": "Congo" },
            { "code": "ck", "name": "Cook Islands" },
            { "code": "cr", "name": "Costa Rica" },
            { "code": "ci", "name": "Cote Divoire" },
            { "code": "hr", "name": "Croatia" },
            { "code": "cu", "name": "Cuba" },
            { "code": "cy", "name": "Cyprus" },
            { "code": "cz", "name": "Czech Republic" },
            { "code": "dk", "name": "Denmark" },
            { "code": "dj", "name": "Djibouti" },
            { "code": "dm", "name": "Dominica" },
            { "code": "do", "name": "Dominican Republic" },
            { "code": "ec", "name": "Ecuador" },
            { "code": "eg", "name": "Egypt" },
            { "code": "sv", "name": "El Salvador" },
            { "code": "gb", "name": "England" },
            { "code": "gq", "name": "Equatorial Guinea" },
            { "code": "er", "name": "Eritrea" },
            { "code": "ee", "name": "Estonia" },
            { "code": "et", "name": "Ethiopia" },
            { "code": "eu", "name": "European Union" },
            { "code": "fk", "name": "Falkland Islands" },
            { "code": "fo", "name": "Faroe Islands" },
            { "code": "fj", "name": "Fiji" },
            { "code": "fi", "name": "Finland" },
            { "code": "fr", "name": "France" },
            { "code": "gf", "name": "French Guiana" },
            { "code": "pf", "name": "French Polynesia" },
            { "code": "tf", "name": "French Territories" },
            { "code": "ga", "name": "Gabon" },
            { "code": "gm", "name": "Gambia" },
            { "code": "ge", "name": "Georgia" },
            { "code": "de", "name": "Germany" },
            { "code": "gh", "name": "Ghana" },
            { "code": "gi", "name": "Gibraltar" },
            { "code": "gr", "name": "Greece" },
            { "code": "gl", "name": "Greenland" },
            { "code": "gd", "name": "Grenada" },
            { "code": "gp", "name": "Guadeloupe" },
            { "code": "gu", "name": "Guam" },
            { "code": "gt", "name": "Guatemala" },
            { "code": "gw", "name": "Guinea-Bissau" },
            { "code": "gn", "name": "Guinea" },
            { "code": "gy", "name": "Guyana" },
            { "code": "ht", "name": "Haiti" },
            { "code": "hm", "name": "Heard Island" },
            { "code": "hn", "name": "Honduras" },
            { "code": "hk", "name": "Hong Kong" },
            { "code": "hu", "name": "Hungary" },
            { "code": "is", "name": "Iceland" },
            { "code": "in", "name": "India" },
            { "code": "io", "name": "Indian Ocean Territory" },
            { "code": "id", "name": "Indonesia" },
            { "code": "ir", "name": "Iran" },
            { "code": "iq", "name": "Iraq" },
            { "code": "ie", "name": "Ireland" },
            { "code": "il", "name": "Israel" },
            { "code": "it", "name": "Italy" },
            { "code": "jm", "name": "Jamaica" },
            { "code": "jp", "name": "Japan" },
            { "code": "jo", "name": "Jordan" },
            { "code": "kz", "name": "Kazakhstan" },
            { "code": "ke", "name": "Kenya" },
            { "code": "ki", "name": "Kiribati" },
            { "code": "kw", "name": "Kuwait" },
            { "code": "kg", "name": "Kyrgyzstan" },
            { "code": "la", "name": "Laos" },
            { "code": "lv", "name": "Latvia" },
            { "code": "lb", "name": "Lebanon" },
            { "code": "ls", "name": "Lesotho" },
            { "code": "lr", "name": "Liberia" },
            { "code": "ly", "name": "Libya" },
            { "code": "li", "name": "Liechtenstein" },
            { "code": "lt", "name": "Lithuania" },
            { "code": "lu", "name": "Luxembourg" },
            { "code": "mo", "name": "Macau" },
            { "code": "mk", "name": "Macedonia" },
            { "code": "mg", "name": "Madagascar" },
            { "code": "mw", "name": "Malawi" },
            { "code": "my", "name": "Malaysia" },
            { "code": "mv", "name": "Maldives" },
            { "code": "ml", "name": "Mali" },
            { "code": "mt", "name": "Malta" },
            { "code": "mh", "name": "Marshall Islands" },
            { "code": "mq", "name": "Martinique" },
            { "code": "mr", "name": "Mauritania" },
            { "code": "mu", "name": "Mauritius" },
            { "code": "yt", "name": "Mayotte" },
            { "code": "mx", "name": "Mexico" },
            { "code": "fm", "name": "Micronesia" },
            { "code": "md", "name": "Moldova" },
            { "code": "mc", "name": "Monaco" },
            { "code": "mn", "name": "Mongolia" },
            { "code": "me", "name": "Montenegro" },
            { "code": "ms", "name": "Montserrat" },
            { "code": "ma", "name": "Morocco" },
            { "code": "mz", "name": "Mozambique" },
            { "code": "na", "name": "Namibia" },
            { "code": "nr", "name": "Nauru" },
            { "code": "np", "name": "Nepal" },
            { "code": "an", "name": "Netherlands Antilles" },
            { "code": "nl", "name": "Netherlands" },
            { "code": "nc", "name": "New Caledonia" },
            { "code": "pg", "name": "New Guinea" },
            { "code": "nz", "name": "New Zealand" },
            { "code": "ni", "name": "Nicaragua" },
            { "code": "ne", "name": "Niger" },
            { "code": "ng", "name": "Nigeria" },
            { "code": "nu", "name": "Niue" },
            { "code": "nf", "name": "Norfolk Island" },
            { "code": "kp", "name": "North Korea" },
            { "code": "mp", "name": "Northern Mariana Islands" },
            { "code": "no", "name": "Norway" },
            { "code": "om", "name": "Oman" },
            { "code": "pk", "name": "Pakistan" },
            { "code": "pw", "name": "Palau" },
            { "code": "ps", "name": "Palestine" },
            { "code": "pa", "name": "Panama" },
            { "code": "py", "name": "Paraguay" },
            { "code": "pe", "name": "Peru" },
            { "code": "ph", "name": "Philippines" },
            { "code": "pn", "name": "Pitcairn Islands" },
            { "code": "pl", "name": "Poland" },
            { "code": "pt", "name": "Portugal" },
            { "code": "pr", "name": "Puerto Rico" },
            { "code": "qa", "name": "Qatar" },
            { "code": "re", "name": "Reunion" },
            { "code": "ro", "name": "Romania" },
            { "code": "ru", "name": "Russia" },
            { "code": "rw", "name": "Rwanda" },
            { "code": "sh", "name": "Saint Helena" },
            { "code": "kn", "name": "Saint Kitts and Nevis" },
            { "code": "lc", "name": "Saint Lucia" },
            { "code": "pm", "name": "Saint Pierre" },
            { "code": "vc", "name": "Saint Vincent" },
            { "code": "ws", "name": "Samoa" },
            { "code": "sm", "name": "San Marino" },
            { "code": "gs", "name": "Sandwich Islands" },
            { "code": "st", "name": "Sao Tome" },
            { "code": "sa", "name": "Saudi Arabia" },
            { "code": "sn", "name": "Senegal" },
            { "code": "cs", "name": "Serbia" },
            { "code": "rs", "name": "Serbia" },
            { "code": "sc", "name": "Seychelles" },
            { "code": "sl", "name": "Sierra Leone" },
            { "code": "sg", "name": "Singapore" },
            { "code": "sk", "name": "Slovakia" },
            { "code": "si", "name": "Slovenia" },
            { "code": "sb", "name": "Solomon Islands" },
            { "code": "so", "name": "Somalia" },
            { "code": "za", "name": "South Africa" },
            { "code": "kr", "name": "South Korea" },
            { "code": "es", "name": "Spain" },
            { "code": "lk", "name": "Sri Lanka" },
            { "code": "sd", "name": "Sudan" },
            { "code": "sr", "name": "Suriname" },
            { "code": "sj", "name": "Svalbard" },
            { "code": "sz", "name": "Swaziland" },
            { "code": "se", "name": "Sweden" },
            { "code": "ch", "name": "Switzerland" },
            { "code": "sy", "name": "Syria" },
            { "code": "tw", "name": "Taiwan" },
            { "code": "tj", "name": "Tajikistan" },
            { "code": "tz", "name": "Tanzania" },
            { "code": "th", "name": "Thailand" },
            { "code": "tl", "name": "Timorleste" },
            { "code": "tg", "name": "Togo" },
            { "code": "tk", "name": "Tokelau" },
            { "code": "to", "name": "Tonga" },
            { "code": "tt", "name": "Trinidad" },
            { "code": "tn", "name": "Tunisia" },
            { "code": "tr", "name": "Turkey" },
            { "code": "tm", "name": "Turkmenistan" },
            { "code": "tv", "name": "Tuvalu" },
            { "code": "ug", "name": "Uganda" },
            { "code": "ua", "name": "Ukraine" },
            { "code": "ae", "name": "United Arab Emirates" },
            { "code": "us", "name": "United States" },
            { "code": "uy", "name": "Uruguay" },
            { "code": "um", "name": "Us Minor Islands" },
            { "code": "vi", "name": "Us Virgin Islands" },
            { "code": "uz", "name": "Uzbekistan" },
            { "code": "vu", "name": "Vanuatu" },
            { "code": "va", "name": "Vatican City" },
            { "code": "ve", "name": "Venezuela" },
            { "code": "vn", "name": "Vietnam" },
            { "code": "wf", "name": "Wallis and Futuna" },
            { "code": "eh", "name": "Western Sahara" },
            { "code": "ye", "name": "Yemen" },
            { "code": "zm", "name": "Zambia" },
            { "code": "zw", "name": "Zimbabwe" }
        ]);

  // .run(run);
  // run.$inject = ['$rootScope'];
  // function run ($rootScope) { // The function to display a loading spinner on ajax request
  //
  // }
