/** Pillsy
*  @author  Chuks Onwuneme
*  @version 1.0
*  @package AddPatientMedController AngularJS module  
*/

var app = angular.module('AddPatientMedController', []);     //instantiates AddPatientMedController module
app.controller('addPatientMedController', function ($scope, $filter, $location, $rootScope, apiService, stateService, configService) {
	'use strict';

    console.log('addPatientMedController');

    //patient
    var pillsy = stateService.getPillsy();
    
    if ( (!pillsy.active_patient) || (!pillsy.active_group) ){
        $location.path('/');
    }
    else{
        
        $scope.group   = pillsy.active_group;
        $scope.patient = pillsy.active_patient;
    }

    /*configService.retrieveConfigs()
    .then(function(configs){

        $scope.drug_search_url = configs.apiHost + "/v1/n/ndcdrug?query=";
    });*/

    $scope.drug_search_url = "/v1/n/ndcdrug?query=";
    
    $scope.integerval  = /^\d*$/;

    $scope.dateOptions = {
        changeYear:  true,
        changeMonth: true,
        changeDay:   true,
        yearRange:   '2016:-0'
    };

    $scope.submit = function(drug){

        if (!drug.name){
            alert('Drug name required');
        }
        else if (!drug.start_date){
            alert('Start date required');
        }
        else if (!drug.pills_dose){
            alert('Pills dose required');
        }
        else if (!drug.doses_day){
            alert('Doses per day required');
        }
        else if (!drug.reminder_time){
            alert('Reminder time required');
        }
        else if (!drug.days_therapy){
            alert('Days of therapy required');
        }
        else if (!drug.end_date){
            alert('End date required');
        }
        else if (!drug.pillsyCapId){
            alert('PillsyCap identifier required');
        }
        else{
            console.log('Passwords match, proceed with registration...');

            // Trigger validation flag.
            $scope.submitted = true;

            var name = "";

            var dataObj = {
                'name':        name,
                'source':      'PillsyCap',
                'pillsyCapId': drug.pillsyCapId,
            }; 

            if (drug.name instanceof Object){

                if ( Object.prototype.hasOwnProperty.call(drug.name, 'originalObject') ){

                    name               = drug.name.originalObject.pillsyName;
                    var compound       = drug.name.originalObject.chemicalName;
                    var dose           = drug.name.originalObject.strengthNumber;
                    var doseUnits      = drug.name.originalObject.strengthUnit;
                    var formFactor     = drug.name.originalObject.dosageDisplay;
                    var nDCCode        = drug.name.originalObject.nDCCode;
                    var nDCCode11Digit = drug.name.originalObject.nDCCode11Digit;

                    if (name){
                        dataObj.name = name;
                    }
                    if (compound){
                        dataObj.compound = compound;
                    }
                    if (dose){
                        dataObj.dose = dose;
                    }
                    if (doseUnits){
                        dataObj.doseUnits = doseUnits;
                    }
                    if (formFactor){
                        dataObj.formFactor = formFactor;
                    }
                    if (nDCCode){
                        dataObj.nDCCode = nDCCode;
                    }
                    if (nDCCode11Digit){
                        dataObj.nDCCode11Digit = nDCCode11Digit;
                    }
                }
            }
                
            if (drug.pillsyHubId){
                dataObj.pillsyHubId = drug.pillsyHubId;
            }

            if ( (drug.quantity != null) && (drug.quantity != undefined) ){
                dataObj.quantity = drug.quantity;
            }

            var groupId   = $scope.group.id;
            var patientId = $scope.patient.id;
        
            var api = '/v1/a/organization/group/'+groupId+'/patient/'+patientId+'/drug'
            console.log('apiService.post - api is: '+api);

            apiService.post(api,dataObj).then(function(result){
                if (result){
                    console.log('apiService.post - result is: '+JSON.stringify(result));

                    if (result.msg == 'success'){
                        console.log('apiService.post - success');

                        var patient = result.data;
                        $rootScope.active_patient = patient;
                        $location.path('/group/patient/data');

                    }
                    else{
                        console.log('apiService.post - error');

                        alert(result.msg);
                    }
                }
                else{
                    alert('Server error');
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