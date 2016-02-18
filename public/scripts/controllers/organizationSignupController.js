/** Pillsy
*  @author  Chuks Onwuneme
*  @version 1.0
*  @package OrganizationSignupController AngularJS module  
*/

var app = angular.module('OrganizationSignupController', ['theme.core.services']);     //instantiates OrganizationSignupController module
app.controller('organizationSignupController', function ($scope, $http, $theme, $window, $timeout, apiService, stateService) {
	'use strict';
        
    $scope.login    = true;
    $scope.register = false;
    $scope.message  = false;
    $scope.password = false;
    $scope.please_accept_agreement = '';
    $scope.result_message = '';

    $scope.toggleVisible = function(view){
        setVisibleView(view);
    };

    function setVisibleView(view){
        switch (view){
            case 'login':
                $scope.login    = true;
                $scope.register = false;
                $scope.message  = false;
                $scope.password = false;
                break;

            case 'register':
                $scope.login    = false;
                $scope.register = true;
                $scope.message  = false;
                $scope.password = false;
                break;

            case 'message':
                $scope.login    = false;
                $scope.register = false;
                $scope.message  = true;
                $scope.password = false;
                break;

            case 'password':
                $scope.login    = false;
                $scope.register = false;
                $scope.message  = false;
                $scope.password = true;
                break;
        }
    };

    $scope.reset_login_form = function(){
        $scope.email_login    = '';
        $scope.password_login = '';
    };

    $scope.submit_login_form = function(form) {
        console.log('organizationLoginController - submitted form...email: '+ $scope.email);
        console.log('organizationLoginController - submitted form...password: '+ $scope.password);

        $scope.loginLoading = true;
        // Trigger validation flag.
        $scope.submitted = true;

        var dataObj = {
            'email':    $scope.email_login,
            'password': $scope.password_login,
        };  
      
        var api = '/v1/n/organization/login';
        console.log('organizationLoginController - apiService.post - api is: '+api);

        apiService.post(api,dataObj).then(function(result){
            console.log('organizationLoginController - apiService.post - result is: '+JSON.stringify(result));
            $scope.loginLoading = false;

            if (result.msg == 'success'){
                console.log('organizationLoginController - apiService.post - success');

                $scope.result_message = '';
                stateService.loginSuccessCallback(result.data);
            }
            else{
                console.log('organizationLoginController - apiService.post - error');

                // Erase the token if the user fails to log in
                if ($window.sessionStorage.pillsy){
                    delete $window.sessionStorage.pillsy;
                }

                $scope.result_message = result.msg;
                setVisibleView('message');
            }
        });

        // Making the fields empty
        //
        $scope.email_login    ='';
        $scope.password_login ='';
    };

    $scope.submit_password_reset_form = function(){
        if (!$scope.email_forgot){
            $scope.email_forgot_required = 'Email required';
            $timeout(function (){ 
                $scope.email_forgot_required = '';
            }, 2000); 
        }
        else{
            $scope.forgotLoading = true;
            var dataObj = {
                'email':  $scope.email_forgot
            };

            var api = '/v1/n/organization/user/forgotpassword';
            console.log('apiService.post - api is: '+api);

            apiService.post(api,dataObj).then(function(result){
                console.log('apiService.post - result is: '+JSON.stringify(result));
                $scope.forgotLoading = false;
                $scope.email_forgot = '';
                
                if (result.msg == 'success'){
                    console.log('apiService.post - success');

                    $scope.result_message = 'An email has been sent to you. Please check your a few '+
                                            'minutes for futther instructions to reset your password.';
                }
                else{
                    console.log('apiService.post - error');

                    $scope.result_message = result.msg;
                }

                setVisibleView('message');
            });
        }
    };

    $scope.submit_register_form = function(form) {
        console.log('submitted form...firstname: '+ $scope.firstname);
        console.log('submitted form...lastname: '+ $scope.lastname);
        console.log('submitted form...title: '+ $scope.title);
        console.log('submitted form...email: '+ $scope.email);
        console.log('submitted form...password: '+ $scope.password);
        console.log('submitted form...confirm_password: '+ $scope.confirm_password);

        if (!$scope.firstname){
            $scope.firstname_required = 'Firstname required';
            $timeout(function (){ 
                $scope.firstname_required = '';
            }, 2000); 
        }
        else if (!$scope.lastname){
            $scope.lastname_required = 'Lastname required';
            $timeout(function (){ 
                $scope.lastname_required = '';
            }, 2000); 
        }
        else if (!$scope.title){
            $scope.title_required = 'Title required';
            $timeout(function (){ 
                $scope.title_required = '';
            }, 2000); 
        }
        else if (!$scope.email_register){
            $scope.email_required = 'Email required';
            $timeout(function (){ 
                $scope.email_required = '';
            }, 2000); 
        }
        else if (!$scope.phone){
            $scope.phone_required = 'Phone required';
            $timeout(function (){ 
                $scope.phone_required = '';
            }, 2000); 
        }
        else if (!$scope.password_register){
            $scope.password_required = 'Password required';
            $timeout(function (){ 
                $scope.password_required = '';
            }, 2000); 
        }
        else if (!$scope.confirm_password){
            $scope.verify_password = 'Please confirm password';
            $timeout(function (){ 
                $scope.verify_password = '';
            }, 2000); 
        }
        else if ($scope.password_register != $scope.confirm_password){
            $scope.verify_password = 'Passwords don\'t match.';
            $timeout(function (){ 
                $scope.verify_password = '';
            }, 2000);
        }
        else if (!$scope.accept_agreement){

            $scope.please_accept_agreement = 'Please read and accept the user agreement';
            $timeout(function (){ 
                $scope.please_accept_agreement = '';
            }, 2000);
        }
        else{
            console.log('Passwords match, proceed with registration...');

            // Trigger validation flag.
            $scope.submitted = true;
            $scope.registerLoading = true;

            var dataObj = {
                'firstname':  $scope.firstname,
                'lastname':   $scope.lastname,
                'title':      $scope.title,
                'email':      $scope.email_register,
                'phone':      $scope.phone,
                'password':   $scope.password_register,
            };  
                    
            var api = '/v1/n/organization/register';
            console.log('apiService.post - api is: '+api);

            apiService.post(api,dataObj).then(function(result){
                console.log('apiService.post - result is: '+JSON.stringify(result));
                $scope.registerLoading = false; 
                setVisibleView('message');

                if (result.msg == 'success'){
                    console.log('apiService.post - success');

                    $scope.result_message = 'An activation email has been sent to you. Please check your '+
                                            'email in a few minutes for futther instructions to activate your '+
                                            'account and complete your registration.';
                }
                else{
                    console.log('apiService.post - error');

                    $scope.result_message = result.msg;
                }
            });
        }
    };

    function blinkPattern(element){
        $timeout(function (){ 
            element = '';
        }, 2000); 
    }
});

