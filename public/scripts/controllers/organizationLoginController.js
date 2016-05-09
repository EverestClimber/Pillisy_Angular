/** Pillsy
*  @author  Chuks Onwuneme
*  @version 1.0
*  @package OrganizationLoginController AngularJS module  
*/

var app = angular.module('OrganizationLoginController', ['theme.core.services']);     //instantiates OrganizationLoginController module
app.controller('organizationLoginController', function ($scope, $http, $theme, $window, $location, apiService, stateService) {
	'use strict';

    $scope.login    = true;
    $scope.register = false;
    $scope.message  = false;
    $scope.password = false;

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

    function getSubdomain(){
        console.log('organizationLoginController - getSubdomain');

        var host      = $location.host();
        var parts     = host.split('.');
        var subdomain = null;

        // more than domain.com, will always return the first
        if (parts.length > 2){
            subdomain = parts[0];
            subdomain = subdomain.toLowerCase();
        }

        console.log('organizationLoginController - subdomain is: '+subdomain);

        return subdomain;
    }

    $scope.reset_login_form = function(){
        $scope.email = '';
        $scope.password = '';
    };

    $scope.submit_login_form = function(form) {
      	console.log('organizationLoginController - submitted form...email: '+ $scope.email);
      	console.log('organizationLoginController - submitted form...password: '+ $scope.password);

      	// Trigger validation flag.
      	$scope.submitted = true;
        var subdomain = getSubdomain();

      	var dataObj = {
        	'email':     $scope.email,
        	'password':  $scope.password
      	};  
      
        if (subdomain){
            console.log('organizationLoginController - submitted form..subdomain is not null, proceed...');

            if (dataObj.email){
                console.log('organizationLoginController - got email, proceed...');

                var email = dataObj.email.toLowerCase();

                if ( (email.split(subdomain).length > 0) || (email == 'enterpriseadmin@pillsy.com') ){
                  	var api = '/v1/n/organization/login';
                  	console.log('organizationLoginController - apiService.post - api is: '+api);

                    if (email == 'enterpriseadmin@pillsy.com'){
                        dataObj.subdomain = subdomain;
                    }

                    console.log('organizationLoginController - dataObj: '+JSON.stringify(dataObj) );

                  	apiService.post(api, dataObj).then(function(result){
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
                }
                else{
                    alert('You are not authorized to login to that account with your email');
                }
            }
        }

      	// Making the fields empty
      	$scope.email    ='';
      	$scope.password ='';
    };
});
