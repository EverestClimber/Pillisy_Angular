/** Pillsy
*  @author  Chuks Onwuneme
*  @version 1.0
*  @package GroupPatientDrugScheduleController AngularJS module 
*  @Copyright Pillsy, Inc.  
*/

var app = angular.module('GroupPatientDrugScheduleController', ['ngGrid','daterangepicker']);     //instantiates GroupPatientDrugScheduleController module
app.controller('groupPatientDrugScheduleController', function ($scope, $http, $location, apiService, stateService) {
	'use strict';

    //patient cache data
    $scope.activeGroup = stateService.getActiveGroup();
    var last7;

    if (!$scope.activeGroup){
        $location.path('/');
    }
    else{
        try{
            initVars();
        }
        catch(e){
            alert('error: '+e);

            $location.path('/');
        }
    }
    
    function initVars(){

        $scope.activePatient = $scope.activeGroup.active_patient;
        $scope.activeDrug    = $scope.activeGroup.active_patient.active_drug;

        $scope.ranges = {
            'Today':        [ moment().startOf('day'), moment().endOf('day') ],
            'Yesterday':    [ moment().subtract(1, 'days').startOf('day'), moment().subtract(1, 'days').endOf('day') ],
            'Last 7 days':  [ moment().subtract(7, 'days').startOf('day'), moment().endOf('day') ],
            'Last 30 days': [ moment().subtract(30,'days').startOf('day'), moment().endOf('day') ],
            'This month':   [ moment().startOf('month').startOf('day'), moment().endOf('month').endOf('day') ]
        };

        var ranges = $scope.ranges;
        last7  = ranges['Last 7 days'];

        $scope.datePicker      = {};
        $scope.datePicker.date = {
            startDate: last7[0],
            endDate:   last7[1] 
        };

        $scope.filterOptions = {
            filterText: '',
            useExternalFilter: true
        };

        $scope.totalServerItems = 0;
        $scope.pagingOptions = {
            pageSizes:   [25, 50, 100],
            pageSize:    25,
            currentPage: 1
        };
    }

    var refresh = function(){
        getPagedDataAsync($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage);
    }

    //Watch for date changes
    $scope.$watch('datePicker.date', function(newValue, oldValue) {
        refresh();
    });

    $scope.setPagingData = function(data, page, pageSize) {
        var pagedData = data.slice((page - 1) * pageSize, page * pageSize);
        $scope.myData = pagedData;
        $scope.totalServerItems = data.length;
        if (!$scope.$$phase) {
            $scope.$apply();
        }
    };

    $scope.refreshSchedule = function(){
        refresh();
    };

    function callPillsyService(pageSize, page, searchText){
        console.log('groupMembersController - callPillsySerice');

        var startTime = moment($scope.datePicker.date.startDate).startOf('day');
        var endTime   = moment($scope.datePicker.date.endDate).endOf('day');

        var interval = {
            startTime: startTime.valueOf(),
            endTime:   endTime.valueOf(),
            today:     new Date().getTime()
        };

        interval = decodeURIComponent( JSON.stringify(interval) );

        if ($scope.activeGroup.id && $scope.activePatient.id && $scope.activeDrug.id){
            var request = 'fetch_group_patient_drug_reminder_summary';
            var api     = '/v1/a/organization/group/'+ $scope.activeGroup.id +'/patient/'+ $scope.activePatient.id +'/drug/'+ $scope.activeDrug.id +'/schedule/summary?interval='+interval+'&request='+request;
            var data;

            console.log('groupMembersController - callPillsySerice - api: '+api);

            $scope.loadingSchedule = true;
            apiService.get(api).then(function(result){
                $scope.loadingSchedule = false;

                if (result){
                    if (result.msg == 'success'){
                        console.log('groupMembersController - callPillsySerice - apiService.get - successfully retrieved drugEvents: '+result);

                        var scheduleEvents = result.data;
                        scheduleEvents.forEach(function(scheduleEvent){
                            scheduleEvent.date = moment(scheduleEvent.date).format('YYYY-MM-DD');
                            
                            if (scheduleEvent.reminder_time != 'N/A'){
                                scheduleEvent.reminder_time = moment(scheduleEvent.reminder_time).format("h:mm A");
                            }

                            if ( (scheduleEvent.open_time != 'N/A') && (scheduleEvent.open_time != '--') ){
                                scheduleEvent.open_time = moment(scheduleEvent.open_time).format("h:mm:ss A");
                            }
                        });

                        if ( ($scope.datePicker.date.startDate == last7[0]) && ($scope.datePicker.date.endDate == last7[1]) ){
                            stateService.setPatientDrugDefaultIntervalCache($scope.activePatient.id, $scope.activeDrug.id, scheduleEvents, 'schedule');
                        }

                        $scope.setPagingData(scheduleEvents, page, pageSize);
                    }
                    else{
                        console.log('groupMembersController - callPillsySerice - apiService.get - error creating group: '+result.msg);

                        alert(result.msg);
                    }
                }
                else{
                    console.log('groupMembersController - callPillsySerice - apiService.get - error - no result from server');
                }
            });
        }
        else{
            $scope.setPagingData([], page, pageSize);
        }
    }

    var getPagedDataAsync = function(pageSize, page, searchText) { 
        callPillsyService(pageSize, page, searchText);
    };

    //load from cache
    if ($scope.activePatient && $scope.activeDrug){
        var schedule = stateService.getPatientDrugDefaultIntervalCache($scope.activePatient.id, $scope.activeDrug.id, 'schedule');
        if (schedule){
            $scope.setPagingData(schedule, $scope.pagingOptions.currentPage, $scope.pagingOptions.pageSize);
        }
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

    var cellTemplate = '<div class="ngCellText" ng-class="{\'green\' : row.getProperty(\'status\') == \'OKAY\' }">{{ row.getProperty(col.field) }}</div>';

    $scope.scheduleGridOptions = {
        data:             'myData',
        enablePaging:     true,
        showFooter:       true,
        totalServerItems: 'totalServerItems',
        pagingOptions:    $scope.pagingOptions,
        filterOptions:    $scope.filterOptions,
        columnDefs: [
            { field: 'date',          displayName: 'Date' },
            { field: 'reminder_time', displayName: 'Dose Time' },
            { field: 'open_time',     displayName: 'Dose Taken At'},
            { field: 'status',        displayName: 'Status', cellTemplate: cellTemplate }
        ],
        multiSelect:                false,
        enablePaging:               true,
        showFooter:                 true,
        enableRowSelection:         false, 
        enableSelectAll:            false,
        enableColumnResize:         true,
        enableRowHeaderSelection:   false,
        noUnselect:                 false,
        enableGridMenu:             false
    };
});
