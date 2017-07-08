/** Pillsy
*  @author  Chuks Onwuneme
*  @version 1.0
*  @package GroupPatientsReportsController AngularJS module
*  @Copyright 2017 Pillsy, Inc.  
*/

var app = angular.module('GroupPatientsReportsController', ['ngGrid','GroupDetails']);     //instantiates GroupPatientsReportsController module
app.controller('groupPatientsReportsController', function ($scope, $filter, $http, $location, $rootScope, apiService, groupDetails, stateService) {
    'use strict';

    var activeGroup = stateService.getActiveGroup();

    if (!activeGroup) {
        $location.path('/');
    }
    else{
        init();
    }
   
    //functions
    function init(){
        $scope.group_visible        = true;
        $scope.call_visible         = false;
        $scope.sms_visible          = false;
        $scope.patients_visible     = true;
        $scope.isAdmin              = activeGroup.isAdmin;
        $scope.sendButtonText       = 'Send';
        $scope.sendGroupId          = null;
        $scope.sendPatient          = null;
        $scope.message_patient_form = false;
        $scope.group                = activeGroup;

        $scope.filterOptions = {
            filterText: '',
            useExternalFilter: true
        };

        $scope.totalServerPatientsListItems   = 0;
        $scope.totalServerPatientsReportItems = 0;

        $scope.pagingOptions = {
            pageSizes: [50, 100],
            pageSize:  50,
            currentPage: 1
        };

        var groups = stateService.getUserGroups();
        $rootScope.$emit("my_groups_callback", {groups: groups});
    }

    displayDataFromCache();
    $scope.loadingPatients = true;
    getPagedDataAsync($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage);

    function getInterval(){
        var now = moment();

        //last sunday to last monday
        //start week on Monday
        moment().startOf('isoWeek');

        //last Monday
        var lastMonday = moment(now).isoWeekday(-6).startOf('day');
        var lastSunday = moment(lastMonday).add(6, 'days').endOf('day');
        var str = ' last monday\'s date was: '+lastMonday.toDate()+' last sunday\'s date was: '+lastSunday.toDate();

        console.log(str);

        var intervalStartTime = moment(now.valueOf()).startOf('day').subtract(3,'days').valueOf();
        var intervalEndTime   = moment(now.valueOf()).endOf('day').valueOf();

        //last week interval
        var interval = {
            intervalStartTime: intervalStartTime.valueOf(),
            intervalEndTime:   intervalEndTime.valueOf(),
            lastweekStartTime: lastMonday.valueOf(),
            lastweekEndTime:   lastSunday.valueOf(),
            today:             now.valueOf()
        };

        return encodeURIComponent( JSON.stringify(interval) );
    }

    function getFormattedPhone(phone){

        if ( phone.charAt(0) === '+'){
            phone = phone.slice(1);
        }

        if ( phone.charAt(0) === '1'){
            phone = phone.slice(1);
        }

        String.prototype.insert = function (index, string) {
            if (index > 0)
                return this.substring(0, index) + string + this.substring(index, this.length);
            else
                return string + this;
        };

        phone = phone.insert(0, '(');
        phone = phone.insert(4, ') ');
        phone = phone.insert(9, '-');

        return phone;
    }

    function displayDataFromCache(){
        //get from cache
        var cachedData = stateService.getGroupDetails($scope.group.id);
        if (cachedData){
            setPagingData(cachedData, $scope.pagingOptions.currentPage, $scope.pagingOptions.pageSize);
        }
    }

    function fixData(data){

        var seen = {};
        data = data.filter(function(entry) {

            var previous;

            // Have we seen this id before?
            if (seen.hasOwnProperty(entry.id)) {
                // Yes, grab it and add this drug to it
                previous = seen[entry.id];
                previous.drugs.push(entry.drugName);

                // Don't keep this entry, we've merged it into the previous one
                return false;
            }

            // entry.data probably isn't an array; make it one for consistency
            if (!Array.isArray(entry.drugName)) {
                entry.drugs = [entry.drugName];
            }

            // Remember that we've seen it
            seen[entry.id] = entry;
            
            // Keep this one, we'll merge any others that match into it
            return true;
        });

        data = data.filter(function(entry) {
            entry.drugs = entry.drugs.join(', ');
            return true;
        });

        return data;
    }

    function getTimeAgoString(dateMs){
        console.log('getTimeAgoString');

        var str = 'N/A';

        if (dateMs){
            if (dateMs > 0){
                var now  = moment();
                var time = moment(dateMs);
                var duration = moment.duration(now.diff(time));

                var seconds = Math.round(duration.asSeconds());

                if (seconds > 60){
                    var minutes = Math.round(duration.asMinutes());

                    if (minutes > 60){
                        var hours = Math.round(duration.asHours());

                        if (hours > 24){
                            var days = Math.round(duration.asDays());

                            var dayType = (days > 1) ? ' days ago' : ' day ago';
                            str = days + dayType;
                        }
                        else{
                            var hourType = (hours > 1) ? ' hours ago' : ' hour ago';
                            str = hours + hourType;
                        }
                    }
                    else{
                        var minuteType = (minutes > 1) ? ' minutes ago' : ' minute ago';
                        str = minutes + minuteType;
                    }
                }
                else{
                    var secondType = (seconds > 1) ? ' seconds ago' : ' second ago';
                    str = seconds + secondType;
                }
            }
        }

        return str;
    }

    function setPagingData(data, page, pageSize) {

        var listData    = fixData(data);
        var reportsData = data;

        //for list
        $scope.patientsListData             = listData.slice((page - 1) * pageSize, page * pageSize);
        $scope.totalServerPatientsListItems = listData.length;

        //for reports
        $scope.patientsReportData             = reportsData.slice((page - 1) * pageSize, page * pageSize);
        $scope.totalServerPatientsReportItems = reportsData.length;
        
        if (!$scope.$$phase) {
            $scope.$apply();
        }
    };

    function getPagedDataAsync(pageSize, page, searchText) {
        fireoffGroupDetailsFetch(pageSize, page, searchText);
    };

    $scope.refreshPatients = function(){
        getPagedDataAsync($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage);
    };

    $scope.$watch('pagingOptions', function(newVal, oldVal) {
        if (newVal !== oldVal) {
            getPagedDataAsync($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage, $scope.filterOptions.filterText);
        }
    }, true);

    $scope.$watch('filterOptions', function(newVal, oldVal) {
        if (newVal !== oldVal) {
            getPagedDataAsync($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage, $scope.filterOptions.filterText);
        }
    }, true);

    $scope.$on('paging_options', function (event, data) {
        getPagedDataAsync(data.pageSize, data.currentPage, data.filterText);
    });

    $scope.$on('filter_options', function (event, data) {
        getPagedDataAsync(data.pageSize, data.currentPage, data.filterText);
    });

    $scope.openPatientRecord = function(rowItem) {
        console.log("openPatientRecord");

        var patient = rowItem.entity;

        var nameArr = patient.name.split(', ');

        if (nameArr.length > 0){
            patient.lastname = nameArr[0];

            if (nameArr.length == 2){
                patient.firstname = nameArr[1];
            }
        }

        if (stateService.setActivePatient(patient)){
            $location.path('/group/patient/data');
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
        else if ( (value >=75) && (value < 85)){
            return 'label label-warning';
        }
        else{
            return 'label label-danger'
        }
    }

    $scope.messagePatient = function($event, patient) {
        $event.stopPropagation();
 
        if (patient){
            $scope.sendPatient         = patient;
            $scope.patient_to_send_sms = patient.name;
        }

        $scope.group_visible        = false;
        $scope.call_visible         = false;
        $scope.sms_visible          = true;
        $scope.sendButtonText       = 'Send';
        $scope.message_patient_form = true;
    }

    $scope.callPatient = function($event, patient) {
        $event.stopPropagation();

        if (patient){
            $scope.callPatient     = patient;
            $scope.patient_to_call = patient.name;
        }

        $scope.group_visible = false;
        $scope.call_visible  = true;
        $scope.sms_visible   = false;

        callPatient(patient.phone);
    }

    var adherenceTemplate = '<div class="ngCellText"><span style="font-size: 12px; font-weight:normal" ng-class="getAdherenceClassName(row.getProperty(\'lastweek\'))">{{ row.getProperty(col.field) }}</span></div>';
    var messageTemplate   = '<div class="ngCellText">{{ row.entity.phone_formatted }}<a style="color: #2685ee" ng-click="messagePatient($event, row.entity)">&nbsp;&nbsp;&nbsp;&nbsp;SMS</a><a style="color: #2685ee" ng-click="callPatient($event, row.entity)">&nbsp;&nbsp;&nbsp;&nbsp;Call</a></div>';
    var nameTemplate      = '<div><input type="button" style="color: #2685ee" value="{{ row.entity.name }}" ng-click="openPatientRecord(row)"/></div>'; 

    //Grid For Adherence report
    $scope.patientsReportDataGridOptions = {
        data:             'patientsReportData',
        columnDefs: [
            { field:'name',           displayName: 'Name',          cellTemplate: nameTemplate },
            { field:'drugName',       displayName: 'Drugs' },
            { field:'lastweek',       displayName: 'Last Week',     cellTemplate: adherenceTemplate },
            { field:'all_time',       displayName: 'All time' },
            { field:'last_connected', displayName: 'Last connected' },
            { field:'last_opened',    displayName: 'Last opened' },
            { field:'start_date',     displayName: 'Start date' },
            { field:'phone',          displayName: 'Mobile#',       cellTemplate: messageTemplate }
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

    //Grid For patients list
    var removeTemplate  = '<div><input type="button" style="color: #2685ee" value="Remove" ng-click="removeRow($event, row.entity)" />';

    $scope.patientsListDataGridOptions = {
        data:             'patientsListData',
        columnDefs: [
            { field:'name',       displayName: 'Name',    cellTemplate: nameTemplate },
            { field:'drugs',      displayName: 'Drugs' },
            { field:'phone',      displayName: 'Mobile#', cellTemplate: messageTemplate },
            { field:'remove',     displayName: '',        cellTemplate: removeTemplate },
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


    // API calls
    function fireoffGroupDetailsFetch(pageSize, page, searchText){

        var groupId = $scope.group.id;

        if (groupId){
            var request = 'fetch_group_patients_report';
            var api     = '/v1/a/organization/group/'+groupId+'/data?interval='+getInterval()+'&request='+request;
            var data;

            $scope.loadingPatients = true;
            apiService.get(api).then(function(result){
                $scope.loadingPatients = false;

                if (result){
                    if (result.msg == 'success'){
                        console.log('groupPatientsController - apiService.get - successfully retrieved group patients: '+result);

                        var largeLoad = [];
                        result.data.forEach(function(patient){

                            var drugsStr = '';
                            if (patient.drugs){
                                if (patient.drugs.length > 0){
                                
                                    patient.drugs.forEach(function(drug){
                                        if (drugsStr == ''){
                                            drugsStr = drug;
                                        }
                                        else{
                                            drugsStr = drugsStr + ', '+drug;
                                        }
                                    });
                                }
                                else{
                                    drugsStr = 'N/A';
                                }
                            }

                            var obj = {
                                "id":               patient.id,
                                "name":             patient.fullname,
                                "status":           patient.status,
                                "today":            patient.adherence_today,
                                "interval":         patient.adherence_interval,
                                "all_time":         patient.adherence_alltime,
                                "lastweek":         patient.adherence_lastweek,
                                "last_connected":   getTimeAgoString( patient.last_connected ),
                                "last_opened":      getTimeAgoString( patient.last_opened ), 
                                "start_date":       moment(patient.startTime).format("YYYY-MM-DD"),
                                "drugName":         patient.drugName,
                                "drugId":           patient.drugId,
                                "deviceId":         patient.deviceId,
                                "drugReminders":    patient.reminders,
                                "remaining":        patient.remaining,
                                "todayDoses":       patient.todayDoses,
                                "address1":         patient.address1,
                                "address2":         patient.address2,
                                "city":             patient.city,
                                "state":            patient.state,
                                "zip":              patient.zip,
                                "phone":            patient.phone,
                                "phone_formatted":  getFormattedPhone(patient.phone),
                                "phone2":           patient.phone2,
                                "email":            patient.email
                            };

                            largeLoad.push(obj);
                        });

                        if (searchText) {
                            console.log('groupsController - using searchText...');

                            var ft = searchText.toLowerCase();
                            largeLoad = largeLoad.filter(function(item) {
                                return JSON.stringify(item).toLowerCase().indexOf(ft) !== -1;
                            });
                        }

                        //set the data to cache
                        stateService.setGroupDetails($scope.group.id, largeLoad);

                        //display data from cache
                        displayDataFromCache();
                    }
                    else{
                        console.log('groupPatientsController - apiService.get - error creating group: '+result.msg);

                        alert(result.msg);
                    }
                }
                else{
                    console.log('groupPatientsController - apiService.get - error - no result from server');
                }
            });
        }
        else{
            setPagingData([], page, pageSize);
        }
    }

    function callPatient(patientPhone){
        console.log('organizationGroupController - callPatient');

        var request = 'call_patient';
        var api     = '/v1/a/organization/group/'+ $scope.group.id +'/patient/'+ $scope.callPatient.id +'/call';
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

                    $scope.callPatientMsg = 'Pillsy encountered an error while trying to call '+ $scope.callPatient.name +'. Please try again later.';
                }
            }
            else{
                console.log('apiService.post - error');
            }
        });
    }

    $scope.updateGroup = function(key, value){

        var request = 'update_organization_group'; 

        var obj = {
            request:  request,
            interval: getInterval()
        };

        switch(key){
            case 'name':
                obj.name = value;
                break;
            case 'description':
                obj.description = value;
                break;
        }

         
        var api = '/v1/a/organization/group/'+$scope.group.id;

        apiService.put(api, obj).then(function(result){

            if (result.msg == 'success'){
                console.log('apiService.post - success');

                var group = result.data;

                var obj = {
                    "id":                  group.id,
                    "name":                group.name,
                    "description":         group.description,
                    "identifier":          group.extName,
                    "avg":                 group.avg,
                    "adherence_interval":  group.adherence_interval,
                    "patients":            group.patients,
                    "members":             group.members,
                    "label":               group.name,
                    "isAdmin":             group.isAdmin,
                    "url":                 '/group/data',
                    "type":                'group'
                };

                var userGroups = stateService.getUserGroups();
                
                if (userGroups){
                    
                    var updatedGroups = [];
                    userGroups.forEach(function(group){
                        if (group.id == obj.id){
                            group = obj;
                        }

                        updatedGroups.push(group);
                    });

                    stateService.setUserGroups(updatedGroups);
                }
                else{
                    userGroups = [];
                    userGroups.push(obj);
                    stateService.setUserGroups(userGroups);
                }

                userGroups = stateService.getUserGroups();

                $rootScope.$emit("my_groups_callback", {groups: userGroups});

                pillsy = stateService.getPillsy();

                if (pillsy){
                    if (pillsy.active_group){
                        if (pillsy.active_group.id == obj.id){

                            stateService.setActiveGroup(obj);
                            pillsy = stateService.getPillsy();
                            $scope.group = pillsy.active_group;
                        }
                    }
                }
            }
            else{
                console.log('apiService.post - error');

                alert(result.msg);
            }
        });
    }

    $scope.removeRow = function($event, patient) {
        $event.stopPropagation();
        var answer = confirm('Are you sure you want to remove '+patient.name+' from this group?');
        
        if (answer){
            var request = 'remove_patient_from_group';
            var api     = '/v1/a/organization/group/'+ $scope.group.id +'/patient/'+patient.id;
            
            $scope.loadingPatients = true;

            apiService.delete(api).then(function(result){
                $scope.loadingPatients = false;

                if (result){
                    if (result.msg == 'success'){

                        var groupDetails = stateService.getGroupDetails($scope.group.id);

                        if (groupDetails){
                            if (groupDetails.length > 0){
                                for (var i = groupDetails.length -1; i >= 0 ; i--){
                                    if (groupDetails[i].id == patient.id){
                                        groupDetails.splice(i, 1);

                                        break;
                                    }
                                }
                            }
                        }
                       
                        var data = result.data;

                        if (data.numPatients){
                            var userGroups = stateService.getUserGroups();

                            if (userGroups){
                                if (userGroups.length > 0){
                                    userGroups.some(function(group){
                                        if (group.id == $scope.group.id){
                                            group.patients = data.numPatients;
                                            return true;
                                        }
                                    });

                                    stateService.setUserGroups(userGroups);
                                }
                            }
                        }

                        stateService.setGroupDetails($scope.group.id, groupDetails);
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
    
    $scope.sendMessage = function(message){
        var request = 'send_sms_to_patient';
        var api     = '/v1/a/organization/group/'+ $scope.group.id +'/patient/'+ $scope.sendPatient.id +'/sms';
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
});

app.filter('fromNow', function() {
    return function(dateString) {
        return moment(dateString).fromNow()
    };
});
