/** Pillsy
*  @author  Chuks Onwuneme
*  @version 1.0
*  @package OrganizationPatientsController AngularJS module - this is the master list
*  @Copyright 2017 Pillsy, Inc.  
*/

var app = angular.module('OrganizationPatientsController', ['ngGrid','GroupDetails']);     //instantiates OrganizationPatientsController module
app.controller('organizationPatientsController', function ($scope, $filter, $http, $location, $rootScope, apiService, groupDetails, stateService) {
    'use strict';

    init();

    function init(){

        $scope.call_panel_visible         = false;
        $scope.sms_panel_visible          = false;
        $scope.org_patients_panel_visible = true;
        $scope.patients_tab_visible       = true;

        $scope.pagingOptions = {
            pageSizes: [50, 100],
            pageSize:  100,
            currentPage: 1
        };

        displayDataFromCache();
        fetchPatients($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage);
    }

    $scope.onTabSelect = function(tab){
        switch(tab){
            case 'patients':
                $scope.patients_tab_visible = true;
                break;
            case 'reports':
                $scope.patients_tab_visible = false;
                break;
        }
    };

    function displayDataFromCache(){
        //get from cache
        var cachedData = stateService.getGroupPatients( stateService.getActiveGroup().id );
        
        if (cachedData){
            cachedData = formatCachedData(cachedData);
            setPagingData(cachedData, $scope.pagingOptions.currentPage, $scope.pagingOptions.pageSize);
        }
    }

    function formatCachedData(cachedData){

        cachedData.forEach(function(patient){
            var drugs = patient.drugs;

            var drugsArr = [];
            drugs.forEach(function(drug){
                drugsArr.push(drug.name);
            });

            patient.drugs = drugsArr.join(', ');
        });

        return cachedData;
    }

    function setPagingData(listData, page, pageSize) {
        //for list
        $scope.organizationPatients         = listData.slice((page - 1) * pageSize, page * pageSize);
        $scope.totalServerPatientsListItems = listData.length;

        if (!$scope.$$phase) {
            $scope.$apply();
        }
    };

    function fetchPatients(pageSize, page){

        var request = 'fetch_organization_patients';
        var api     = '/v1/a/organization/group/'+ stateService.getActiveGroup().id +'/patients';
        var data;

        $scope.loadingPatients = true;
        
        apiService.get(api).then(function(result){
            $scope.loadingPatients = false;

            if (result){
                if (result.msg == 'success'){
                    console.log('groupPatientsController - fetchPatients - successfully retrieved group patients: '+JSON.stringify(result));

                    /*
                    var obj = {
                        organizationGroup: organizationGroup,
                        patients:          patients
                    };*/

                    var data = result.data;

                    //set the data to cache
                    stateService.setGroupPatientsData(data);

                    //display data from cache
                    displayDataFromCache();
                }
                else{
                    console.log('groupPatientsController - fetchPatients - error creating group: '+result.msg);

                    alert(result.msg);
                }
            }
            else{
                console.log('groupPatientsController - fetchPatients - error - no result from server');
            }
        });
    }

    $scope.removeRow = function($event, patient) {

        $event.stopPropagation();
        var activeGroup = stateService.getCachedGroup( stateService.getActiveGroup().id );
        var answer = confirm('You are about to remove '+patient.fullname+' from this organization. Are you sure?');
        
        if (answer){
            var request = 'remove_patient_from_group';
            var api     = '/v1/a/organization/group/'+ activeGroup.id +'/patient/'+patient.id;
            
            $scope.loadingPatients = true;

            apiService.delete(api).then(function(result){
                $scope.loadingPatients = false;

                if (result){
                    if (result.msg == 'success'){

                        stateService.removePatientFromGroup(patient, activeGroup);
                        displayDataFromCache();
                    }
                    else{
                        console.log('groupPatientsController - apiService.get - error deleting patient from group: '+result.msg);

                        alert(result.msg);
                    }
                }
                else{
                     console.log('groupPatientsController - apiService.get - error - no result from server');
                }
            });

        }
        else{
            //some code
        }
    };

    $scope.refreshPatients = function(){
        fetchPatients($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage);
    };
    
    $scope.messagePatient = function($event, patient) {
        $event.stopPropagation();
 
        if (patient){
            $scope.sendPatient         = patient;
            $scope.patient_to_send_sms = patient.fullname;
        }

        $scope.org_patients_panel_visible = false;
        $scope.call_panel_visible         = false;
        $scope.sms_panel_visible          = true;
        $scope.sendButtonText             = 'Send';
        $scope.message_patient_form       = true;
    }

    $scope.callPatient = function($event, patient) {
        $event.stopPropagation();

        if (patient){
            $scope.callPatient     = patient;
            $scope.patient_to_call = patient.fullname;
        }

        $scope.org_patients_panel_visible = false;
        $scope.call_panel_visible         = true;
        $scope.sms_panel_visible          = false;

        callPatient(patient.phone);
    }

    $scope.sendMessage = function(message){

        if (message){
            var request = 'send_sms_to_patient';
            var activeGroup = stateService.getCachedGroup( stateService.getActiveGroup() );
            var api     = '/v1/a/organization/group/'+ activeGroup.id +'/patient/'+ $scope.sendPatient.id +'/sms';
            var payload = {
                message: message,
                request: request
            };

            $scope.sendButtonText = 'Sending';
            apiService.post(api, payload).then(function(result){
                $scope.message_patient_form = false;
                $scope.sendButtonText       = 'Send';

                if (result){
                    var msg = result.msg;

                    if (msg == 'success'){

                        var data = result.data;
                        var output;

                        if (data.found){
                            if (data.hasPhone){
                                if (data.smsSent){
                                    output = 'Your SMS message was successfully sent to '+ $scope.sendPatient.name;
                                }
                                else{
                                    output = 'Your SMS could not be sent. Please try again later';
                                }
                            }
                            else{
                                output = 'The patient, '+ $scope.sendPatient.name +', does not have a phone number associated with their account. Your SMS message was not sent.'
                            }
                        }
                        else{
                            output = 'This patient was not found.';
                        }

                        $scope.serverMsg = output
                    }
                    else{
                        console.log('apiService.post - error');

                        $scope.serverMsg = 'There was an error while sending the SMS message to '+ $scope.sendPatient.name +'. Please try again later.';
                    }
                }
                else{
                    console.log('apiService.post - error');
                }
            });
        }
        else{
            alert('Please enter a message to send');
        }
    }

    function callPatient(patientPhone){
        console.log('organizationGroupController - callPatient');

        var request     = 'call_patient';
        var activeGroup = stateService.getCachedGroup( stateService.getActiveGroup() );
        var api     = '/v1/a/organization/group/'+ activeGroup.id +'/patient/'+ $scope.callPatient.id +'/call';
        var payload = {
            message: message,
            request: request
        };

        console.log('organizationGroupController - callPatient - api: '+api);

        $scope.callPatientMsg = 'Please wait while a call is being placed to '+$scope.patient_to_call;

        apiService.post(api, payload).then(function(result){

            if (result){
                var msg = result.msg;

                if (msg == 'success'){

                    var data = result.data;
                }
                else{
                    console.log('apiService.post - error');

                    $scope.callPatientMsg = 'Pillsy encountered an error while trying to call '+ $scope.callPatient.fullname +'. Please try again later.';
                }
            }
            else{
                console.log('apiService.post - error');
            }
        });
    }

    $scope.openPatientRecord = function(rowItem) {
        console.log("openPatientRecord");

        var patient = rowItem.entity;

        var nameArr = patient.fullname.split(', ');

        if (nameArr.length > 0){
            patient.lastname = nameArr[0];

            if (nameArr.length == 2){
                patient.firstname = nameArr[1];
            }
        }

        if (stateService.setActivePatient(patient)){
            $location.path('/patients/patient/data');
        }
        else{
            //could not set group
        }
    };

    //Grid For patients list
    var removeTemplate  = '<div><input type="button" style="color: #2685ee" value="Remove" ng-click="removeRow($event, row.entity)" />';
    var messageTemplate = '<div class="ngCellText">{{ row.entity.phone_formatted }}<a style="color: #2685ee" ng-click="messagePatient($event, row.entity)">&nbsp;&nbsp;&nbsp;&nbsp;SMS</a><a style="color: #2685ee" ng-click="callPatient($event, row.entity)">&nbsp;&nbsp;&nbsp;&nbsp;Call</a></div>';
    var nameTemplate    = '<div><input type="button" style="color: #2685ee" value="{{ row.entity.fullname }}" ng-click="openPatientRecord(row)"/></div>'; 


    $scope.organizationPatientsGridOptions = {
        data:             'organizationPatients',
        columnDefs: [
            { field:'fullname',        displayName: 'Name',     cellTemplate: nameTemplate },
            { field:'drugs',           displayName: 'Drugs' },
            { field:'phone_formatted', displayName: 'Mobile#' , cellTemplate: messageTemplate },
            { field:'remove',          displayName: '',         cellTemplate: removeTemplate },
        ],
        multiSelect:                false,
        enablePaging:               true,
        showFooter:                 true,
        enableRowSelection:         false, 
        enableSelectAll:            false,
        enableRowHeaderSelection:   false,
        noUnselect:                 false,
        enableGridMenu:             true,
        enableColumnResize:         true,
        totalServerItems:           'totalServerPatientsListItems',
        pagingOptions:              $scope.pagingOptions,
        filterOptions:              $scope.filterOptions,
        enableCellSelection:        false
    };


    //REPORTS---------
    var adherenceTemplate = '<div class="ngCellText"><span style="font-size: 12px; font-weight:normal" ng-class="getAdherenceClassName(row.getProperty(\'lastweek\'))">{{ row.getProperty(col.field) }}</span></div>';
    var phoneTemplate     = '<div class="ngCellText">{{ row.entity.phone_formatted }}<a style="color: #2685ee" ng-click="messagePatient($event, row.entity)">&nbsp;&nbsp;&nbsp;&nbsp;SMS</a><a style="color: #2685ee" ng-click="callPatient($event, row.entity)">&nbsp;&nbsp;&nbsp;&nbsp;Call</a></div>';
    var iNameTemplate     = '<div><input type="button" style="color: #2685ee" value="{{ row.entity.name }}" ng-click="openPatientRecord(row)"/></div>'; 

    //Grid For Adherence report
    $scope.patientsReportDataGridOptions = {
        data:             'patientsReportData',
        columnDefs: [
            { field:'fullname',       displayName: 'Name',          cellTemplate: iNameTemplate },
            { field:'drugName',       displayName: 'Drugs' },
            { field:'lastweek',       displayName: 'Last Week',     cellTemplate: adherenceTemplate },
            { field:'all_time',       displayName: 'All time' },
            { field:'last_connected', displayName: 'Last connected' },
            { field:'last_opened',    displayName: 'Last opened' },
            { field:'start_date',     displayName: 'Start date' },
            { field:'phone',          displayName: 'Mobile#',       cellTemplate: phoneTemplate }
        ],
        multiSelect:                false,
        enablePaging:               true,
        showFooter:                 true,
        enableRowSelection:         false, 
        enableSelectAll:            false,
        enableRowHeaderSelection:   false,
        noUnselect:                 false,
        enableGridMenu:             true,
        enableColumnResize:         true,
        totalServerItems:           'totalServerPatientsReportItems',
        pagingOptions:              $scope.pagingOptions,
        filterOptions:              $scope.filterOptions,
        enableCellSelection:        false
    };
});
