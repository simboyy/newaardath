(function () {
    'use strict';

    angular.module('shopnxApp').factory('datacontext', datacontext);

    datacontext.$inject = ['$http', '$q'];

    function datacontext($http, $q) {
        function postPurchase(url, data) {
            // Get the deferred object
            var deferred = $q.defer();

            $http({
                method: "POST",
                url: url,
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                transformRequest: function (obj) {
                    var str = [];
                    for (var position in obj) {
                        str.push(position + "=" + obj[position]);
                    }
                    return str.join("&");
                },
                data: data
            }).success(deferred.resolve).error(deferred.reject);

            return deferred.promise;
        }

        function postBillPayment(data) {
            // Get the deferred object
            var deferred = $q.defer();

            $http({
                method: "POST",
                url: "/billpaymentprocessor.aspx",
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                transformRequest: function (obj) {
                    var str = [];
                    for (var position in obj) {
                        str.push(position + "=" + obj[position]);
                    }
                    return str.join("&");
                },
                data: data
            }).success(deferred.resolve).error(deferred.reject);

            return deferred.promise;
        }

        function postZetdcBillPayment(data) {
            // Get the deferred object
            var deferred = $q.defer();

            $http({
                method: "POST",
                url: "/zetdcprocessor.aspx",
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                transformRequest: function (obj) {
                    var str = [];
                    for (var position in obj) {
                        str.push(position + "=" + obj[position]);
                    }
                    return str.join("&");
                },
                data: data
            }).success(deferred.resolve).error(deferred.reject);

            return deferred.promise;
        }

        var service = {
            postPurchase: postPurchase,
            postBillPayment: postBillPayment,
            postZetdcBillPayment: postZetdcBillPayment
        };

        return service;
    }
})();