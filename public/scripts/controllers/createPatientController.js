/** Pillsy
*  @author  Chuks Onwuneme
*  @version 1.0
*  @package CreatePatientController AngularJS module  
*/

var app = angular.module('CreatePatientController', [/*'StateService'*/]);     //instantiates CreatePatientController module
app.controller('createPatientController', function ($scope, $filter, $location, $rootScope, apiService, stateService) {
	'use strict';

    console.log('createPatientController');

    if (!$rootScope.active_group){
    	$location.path('/');
    }

    var initVars = function(){
	   	$scope.groupId      = $rootScope.active_group.id;
	    $scope.groupName    = $rootScope.active_group.name;
	    $scope.groupExtName = $rootScope.active_group.identifier;

        console.log('createPatientController - $scope.groupId: '+ $scope.groupId );
        console.log('createPatientController - $scope.groupName: '+ $scope.groupName);
        console.log('createPatientController - $scope.groupExtName: '+ $scope.groupExtName);
	}

	initVars();

    $scope.createPatient = function(patient){

        if (!patient.firstname){
            alert('Firstname required');
        }
        else if (!patient.lastname){
            alert('Lastname required');
        }
        else if (!patient.email){
            alert('Email required');
        }
        else{
            console.log('Passwords match, proceed with registration...');

            // Trigger validation flag.
            $scope.submitted = true;

            var dataObj = {
                'firstname':   patient.firstname,
                'lastname':    patient.lastname,
                'dob':   	   patient.dob,
                'gender':      patient.gender,
                'address1':    patient.address1,
                'address2':    patient.address2,
                'city':        patient.city,
                'state':       patient.state,
                'country':     patient.country,
                'zip':  	   patient.zip,
                'email':       patient.email,
                'phone':       patient.phone,
                'password':    'blablabla'
            };  
                
            var groupId = $scope.groupId;
            var api = '/v1/a/organization/group/'+groupId+'/patient';
            console.log('apiService.post - api is: '+api);

            apiService.post(api,dataObj).then(function(result){
                console.log('apiService.post - result is: '+JSON.stringify(result));

                if (result.msg == 'success'){
                    console.log('apiService.post - success');

                    var patient = result.data;

                    if (stateService.setActivePatient(patient)){
                        $location.path('/group/patient/addmed');
                    }
                    else{
                        $location.path('/groups/mygroups');   
                    }
                }
                else{
                    console.log('apiService.post - error');

                    alert(result.msg);
                }

            });
        }
    }

    $scope.searchPatient= function(patient){
        if (!patient.email){
            alert('Email required');
        }
        else{
            var groupId = $scope.groupId;
            var api = '/v1/a/organization/group/'+groupId+'/patient/groupInvitation';   //basically create a new groupInvitation for this patient to approve

            apiService.post(api, patient).then(function(result){
                if (result.msg == 'success'){
                    console.log('apiService.post - success - found patient, email/sms sent');

                    
                }
                else{
                    console.log('apiService.post - error');

                    alert(result.msg);
                }
            });
        }
    }
});

app.filter('fromNow', function() {
    return function(dateString) {
      	return moment(dateString).fromNow()
    };
});
