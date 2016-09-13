(function () {
    'use strict';

    // ZETDC PAYMENT
    angular.module('shopnxApp').controller('zetdcPayment', zetdcPayment);

    zetdcPayment.$inject = ['common', 'datacontext', 'ngFabForm'];

    function zetdcPayment(common, datacontext, ngFabForm) {
        /* jshint validthis:true */
        var vm = this;

        var $q = common.$q;
        var $interval = common.$interval;
        vm.isDefined = common.isDefined;
        vm.const = {
            cards: common.constants.paymentMethods,
            months: common.constants.months,
            countries: common.constants.countries
        };

        var count = 1;
        vm.formDisabled = true;
        vm.defaultFormOptions = ngFabForm.config;
        vm.customFormOptions = angular.copy(ngFabForm.config);

        // By Default Spinner is off
        vm.showSpinner = false;

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

        vm.form = {};

        vm.error = {
            paymentDetails: {
                status: false,
                header: '',
                message: ''
            }
        };

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

        vm.receipt = '';

        vm.verifyDetails = function () {
            vm.showSpinner = true;

            datacontext.postZetdcBillPayment({
                'processingCode': 0,
                'meterNumber': vm.form.meterNumber
            }).then(function (data) {
                var resultCode = data.response.ResultCode;
                if (resultCode === -1) {
                    vm.error.paymentDetails = {
                        status: true,
                        header: 'Error',
                        message: data.response.ResultDescription //'Please try again.'
                    };
                } else if (resultCode === 0) {
                    vm.error.paymentDetails = {
                        status: true,
                        header: 'Error',
                        message: 'Invalid Meter Number'
                    };
                    vm.form.billingFullName = '';
                    vm.form.billingAddress = '';
                } else if (resultCode === 1) {
                    vm.error.paymentDetails = {
                        status: false,
                        header: '',
                        message: ''
                    };
                    vm.form = {
                        paymentMethod: 'Visa',
                        meterNumber: vm.form.meterNumber,
                        billingFullName: data.response.ClientName,
                        clientAddressStreet: data.response.ClientAddressStreet,
                        clientAddressCity: data.response.ClientAddressCity,
                        clientAddressCountry: data.response.ClientAddressCountry,
                        billingAddress: data.response.ClientAddressStreet + ', '
                            + data.response.ClientAddressCity + ', '
                            + data.response.ClientAddressCountry
                    };
                }
            }).catch(function (error) {
                alert("Failed to process ZETDC Prepaid purchase: " + error);
            }).finally(function () {
                vm.showSpinner = false;
            });
        }

        vm.postToProcessor = function () {

        	swal({   title: "123333 7676767 878788",   text: "Enter Phone to recieve Token:",   type: "input",   showCancelButton: true,   closeOnConfirm: false,   animation: "slide-from-top",   inputPlaceholder: "Write something" }, function(inputValue){   if (inputValue === false) return false;      if (inputValue === "") {     swal.showInputError("You need to write something!");     return false   }      swal("Thank you!", "Your Token Has been send to : " + inputValue, "success"); });
            // Get the deferred object
            var deferred = vm.deferred = $q.defer();

            vm.showSpinner = true;

            var formData = {
                paymentMethod: vm.form.paymentMethod,
                processingCode: 1,
                emailAddress: vm.form.emailAddress,
                mobileNumber: vm.form.mobileNumber,
                orderTotal: vm.form.amount,
                meterNumber: vm.form.meterNumber,
                clientName: vm.form.billingFullName,
                clientAddressStreet: vm.form.clientAddressStreet,
                clientAddressCity: vm.form.clientAddressCity
            };

            if (formData.paymentMethod === "Visa" || formData.paymentMethod === "MasterCard") {
                $.extend(true, formData, {
                    cardHolderName: vm.form.cardHolderName,
                    cardNumber: vm.form.cardNumber,
                    expiryDate: vm.form.expiryDate.month + "" + vm.form.expiryDate.year,
                    cvv: vm.form.cvv,
                    fullName: vm.form.fullName,
                    addressLine: vm.form.addressLine,
                    city: vm.form.city,
                    country: vm.form.country
                });
            }
            else if (formData.paymentMethod === "EcoCash") {
                $.extend(true, formData, {
                    number: vm.form.ecoCashNumber
                });
            }
            else if (formData.paymentMethod === "TeleCash") {
                $.extend(true, formData, {
                    number: vm.form.teleCashNumber,
                    otp: vm.form.teleCashOtp
                });
            }

            datacontext.postZetdcBillPayment(formData).then(function (data) {
                vm.viewVouchers = false;

                switch (data.response.ResultCode) {
                    case -1:
                        vm.message = {
                            type: 'negative',
                            heading: 'Error',
                            orderNumber: data.response.OrderNumber,
                            description: data.response.ResultDescription
                        };
                        break;
                    case 0:
                        vm.message = {
                            type: 'negative',
                            heading: 'Error Processing Payment',
                            description: data.response.ResultDescription,
                            orderNumber: data.response.OrderNumber
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
                                    heading: 'Warning: ZETDC Prepaid Voucher Purchase',
                                    description: data.response.ResultDescription,
                                    orderNumber: data.response.OrderNumber
                                };
                                break;
                        }
                        break;
                    case 2:
                        vm.message = {
                            type: 'success',
                            heading: 'ZETDC Prepaid Voucher Purchase Successful',
                            description: 'Successfully purchased your ZETDC Prepaid Voucher',
                            orderNumber: data.response.OrderNumber,
                            voucher: data.response.Voucher,
                            receipt: data.response.Receipt
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
            datacontext.postZetdcBillPayment({
                'paymentMethod': vm.form.paymentMethod,
                'processingCode': 2,
                'number': vm.form.ecoCashNumber,
                'ecocashMerchantTrace': vm.message.ecocash.merchantTrace,
                'orderNumber': vm.message.orderNumber,
                'emailAddress': vm.form.emailAddress,
                'mobileNumber': vm.form.mobileNumber,
                'orderTotal': vm.form.amount,
                'meterNumber': vm.form.meterNumber,
                'clientName': vm.form.billingFullName,
                'clientAddressStreet': vm.form.clientAddressStreet,
                'clientAddressCity': vm.form.clientAddressCity
            }).then(function (data) {
                switch (data.response.ResultCode) {
                    case -1:
                        vm.message.type = 'negative';
                        vm.message.heading = 'Error';
                        vm.message.description = data.response.ResultDescription;
                        break;
                    case 0:
                        vm.message.type = 'negative';
                        vm.message.heading = 'Error Processing Payment';
                        vm.message.description = data.response.ResultDescription;
                        break;
                    case 1:
                        vm.message.type = 'warning';
                        vm.message.heading = 'Warning: ZETDC Prepaid Voucher Purchase';
                        vm.message.description = data.response.ResultDescription;
                        break;
                    case 2:
                        vm.message = {
                            type: 'success',
                            heading: 'Bill Payment Successful',
                            description: 'Your ZETDC Prepaid Electricity Purchase of USD' + vm.form.amount + ' for ' + vm.form.meterNumber + ' has succeeded. Thank you very much.',
                            orderNumber: vm.message.orderNumber,
                            voucher: data.response.Voucher,
                            receipt: data.response.Receipt
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
