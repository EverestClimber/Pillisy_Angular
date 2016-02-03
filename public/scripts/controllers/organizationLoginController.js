/** Pillsy
*  @author  Chuks Onwuneme
*  @version 1.0
*  @package OrganizationLoginController AngularJS module  
*/

var app = angular.module('OrganizationLoginController', ['theme.core.services']);     //instantiates OrganizationLoginController module
app.controller('organizationLoginController', function ($scope, $http, $theme, $window, apiService, stateService) {
	'use strict';

	$theme.set('fullscreen', true);
	$scope.$on('$destroy', function() {
      	$theme.set('fullscreen', false);
    });

    $scope.submit = function(form) {
      	console.log('organizationLoginController - submitted form...email: '+ $scope.email);
      	console.log('organizationLoginController - submitted form...password: '+ $scope.password);

      	// Trigger validation flag.
      	$scope.submitted = true;

      	var dataObj = {
        	'email':    $scope.email,
        	'password': $scope.password,
      	};  
      
      	var api = '/v1/n/organization/login';
      	console.log('organizationLoginController - apiService.post - api is: '+api);

      	apiService.post(api,dataObj).then(function(result){
          	console.log('organizationLoginController - apiService.post - result is: '+JSON.stringify(result));

          	if (result.msg == 'success'){
                console.log('organizationLoginController - apiService.post - success');

            	  stateService.loginSuccessCallback(result.data);
          	}
          	else{
            	console.log('organizationLoginController - apiService.post - error');

            	// Erase the token if the user fails to log in
            	if ($window.sessionStorage.pillsy){
                	delete $window.sessionStorage.pillsy;
            	}

            	alert(result.msg);
          	}
      	});

      	// Making the fields empty
      	//
      	$scope.email    ='';
      	$scope.password ='';
    };

});
