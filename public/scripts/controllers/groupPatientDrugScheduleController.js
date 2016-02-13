/** Pillsy
*  @author  Chuks Onwuneme
*  @version 1.0
*  @package GroupPatientDrugScheduleController AngularJS module 
*  @Copyright Pillsy, Inc.  
*/

var app = angular.module('GroupPatientDrugScheduleController', ['ngGrid','daterangepicker']);     //instantiates GroupPatientDrugScheduleController module
app.controller('groupPatientDrugScheduleController', function ($scope, $http, $location, apiService, stateService) {
	'use strict';

    var pillsy = stateService.getPillsy();

    if (!pillsy.active_group) {
        $location.path('/')
    }
    else{
        initVars();
    }

    function initVars(){

        var m = moment();
        $scope.datePicker      = {};
        $scope.datePicker.date = {
            startDate: m,
            endDate:   m
        };

        $scope.groupId      = pillsy.active_group.id;
        $scope.groupName    = pillsy.active_group.name;
        $scope.groupExtName = pillsy.active_group.identifier;
        $scope.patientId    = pillsy.active_patient.id;
        $scope.drugId       = pillsy.active_patient_med.id;

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
        $scope.loadingSchedule = true;
        $scope.getPagedDataAsync($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage);
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

    $scope.ranges = {
        'Today':        [ moment(), moment() ],
        'Yesterday':    [ moment().subtract(1, 'days'), moment().subtract(1, 'days') ],
        'Last 7 days':  [ moment().subtract(7, 'days'), moment() ],
        'Last 30 days': [ moment().subtract(30,'days'), moment() ],
        'This month':   [ moment().startOf('month'), moment().endOf('month') ]
    };

    $scope.refreshSchedule = function(){
        refresh();
    };

    function callPillsyService(pageSize, page, searchText){
        console.log('groupMembersController - callPillsySerice');

        var startTime = moment($scope.datePicker.date.startDate).startOf('day').valueOf();
        var momentEnd = moment($scope.datePicker.date.endDate).endOf('day').valueOf();
        var now       = moment().valueOf();
        var endTime   = momentEnd > now ? now : momentEnd;

        var interval = {
            startTime: startTime,
            endTime:   endTime,
            today:     new Date().getTime()
        };

        interval = decodeURIComponent( JSON.stringify(interval) );

        if ($scope.groupId && $scope.patientId && $scope.drugId){
            var request = 'fetch_group_patient_drug_reminder_summary';
            var api     = '/v1/a/organization/group/'+ $scope.groupId +'/patient/'+ $scope.patientId +'/drug/'+ $scope.drugId +'/schedule/summary?interval='+interval+'&request='+request;
            var data;

            console.log('groupMembersController - callPillsySerice - api: '+api);

            apiService.get(api).then(function(result){
                $scope.loadingSchedule = false;

                if (result){
                    if (result.msg == 'success'){
                        console.log('groupMembersController - callPillsySerice - apiService.get - successfully retrieved drugEvents: '+result);

                        var scheduleEvents = result.data;
                        scheduleEvents.forEach(function(scheduleEvent){
                            scheduleEvent.date = moment(scheduleEvent.date).format('YYYY-MM-DD');
                            
                            scheduleEvent.reminder_time = scheduleEvent.reminder_time;
                            if (scheduleEvent.reminder_time != 'N/A'){
                                scheduleEvent.reminder_time = moment(scheduleEvent.reminder_time).format("HH:mm A");
                            }

                            scheduleEvent.open_time = scheduleEvent.open_time;
                            if (scheduleEvent.open_time != 'N/A'){
                                scheduleEvent.open_time = moment(scheduleEvent.open_time).format("HH:mm A");
                            }
                        });

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

    $scope.getPagedDataAsync = function(pageSize, page, searchText) { 
        $scope.loadingSchedule = true;

        setTimeout(function() {    
            callPillsyService(pageSize, page, searchText);
        }, 100);
    };

    $scope.getPagedDataAsync($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage);

    $scope.$watch('pagingOptions', function(newVal, oldVal) {
        if (newVal !== oldVal) {
            $scope.getPagedDataAsync($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage, $scope.filterOptions.filterText);
        }
    }, true);

    $scope.$watch('filterOptions', function(newVal, oldVal) {
        if (newVal !== oldVal) {
            $scope.getPagedDataAsync($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage, $scope.filterOptions.filterText);
        }
    }, true);

    $scope.gridOptions = {
        data:             'myData',
        enablePaging:     true,
        showFooter:       true,
        totalServerItems: 'totalServerItems',
        pagingOptions:    $scope.pagingOptions,
        filterOptions:    $scope.filterOptions,
        columnDefs: [
            { field: 'date',          displayName: 'Date' },
            { field: 'reminder_time', displayName: 'Time' },
            { field: 'status',        displayName: 'Status', cellTemplate: '<div class="ngCellText" ng-class="{\'green\' : row.getProperty(\'status\') == \'OKAY\' }">{{ row.getProperty(col.field) }}</div>' },
            { field: 'open_time',     displayName: 'Open Time'}
        ],
        multiSelect:                false,
        enablePaging:               true,
        showFooter:                 true,
        enableRowSelection:         false, 
        enableSelectAll:            false,
        enableRowHeaderSelection:   false,
        noUnselect:                 false,
        enableGridMenu:             false,
    };
});
