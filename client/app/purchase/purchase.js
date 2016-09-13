(function () {
    'use strict';

    // ADSL OR WIFI VOUCHER PURCHASE
    angular.module('shopnxApp').controller('purchase', purchase);

    purchase.$inject = ['$q', 'datacontext', 'ngCart', 'ngFabForm', 'countries', 'paymentMethods', 'months', 'adslItems', 'wifiItems', '$interval'];

    function purchase($q, datacontext, ngCart, ngFabForm, countries, paymentMethods, months, adslItems, wifiItems, $interval) {
        /* jshint validthis:true */
        var vm = this;

        vm.formDisabled = true;
        vm.defaultFormOptions = ngFabForm.config;
        vm.customFormOptions = angular.copy(ngFabForm.config);

        vm.cards = paymentMethods;
        vm.months = months;
        vm.countries = countries;
        vm.items = adslItems;
        vm.wifi_items = wifiItems;
        vm.ngCart = ngCart;
        var count = 1;
        var prefix = '';

        // By Default Spinner is off
        vm.showSpinner = false;

        vm.form = {
            paymentMethod: 'Visa'
        };

        vm.transactionProcessing = {
            status: false,
            type: '',
            header: '',
            orderNumber: '',
            message: '',
            ecocashReference: '',
            ecocashMerchantTrace: ''
        };


        vm.ecoCashConfirmation = false;

        vm.setPaymentMethod = function (name) {
            vm.form.paymentMethod = name;
        }

        vm.setCountry = function (name) {
            vm.form.country = name;
        }
        
        vm.clear = function () {
            if (angular.isDefined(vm.deferred))
                vm.deferred.resolve();
            vm.message = {};
        };

        vm.onlineCard = {};
        vm.ecocash = {};
        vm.teleCash = {};

        vm.isNotValid = function (type) {
            if (type === 'Visa' || type === 'MasterCard')
                return !vm.onlineCard.$valid;
            else if (type === 'EcoCash')
                return !vm.ecocash.$valid;
            else if (type === 'TeleCash')
                return !vm.teleCash.$valid;
            else
                return false;
        }

        vm.validateForms = function (deliveryForm, paymentMethodForm) {
            return deliveryForm || paymentMethodForm;
        }

        vm.getProductName = function (id) {
            var objs = [];
            var name = 'Not Found';
            if (prefix === 'adsl') {
                objs = adslItems;
            }
            else if (prefix === 'wifi') {
                objs = wifiItems;
            } else {
                return name;
            }

            $.each(objs, function (i, v) {
                if (v.id === prefix + '' + id) {
                    name = v.name;
                }
            });
            return name;
        }

        vm.message = {
            type: '',
            heading: '',
            description: '',
            orderNumber: '',
            ecocash: {
                reference: '',
                merchantTrace: ''
            },
            vouchers: ''
        };

        var formData = {
            paymentMethod: vm.form.paymentMethod,
            processingCode: '',
            emailAddress: '',
            mobileNumber: '',
            orderTotal: 0,
            products: ''
        };

        vm.postToProcessor = function (pre) {
            // Get the deferred object
            var deferred = vm.deferred = $q.defer();

            prefix = pre;

            vm.showSpinner = true;

            var url = '';

            if (prefix === 'wifi')
                url = '/wi-fiprocessor.aspx';
            else if (prefix === 'adsl')
                url = '/adslprocessor.aspx';

            var cartItems = ngCart.getItems();
            cartItems = $.grep(cartItems, function (value, index) {
                return value._id.indexOf(prefix) === 0;
            });

            var product = [];
            var total = 0;

            for (var i = 0; i < cartItems.length; i++) {
                var item = [];
                var quantity = 0;
                var cost = 0;
                for (var p in cartItems[i]) {
                    if (p === '_id')
                        item.push((cartItems[i][p]).replace(prefix, ''));
                    if (p === '_quantity') {
                        quantity = cartItems[i][p];
                        item.push(cartItems[i][p]);
                    }
                    if (p === '_price')
                        cost = cartItems[i][p];
                }

                total += cost * quantity;
                product.push(item.join("|"));
            }

            formData = {
                paymentMethod: vm.form.paymentMethod,
                processingCode: '1',
                emailAddress: vm.form.emailAddress,
                mobileNumber: vm.form.mobileNumber,
                orderTotal: total,
                products: product.join(";")
            };

            switch (formData.paymentMethod) {
                case 'Visa':
                case 'MasterCard':
                    $.extend(true, formData, {
                        'cardHolderName': vm.form.cardHolderName,
                        'cardNumber': vm.form.cardNumber,
                        'expiryDate': vm.form.expiryDate.month + '' + vm.form.expiryDate.year,
                        'cvv': vm.form.cvv,
                        'fullName': vm.form.fullName,
                        'addressLine': vm.form.addressLine,
                        'city': vm.form.city,
                        'country': vm.form.country
                    });
                    break;
                case 'EcoCash':
                    $.extend(true, formData, {
                        'number': vm.form.ecoCashNumber
                    });
                    break;
                case 'TeleCash':
                    $.extend(true, formData, {
                        'number': vm.form.teleCashNumber,
                        'otp': vm.form.teleCashOtp
                    });
                    break;
            }

            datacontext.postPurchase(url, formData)
                .then(function (data) {
                    switch (data.response.ResultCode) {
                        case -1:
                            vm.message = {
                                type: 'negative',
                                heading: 'Error',
                                description: data.response.ResultDescription,
                                orderNumber: data.response.OrderNumber,
                                ecocash: {
                                    merchantTrace: data.response.EcocashMerchantTrace,
                                    reference: data.response.EcocashReference
                                }
                            };
                            break;
                        case 0:
                            vm.message = {
                                type: 'negative',
                                heading: 'Error Processing Payment',
                                description: data.response.ResultDescription,
                                orderNumber: data.response.OrderNumber,
                                ecocash: {
                                    merchantTrace: data.response.EcocashMerchantTrace,
                                    reference: data.response.EcocashReference
                                }
                            };
                            break;
                        case 1:
                            switch (formData.paymentMethod) {
                                case 'EcoCash':
                                    vm.message = {
                                        type: 'pending',
                                        description: "<p>Please follow the instructions below to complete the transaction.<br /><a class='ui red tag label'>Dial *151*2*4#</a> <br />Enter your EcoCash PIN <br />Once you have authorised the payment via your handset your transaction will be completed.</p>",
                                        orderNumber: data.response.OrderNumber,
                                        ecocash: {
                                            merchantTrace: data.response.EcocashMerchantTrace,
                                            reference: data.response.EcocashReference
                                        }
                                    };
                                    vm.service = $interval(callHttpService, 6000);
                                    break;
                                default:
                                    vm.message = {
                                        type: 'warning',
                                        heading: prefix.toUpperCase() + ' Purchase Successful',
                                        description: 'Successfully purchased your ' + prefix.toUpperCase() + ' Voucher(s) but failed to retrieve pins. Please get intouch with our Contact Center for assistance',
                                        orderNumber: vm.transactionProcessing.orderNumber
                                    };
                                    break;
                            }
                            break;
                        case 2:
                            vm.message = {
                                type: 'success',
                                heading: prefix.toUpperCase() + ' Purchase Successful',
                                description: 'Successfully purchased your ' + prefix.toUpperCase() + ' Voucher(s)',
                                orderNumber: vm.transactionProcessing.orderNumber,
                                vouchers: data.response.Vouchers
                            };
                            break;
                    }
                }).catch(function (error) {
                    vm.message = {
                        type: 'negative',
                        heading: 'Error',
                        description: error,
                        orderNumber: vm.transactionProcessing.orderNumber
                    };
                }).finally(function () {
                    vm.showSpinner = false;
                });

            return deferred.promise;
        };

        vm.return = function () {
            vm.deferred.resolve();
            vm.message = {};
        };

        function checkEcoCashTrxnStatus() {
            var cartItems = ngCart.getItems();
            cartItems = $.grep(cartItems, function (value, index) {
                return value._id.indexOf(prefix) === 0;
            });

            var url = '';

            if (prefix === 'wifi')
                url = '/wi-fiprocessor.aspx';
            else if (prefix === 'adsl')
                url = '/adslprocessor.aspx';

            var product = [];
            var total = 0;

            for (var i = 0; i < cartItems.length; i++) {
                var item = [];
                var quantity = 0;
                var cost = 0;
                for (var p in cartItems[i]) {
                    if (p === '_id')
                        item.push((cartItems[i][p]).replace(prefix, ''));
                    if (p === '_quantity') {
                        quantity = cartItems[i][p];
                        item.push(cartItems[i][p]);
                    }
                    if (p === '_price')
                        cost = cartItems[i][p];
                }
                total += cost * quantity;
                product.push(item.join("|"));
            }

            datacontext.postPurchase(url, {
                processingCode: 2,
                number: vm.form.ecoCashNumber,
                ecocashMerchantTrace: vm.message.ecocash.merchantTrace,
                orderNumber: vm.message.orderNumber,
                paymentMethod: vm.form.paymentMethod,
                emailAddress: vm.form.emailAddress,
                mobileNumber: vm.form.mobileNumber,
                orderTotal: total,
                products: product.join(";")
            }).then(function (data) {
                switch (data.response.ResultCode) {
                    case -1:
                        vm.message = {
                            type: 'negative',
                            heading: 'Error',
                            description: data.response.ResultDescription,
                            orderNumber: vm.transactionProcessing.orderNumber,
                            ecocash: {
                                merchantTrace: vm.transactionProcessing.ecocashMerchantTrace
                            }
                        };
                        break;
                    case 0:
                        vm.message = {
                            type: 'negative',
                            heading: 'Error Processing Payment',
                            description: data.response.ResultDescription,
                            orderNumber: vm.transactionProcessing.orderNumber,
                            ecocash: {
                                merchantTrace: vm.transactionProcessing.ecocashMerchantTrace
                            }
                        };
                        break;
                    case 1:
                        vm.message = {
                            type: 'warning',
                            heading: prefix.toUpperCase() + ' Purchase Successful',
                            description: 'Successfully purchased your ' + prefix.toUpperCase() + ' Voucher(s) but failed to retrieve pins. Please get intouch with our Contact Center for assistance',
                            orderNumber: vm.transactionProcessing.orderNumber
                        };
                        break;
                    case 2:
                        vm.message = {
                            type: 'success',
                            heading: prefix.toUpperCase() + ' Purchase Successful',
                            description: 'Successfully purchased your ' + prefix.toUpperCase() + ' Voucher(s)',
                            orderNumber: vm.transactionProcessing.orderNumber,
                            vouchers: data.response.Vouchers
                        };
                        break;
                    default:
                        if (count <= 10) {
                            vm.message.type = 'pending';
                        } else {
                            vm.message = {
                                type: 'error',
                                description: 'Error : Failed to Authorise Transaction in time',
                                orderNumber: vm.message.orderNumber,
                                ecocash: {
                                    merchantTrace: vm.message.ecocash.merchantTrace,
                                    reference: vm.message.ecocash.reference
                                }
                            };
                        }
                        break;
                }
            });
        }

        function callHttpService() {
            checkEcoCashTrxnStatus();
            if (count === 10 || vm.message.type !== 'pending')
                $interval.cancel(vm.service);
            ++count;
        }
    }
})();
