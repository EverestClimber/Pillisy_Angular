/** Pillsy
*  @author  Chuks Onwuneme
*  @version 1.0
*  @package OrganizationSignupController AngularJS module  
*/

var app = angular.module('OrganizationSignupController', ['theme.core.services'/*, 'APIService'*/]);     //instantiates OrganizationSignupController module
app.controller('organizationSignupController', function ($scope, $http, $theme, $window, $timeout, apiService) {
	'use strict';
        
   	$theme.set('fullscreen', true);

    $scope.$on('$destroy', function() {
    	$theme.set('fullscreen', false);
   	});

    $scope.confirmationSent = false;
    $scope.please_accept_agreement = '';

    $scope.submit = function(form) {
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
        else if (!$scope.email){
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
        else if (!$scope.password){
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
        else if ($scope.password != $scope.confirm_password){
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

            var dataObj = {
                'firstname':  $scope.firstname,
                'lastname':   $scope.lastname,
                'title':      $scope.title,
                'email':      $scope.email,
                'phone':      $scope.phone,
                'password':   $scope.password,
            };  
                    
            var api = '/v1/n/organization/register';
            console.log('apiService.post - api is: '+api);

            apiService.post(api,dataObj).then(function(result){
                console.log('apiService.post - result is: '+JSON.stringify(result));

                if (result.msg == 'success'){
                    console.log('apiService.post - success');

                    $scope.confirmationSent = true;
                }
                else{
                    console.log('apiService.post - error');

                    alert(result.msg);
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

