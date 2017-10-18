/** Pillsy
*  @author  Chuks Onwuneme
*  @version 1.0
*  @package OrganizationPatientsController AngularJS module - this is the group list
*  @Copyright 2017 Pillsy, Inc.  
*/

var app = angular.module('GroupPatientsController', ['ngGrid','GroupDetails']);     //instantiates OrganizationPatientsController module
app.controller('groupPatientsController', function ($scope, $filter, $http, $location, $rootScope, apiService, groupDetails, stateService, lodash) {
    'use strict';

    var user = stateService.getUser();

    init();

    function init(){

        var pillsy                        = stateService.getPillsy();
        var organizationGroups            = pillsy.organizationGroups;
        $scope.group                      = stateService.getActiveGroup();
        $scope.call_panel_visible         = false;
        $scope.sms_panel_visible          = false;
        $scope.org_patients_panel_visible = true;
        $scope.patients_tab_visible       = true;

        checkSuperUser();

        $scope.pagingOptions = {
            pageSizes: ['25', '50', '100'],
            pageSize:  '100',
            currentPage: 1
        };

        $scope.filterOptions = {
            filterText: '',
            useExternalFilter: true
        };

        $scope.totalServerPatientsReportItems = 0;

        displayDataFromCache();
        fetchPatients($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage);
    }

    $scope.$watch('pagingOptions', function(newVal, oldVal) {
        if (newVal !== oldVal) {
            fetchPatients($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage);
        }
    }, true);

    $scope.$watch('filterOptions', function(newVal, oldVal) {
        if (newVal !== oldVal) {
            fetchPatients($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage);
        }
    }, true);

    $scope.onTabSelect = function(tab){
        switch(tab){
            case 'patients':
                $scope.patients_tab_visible = true;
                break;
            case 'reports':
                $scope.patients_tab_visible = false;
                break;
        }

        checkSuperUser();
    };

    function checkSuperUser(){
        var user = stateService.getUser();
        if ( (user.role == 'super_user') && ($scope.patients_tab_visible) ){
            $scope.patients_tab_visible_is_super_user = true;
        }
        else{
            $scope.patients_tab_visible_is_super_user = false;
        }
    }

    function displayDataFromCache(){
        //get from cache
        var cachedData = stateService.getGroupPatients( stateService.getActiveGroup().id );
        
        if (cachedData){
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

            patient.drugNames = drugsArr.join(', ');
        });

        return cachedData;
    }

    function setPagingData(cachedData, page, pageSize) {

        //for list
        var listData = formatCachedData(cachedData);
        var patients = listData.slice((page - 1) * pageSize, page * pageSize);

        $scope.organizationPatients = lodash.sortBy(patients, 'fullname');

        $scope.totalServerPatientsListItems = listData.length;

        //for reports
        var reportData  = [];
        var tempListData = cachedData.slice((page - 1) * pageSize, page * pageSize);

        tempListData.forEach(function(item){
            var drugs = item.drugs;
            if (drugs.length > 0){

                drugs.forEach(function(drug){

                    var obj = getItemObject(item);

                    obj.drugId            = drug.id;
                    obj.drugName          = drug.name;
                    obj.drugRemaining     = drug.remaining;
                    obj.drugLastConnected = drug.lastConnected;
                    obj.drugLastOpened    = drug.lastOpened; 
                    obj.drugStatus        = drug.status;
                    obj.drugDoseTimes     = drug.doseTimes;
                    obj.drugTodayTaken    = drug.todayTaken;
                    obj.drugStartTime     = drug.startTime;
                    obj.lastWeekAdherence = drug.lastWeekAdherence;
                    obj.averageAdherence  = drug.averageAdherence;

                    reportData.push(obj);
                });
            }
            else{
                var obj = getItemObject(item);
                obj.drugId            = 'N/A';
                obj.drugName          = 'N/A';
                obj.drugRemaining     = 'N/A';
                obj.drugLastConnected = 'N/A';
                obj.drugLastOpened    = 'N/A'; 
                obj.drugStatus        = 'N/A';
                obj.drugDoseTimes     = 'N/A';
                obj.drugTodayTaken    = 'N/A';
                obj.drugStartTime     = 'N/A';
                obj.lastWeekAdherence = 'N/A';
                obj.averageAdherence  = 'N/A';

                reportData.push(obj);
            }
        });

        //reports tab
        $scope.reportData = lodash.sortBy(reportData, 'fullname');
        $scope.totalServerPatientsReportItems = listData.length;
        $scope.currentPage = page;

        if (!$scope.$$phase) {
            $scope.$apply();
        }
    };

    function getItemObject(item){
        var obj = {};
        for (var key in item) {
            if (item.hasOwnProperty(key)) {
                if ( (key != 'drugNames') && (key != 'drugs') ){
                    obj[key] = item[key];
                }
            }
        }

        return obj;
    }

    function fetchOrganizationPatients(pageSize, page){

        var request = 'fetch_organization_patients';
        var api     = '/v1/a/organization/group/'+ stateService.getActiveGroup().id +'/patients';
        var data;

        $scope.loadingPatients = true;
        
        apiService.get(api).then(function(result){
            $scope.loadingPatients = false;

            if (result){
                if (result.msg == 'success'){
                    console.log('groupPatientsController - fetchPatients - successfully retrieved group patients');

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

    function fetchPatients(pageSize, page){

        var request = 'fetch_organization_patients';
        var api     = '/v1/a/organization/group/'+ stateService.getActiveGroup().id +'/patients';
        var data;

        $scope.loadingPatients = true;
        
        apiService.get(api).then(function(result){
            $scope.loadingPatients = false;

            if (result){
                if (result.msg == 'success'){
                    console.log('groupPatientsController - fetchPatients - successfully retrieved group patients');

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
            $scope.patient_to_send_sms =  patient.firstname +' '+ patient.lastname;
        }

        $scope.org_patients_panel_visible = false;
        $scope.call_panel_visible         = false;
        $scope.sms_panel_visible          = true;
        $scope.sendButtonText             = 'Send';
        $scope.message_patient_form       = true;
    }

    $scope.sendMessage = function(message){

        if (message){
            
            var request   = 'send_sms_to_patient';
            var patientId = $scope.sendPatient.id;
            var groupId   = stateService.getActiveGroup().id;
            var api       = '/v1/a/organization/group/'+ groupId +'/patient/'+ patientId +'/sms';
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
                                    output = 'Your SMS message was successfully sent to '+ $scope.sendPatient.firstname;
                                }
                                else{
                                    output = 'Your SMS could not be sent. Please try again later';
                                }
                            }
                            else{
                                output = 'The patient, '+ $scope.sendPatient.firstname +', does not have a phone number associated with their account. Your SMS message was not sent.'
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

    $scope.callPatient = function($event, patient){
        console.log('organizationGroupController - callPatient');

        $event.stopPropagation();

        if (patient){
            $scope.patient_to_call = patient.firstname +' '+ patient.lastname;

            $scope.org_patients_panel_visible = false;
            $scope.call_panel_visible         = true;
            $scope.sms_panel_visible          = false;

            var request     = 'call_patient';
            var activeGroup = stateService.getCachedGroup( stateService.getActiveGroup().id );
            var api     = '/v1/a/organization/group/'+ activeGroup.id +'/patient/'+ patient.id +'/call';
            var payload = {
                message: message,
                request: request
            };

            console.log('organizationGroupController - callPatient - api: '+api);

            $scope.callPatientMsg = 'Please wait while a call is being placed to '+patient.firstname;

            apiService.post(api, payload).then(function(result){

                if (result){
                    var msg = result.msg;

                    if (msg == 'success'){

                        var data = result.data;
                    }
                    else{
                        console.log('apiService.post - error');

                        $scope.callPatientMsg = 'Pillsy encountered an error while trying to call '+ patient.firstname +'. Please try again later.';
                    }
                }
                else{
                    console.log('apiService.post - error');
                }
            });
        }
        else{
            $scope.callPatientMsg = 'Pillsy encountered an error while trying to call '+ patient.firstname +'. Please try again later.';
        }
    }

    $scope.openPatientRecord = function(rowItem) {
        console.log("openPatientRecord");

        var patient = rowItem.entity;

        if (stateService.setActivePatient(patient)){  //has drugNames
            $location.path('/patients/patient/data');
        }
        else{
            //could not set group
        }
    };

    $scope.getAdherenceClassName = function(value) {

        if (value === 'N/A'){
            return;
        }

        value = value.replace(/\%/g,'');
        value = parseFloat(value);

        if (value >= 85){
            return 'label label-success';
        }
        else if ( (value >= 75) && (value < 85)){
            return 'label label-warning';
        }
        else{
            return 'label label-danger'
        }
    }

    //Grid For patients list
    var removeTemplate  = '<div><input type="button" style="color: #2685ee" value="Remove" ng-click="removeRow($event, row.entity)" />';
    var messageTemplate = '<div class="ngCellText">{{ row.entity.phone_formatted }}<a style="color: #2685ee" ng-click="messagePatient($event, row.entity)">&nbsp;&nbsp;&nbsp;&nbsp;SMS</a><a style="color: #2685ee" ng-click="callPatient($event, row.entity)">&nbsp;&nbsp;&nbsp;&nbsp;Call</a></div>';
    var nameTemplate    = '<div><input type="button" style="color: #2685ee" value="{{ row.entity.fullname }}" ng-click="openPatientRecord(row)"/></div>'; 

    var listColumnDefs = [
        { field:'fullname',        displayName: 'Name',     cellTemplate: nameTemplate },
        { field:'drugNames',       displayName: 'Drugs' },
        { field:'phone_formatted', displayName: 'Mobile#' , cellTemplate: messageTemplate },
    ];

    if (user.role != 'org_user'){
        listColumnDefs.push( { field:'remove', displayName: '', cellTemplate: removeTemplate } );
    }

    $scope.organizationPatientsGridOptions = {
        data:                     'organizationPatients',
        columnDefs:               listColumnDefs,
        multiSelect:              false,
        enablePaging:             true,
        showFooter:               true,
        enableRowSelection:       false, 
        enableSelectAll:          false,
        enableRowHeaderSelection: false,
        noUnselect:               false,
        enableGridMenu:           true,
        enableColumnResize:       true,
        totalServerItems:         'totalServerPatientsListItems',
        pagingOptions:            $scope.pagingOptions,
        filterOptions:            $scope.filterOptions,
        enableCellSelection:      false
    };


    //REPORTS---------
    var adherenceTemplate = '<div class="ngCellText"><span style="font-size: 12px; font-weight:normal" ng-class="getAdherenceClassName(row.getProperty(\'lastWeekAdherence\'))">{{ row.getProperty(col.field) }}</span></div>';
    var phoneTemplate     = '<div class="ngCellText">{{ row.entity.phone_formatted }}<a style="color: #2685ee" ng-click="messagePatient($event, row.entity)">&nbsp;&nbsp;&nbsp;&nbsp;SMS</a><a style="color: #2685ee" ng-click="callPatient($event, row.entity)">&nbsp;&nbsp;&nbsp;&nbsp;Call</a></div>';
    var iNameTemplate     = '<div><input type="button" style="color: #2685ee" value="{{ row.entity.fullname }}" ng-click="openPatientRecord(row)"/></div>'; 

    //Grid For Adherence report
    $scope.reportGridOptions = {
        data:             'reportData',
        columnDefs: [
            { field:'fullname',          displayName: 'Name',          cellTemplate: iNameTemplate },
            { field:'drugName',          displayName: 'Drugs' },
            { field:'lastWeekAdherence', displayName: 'Last Week',     cellTemplate: adherenceTemplate },
            { field:'averageAdherence',  displayName: 'Average' },
            { field:'drugLastConnected', displayName: 'Last connected' },
            { field:'drugLastOpened',    displayName: 'Last opened' },
            { field:'drugStartTime',     displayName: 'Start date' },
            { field:'phone',             displayName: 'Mobile#',       cellTemplate: phoneTemplate }
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
