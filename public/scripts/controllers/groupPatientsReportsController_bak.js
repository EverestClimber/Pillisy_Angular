/** Pillsy
*  @author  Chuks Onwuneme
*  @version 1.0
*  @package GroupPatientsReportsController AngularJS module
*  @Copyright 2016 Pillsy, Inc.  
*/
var app = angular.module('GroupPatientsReportsController', ['ngGrid','GroupDetails']);     //instantiates GroupPatientsReportsController module
app.controller('groupPatientsReportsController', function ($scope, $filter, $http, $location, $rootScope, apiService, groupDetails, stateService) {
    'use strict';

    /*console.log('groupPatientsReportsController');

    var activeGroup = stateService.getActiveGroup();

    if (!activeGroup) {
        $location.path('/');
    }
    else{
        initVars();
    }
   
    function initVars(){
        $scope.groupId        = activeGroup.id;
        $scope.groupName      = activeGroup.name;
        $scope.groupExtName   = activeGroup.identifier;

        $scope.filterOptions = {
            filterText: '',
            useExternalFilter: true
        };

        $scope.totalServerItems = 0;
        $scope.pagingOptions = {
            pageSizes: [50, 100],
            pageSize:  50,
            currentPage: 1
        };
    }

    function getInterval(){
        var now = moment();

        //last sunday to last monday
        //start week on Monday
        moment().startOf('isoWeek');

        //last Monday
        var lastMonday = moment(now).isoWeekday(-6).startOf('day');
        var lastSunday = moment(lastMonday).add(6, 'days').endOf('day');

        console.log(' last monday\'s date was: '+lastMonday.toDate()+' last sunday\'s date was: '+lastSunday.toDate());

        var intervalStartTime = moment(now.valueOf()).startOf('day').subtract(7,'days').valueOf();
        var intervalEndTime   = moment(now.valueOf()).endOf('day').valueOf();

        //last week interval
        var interval = {
            intervalStartTime: intervalStartTime.valueOf(),
            intervalEndTime:   intervalEndTime.valueOf(),
            lastweekStartTime: lastMonday.valueOf(),
            lastweekEndTime:   lastSunday.valueOf(),
            today:             now.valueOf
        };

        return encodeURIComponent( JSON.stringify(interval) );
    }

    $scope.setPagingData = function(data, page, pageSize) {
        var pagedData = data.slice((page - 1) * pageSize, page * pageSize);
        $scope.myData = pagedData;
        $scope.totalServerItems = data.length;
        if (!$scope.$$phase) {
            $scope.$apply();
        }
    };

    $scope.refreshPatients = function(){
        getPagedDataAsync($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage);
    };

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

    function fireoffGroupDetailsFetch(pageSize, page, searchText){
        var groupId = $scope.groupId;

        if (groupId){
            var request = 'fetch_group_patients_report';
            var api     = '/v1/a/organization/group/'+groupId+'/patients/drugs/adherence?interval='+getInterval()+'&request='+request;
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
                                "drug":             patient.drugName,
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

                        stateService.setGroupDetails($scope.groupId, largeLoad);
                        $scope.setPagingData(largeLoad, page, pageSize);
                        $rootScope.$broadcast('received_report_data');
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
            $scope.setPagingData([], page, pageSize);
        }
    }

    function getRandomIntInclusive(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
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

    function getPagedDataAsync(pageSize, page, searchText) {
        fireoffGroupDetailsFetch(pageSize, page, searchText);
    };

    //get from cache
    var cachedData = stateService.getGroupDetails($scope.groupId)
    if (cachedData){
        $scope.setPagingData(cachedData, $scope.pagingOptions.currentPage, $scope.pagingOptions.pageSize);
    }

    getPagedDataAsync($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage);

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

    $scope.mySelections = [];

    var adherenceTemplate = '<div class="ngCellText"><span style="font-size: 12px; font-weight:bold" ng-class="getAdherenceClassName(row.getProperty(\'lastweek\'))">{{ row.getProperty(col.field) }}</span></div>';
    //var messageTemplate   = '<div class="ngCellText">{{ row.entity.phone_formatted }}<a style="color: #2685ee" ng-click="messagePatient($event, row.entity)">&nbsp;&nbsp;&nbsp;SMS</a></div>';
    var messageTemplate   = '<div class="ngCellText">{{ row.entity.phone_formatted }}<a style="color: #2685ee" ng-click="messagePatient($event, row.entity)">&nbsp;&nbsp;&nbsp;&nbsp;SMS</a><a style="color: #2685ee" ng-click="callPatient($event, row.entity)">&nbsp;&nbsp;&nbsp;&nbsp;Call</a></div>';

    var nameTemplate      = '<div><input type="button" style="color: #2685ee" value="{{ row.entity.name }}" ng-click="openPatientRecord(row)"/></div>'; 

    $scope.gridOptions = {
        data:             'myData',
        columnDefs: [
            { field:'name',           displayName: 'Name',          cellTemplate: nameTemplate },
            { field:'drug',           displayName: 'Drugs' },
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
        totalServerItems:           'totalServerItems',
        pagingOptions:              $scope.pagingOptions,
        filterOptions:              $scope.filterOptions,
        enableCellSelection:        false
    };

    $scope.messagePatient = function($event, patient) {
        $event.stopPropagation();

        var data = {
            patient: patient,
            groupId: $scope.groupId
        };

        $rootScope.$broadcast("send_message_to_patient", data);
    }

    $scope.callPatient = function($event, patient) {
        $event.stopPropagation();

        var data = {
            patient: patient,
            groupId: $scope.groupId
        };

        $rootScope.$broadcast("call_patient", data);
    }

    $scope.removeRow = function($event, patient) {
        $event.stopPropagation();
        var answer = confirm('Are you sure you want to remove '+patient.name+' from this group?');
        
        if (answer){
            var request = 'remove_patient_from_group';
            var api     = '/v1/a/organization/group/'+ $scope.groupId +'/patient/'+patient.id;
            
            $scope.loadingPatients = true;

            apiService.delete(api).then(function(result){
                $scope.loadingPatients = false;

                if (result){
                    if (result.msg == 'success'){

                        var groupDetails = stateService.getGroupDetails($scope.groupId);

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
                                        if (group.id == $scope.groupId){
                                            group.patients = data.numPatients;
                                            return true;
                                        }
                                    });

                                    stateService.setUserGroups(userGroups);
                                }
                            }
                        }

                        stateService.setGroupDetails($scope.groupId, groupDetails);
                        $scope.myData.splice($scope.myData.indexOf(patient), 1);
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
    };*/

});

app.filter('fromNow', function() {
    return function(dateString) {
        return moment(dateString).fromNow()
    };
});
