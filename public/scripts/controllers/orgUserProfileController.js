/** Pillsy
*  @author  Chuks Onwuneme
*  @version 1.0
*  @package OrgUserProfileController AngularJS module  
*/

var app = angular.module('OrgUserProfileController', ['xeditable']);     //instantiates OrgUserProfileController module
app.controller('orgUserProfileController', function ($scope, $filter, $window, $rootScope, apiService, stateService) {
	'use strict';

  var groups = stateService.getUserGroups();
  $rootScope.$emit("my_groups_callback", {groups: groups});

	initUser();

    $scope.postFirstname = function(firstname){

    	var dataObj = {
        	'firstname': firstname
      	};  

      	callUpdate(dataObj);
    }

    $scope.postLastname = function(lastname){

      	var dataObj = {
        	'lastname': lastname
      	};  

      	callUpdate(dataObj);
    }

    $scope.postTitle = function(title){

      	var dataObj = {
        	'title': title
      	};  

      	callUpdate(dataObj);
    }

    $scope.postPhone = function(phone){

      	var dataObj = {
        	'phone': phone
      	};  

      	callUpdate(dataObj);
    }

    $scope.postPassword = function(password){

      	var dataObj = {
        	'password': password
      	};  

      	callUpdate(dataObj);
    }

    function initUser(){
    	console.log('orgUserProfileController - initUser');

    	var user = stateService.getUser();

		  $scope.user = {
	      	firstname:  user.firstname,
	      	lastname:   user.lastname,
	      	email:      user.email,
	      	title:      user.title,
	      	phone:      user.phone
	    };

    }

    function callUpdate(dataObj){
    	console.log('orgUserProfileController - callUpdate');

      var user = stateService.getUser();
    	var api = '/v1/a/organization/user/'+user.id;

    	apiService.put(api, dataObj).then(function(result){
          	console.log('orgUserProfileController - apiService.put - result is: '+JSON.stringify(result));

          	if (result.msg == 'success'){
            	console.log('orgUserProfileController - apiService.put - success');

           		var pillsyObj  = JSON.parse($window.sessionStorage.pillsy);
           		pillsyObj.user = result.data;

		        $window.sessionStorage.pillsy = JSON.stringify(pillsyObj);
		        initUser();
          	}
          	else{
            	console.log('orgUserProfileController - apiService.put - error: '+result.msg);

            	//$scope.editableForm.$setError(result.msg, 'bla bla bla');
            	initUser();
            }
        });
    }

});