(function () {
    'use strict';

    angular
        .module('shopnxApp')
        .factory('common', common);

    common.$inject = ['$q', '$rootScope', '$timeout', '$interval', 'countries', 'paymentMethods', 'months'];

    function common($q, $rootScope, $timeout, $interval, countries, paymentMethods, months) {

        function isDefined(value) {
            return (angular.isDefined(value) && value !== "" && value !== null && typeof value !== "undefined");
        };

        var service = {
            // common angular dependencies
            $q: $q,
            $timeout: $timeout,
            $interval: $interval,
            constants: {
                months: months,
                countries: countries,
                paymentMethods: paymentMethods
            },
            isDefined: isDefined
        };

        return service;
    }
})();