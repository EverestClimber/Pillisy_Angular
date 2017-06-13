/** Pillsy
*  @author  Chuks Onwuneme
*  @version 1.0
*  @package GroupPatientsReportsController AngularJS module
*  @Copyright 2016 Pillsy, Inc.  
*/
var app = angular.module('GroupPatientsReportsController', ['ngGrid','GroupDetails']);     //instantiates GroupPatientsReportsController module
app.controller('groupPatientsReportsController', function ($scope, $filter, $http, $location, $rootScope, apiService, groupDetails, stateService) {
    'use strict';

    console.log('groupPatientsReportsController');

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
            pageSizes: [25, 50, 100],
            pageSize:  25,
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

        //last week interval
        var interval = {
            startTime:  lastMonday.valueOf(),
            endTime:    lastSunday.valueOf(),
            today:      now.valueOf,
            startOfDay: moment(now).startOf('day').valueOf(),
            endOfDay:   moment(now).endOf('day').valueOf()
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
            var request = 'fetch_group_patients';
            var api     = '/v1/a/organization/group/'+groupId+'/patients?interval='+getInterval()+'&request='+request;
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
                                "name":             patient.name,
                                "status":           patient.status,
                                "today":            patient.adherence_today,
                                "interval":         70,//patient.adherence_interval,
                                "all_time":         patient.adherence_all,
                                "last_connected":   moment().format("YYYY-MM-DD  h:mm:ssa"),
                                "last_opened":      moment().format("YYYY-MM-DD  h:mm:ssa"),
                                "start_date":       moment().format("YYYY-MM-DD  h:mm:ssa"),
                                "drug":             'Lipitor',
                                "address1":         patient.address1,
                                "address2":         patient.address2,
                                "city":             patient.city,
                                "state":            patient.state,
                                "zip":              patient.zip,
                                "phone":            patient.phone,
                                "phone_formatted":  getFormattedPhone(patient.phone),
                                "phone2":           patient.phone2,
                                "email":            patient.email,
                                "drugs":            drugsStr,
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

    $scope.mySelections = [];

    var rowTemplate     = '<div ng-click="openPatientRecord(row)" ng-style="{ \'cursor\': row.cursor }" ng-repeat="col in renderedColumns" '+
                          'ng-class="col.colIndex()" class="ngCell {{col.cellClass}}"><div class="ngVerticalBar" ng-style="{height: rowHeight}" '+
                          'ng-class="{ ngVerticalBarVisible: !$last }">&nbsp;</div><div ng-cell></div></div>';
    
    var cellTemplate    = '<div class="ngCellText" ng-class="{ \'ok\' : row.getProperty(\'interval\') >= \'90\',  \'warning\' : (row.getProperty(\'interval\') >= \'60\') && (row.getProperty(\'interval\') < \'90\'), \'critical\' : row.getProperty(\'interval\') < \'60\'}" >{{ row.getProperty(col.field) }}</div>';

    var removeTemplate  = '<div><input type="button" value="Remove" ng-click="removeRow($event, row.entity)" />';
    var messageTemplate = '<div><input type="button" value="{{ row.entity.phone_formatted }}" ng-click="$event.stopPropagation()"/>'+
                          '<input type="button" value="SMS" ng-click="messagePatient($event, row.entity)" /></div>'; 


    $scope.gridOptions = {
        data:             'myData',
        columnDefs: [
            { field:'name',           displayName: 'Name' },
            { field:'drug',           displayName: 'Drugs' },
            { field:'interval',       displayName: 'Last Week', cellTemplate: cellTemplate},
            { field:'all_time',       displayName: 'All time' },
            { field:'last_connected', displayName: 'Last connected' },
            { field:'last_opened',    displayName: 'Last opened' },
            { field:'start_date',     displayName: 'Start date' },
            { field:'phone',          displayName: 'Mobile#', cellTemplate: messageTemplate },
            { field:'remove',         displayName:'', cellTemplate: removeTemplate}
        ],
        multiSelect:                false,
        enablePaging:               true,
        showFooter:                 true,
        enableRowSelection:         true, 
        enableSelectAll:            false,
        enableRowHeaderSelection:   false,
        noUnselect:                 true,
        enableGridMenu:             true,
        enableColumnResize:         true,
        totalServerItems:           'totalServerItems',
        pagingOptions:              $scope.pagingOptions,
        filterOptions:              $scope.filterOptions,
        rowTemplate:                rowTemplate
    };

    $scope.messagePatient = function($event, patient) {
        $event.stopPropagation();

        var data = {
            patient: patient,
            groupId: $scope.groupId
        };

        $rootScope.$broadcast("send_message_to_patient", data);
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
    };

});

app.filter('fromNow', function() {
    return function(dateString) {
        return moment(dateString).fromNow()
    };
});
