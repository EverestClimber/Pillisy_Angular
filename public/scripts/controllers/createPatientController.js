/** Pillsy
*  @author  Chuks Onwuneme
*  @version 1.0
*  @package CreatePatientController AngularJS module  
*/

var app = angular.module('CreatePatientController', []);     //instantiates CreatePatientController module
app.controller('createPatientController', function ($scope, $filter, $location, apiService, stateService) {
	'use strict';

    console.log('createPatientController');

    var pillsy = stateService.getPillsy();

    var toggleForm = function(visible){
        $scope.invite_patient_form   = visible;
        $scope.invite_patient_status = !visible;
    };

    if (!pillsy.active_group) {
        $location.path('/');
    }
    else{
        $scope.searchButtonText = 'Search';
        $scope.searchLoading    = false;
        $scope.group            = stateService.getCachedGroup( stateService.getActiveGroup().id );

        toggleForm(true);
    }

    $scope.timeZones = ["America/New_York", "America/Chicago", "America/Denver", "America/Phoenix", "America/Los_Angeles", "America/Anchorage", "America/Adak", "Pacific/Honolulu"];

    $scope.dateOptions = { 
        dateFormat: 'mm-dd-yy',
        minDate:    new Date() 
    } 

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
        else if (!patient.homeTimeZone){
            alert('Timezone required');
        }
        else{
            console.log('Passwords match, proceed with registration...');

            // Trigger validation flag.
            $scope.submitted = true;

            var dataObj = {
                'firstname':    patient.firstname,
                'lastname':     patient.lastname,
                'dob':   	    patient.dob,
                'gender':       patient.gender,
                'address1':     patient.address1,
                'address2':     patient.address2,
                'city':         patient.city,
                'state':        patient.state,
                'country':      patient.country,
                'zip':  	    patient.zip,
                'email':        patient.email,
                'phone':        patient.phone,
                'homeTimeZone': patient.homeTimeZone
            };  
                
            var groupId = $scope.group.id;
            var api = '/v1/a/organization/group/'+groupId+'/patient';
            console.log('apiService.post - api is: '+api);

            apiService.post(api,dataObj).then(function(result){
                console.log('apiService.post - result is: '+JSON.stringify(result));

                if (result.msg == 'success'){
                    console.log('apiService.post - success');

                    stateService.setGroupPatientData(result.data);
                    var patient = result.data.patient;

                    if (stateService.setActivePatient(patient)){
                        $location.path('/patients/patient/addmed');
                    }
                    else{
                        $location.path('/');   
                    }
                }
                else{
                    console.log('apiService.post - error');

                    alert(result.msg);
                }

            });
        }
    }
    
    $scope.searchPatient = function(patient){
        if (!patient.email){
            alert('Email required');
        }
        else{
            var groupId = $scope.group.id;
            var api = '/v1/a/organization/group/'+groupId+'/patient/groupInvitation';   //basically create a new groupInvitation for this patient to approve

            $scope.searchButtonText = 'Searching';
            $scope.searchLoading    = true;

            apiService.post(api, patient).then(function(result){
                $scope.searchButtonText = 'Search';
                $scope.searchLoading = false;

                if (result.msg == 'success'){
                    console.log('apiService.post - success - found patient, email/sms sent');

                    var inviteStatus = result.data.status; 
                    switch(inviteStatus){
                        case 0:
                            $scope.serverMsg = 'The patient you are searching for does not exist on the Pillsy platform. '+
                                               'Try searching again with a valid phone number and email, or create a new patient.';
                            break;
                        case 1:
                            $scope.serverMsg = 'An invitation has been sent to the patient via SMS. You will have access to their '+
                                               'medication information when they approve your invitation.';
                            break;
                        case 2:
                            $scope.serverMsg = 'This patient is already actively sharing their medication information with your group.';
                            break;
                    }

                    toggleForm(false);
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
