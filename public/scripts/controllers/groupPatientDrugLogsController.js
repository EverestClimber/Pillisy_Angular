/** Pillsy
*  @author  Chuks Onwuneme
*  @version 1.0
*  @package GroupPatientDrugLogsController AngularJS module  
*  @Copyright Pillsy, Inc. 
*/

var app = angular.module('GroupPatientDrugLogsController', ['ngGrid','daterangepicker']);     //instantiates GroupPatientDrugLogsController module
app.controller('groupPatientDrugLogsController', function ($scope, $filter, $http, $location, apiService, stateService) {
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
        $scope.logsDatePicker      = {};
        $scope.logsDatePicker.date = {
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
        $scope.loadingLogs = true;
        $scope.getPagedDataAsync($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage);
    }

    //Watch for date changes
    $scope.$watch('logsDatePicker.date', function(newValue, oldValue) {
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

    $scope.logRanges = {
        'Today':        [ moment(), moment() ],
        'Yesterday':    [ moment().subtract(1, 'days'), moment().subtract(1, 'days') ],
        'Last 7 days':  [ moment().subtract(7, 'days'), moment() ],
        'Last 30 days': [ moment().subtract(30,'days'), moment() ],
        'This month':   [ moment().startOf('month'), moment().endOf('month') ]
    };

    $scope.refreshLogs = function(){
        refresh();
        $scope.getPagedDataAsync($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage);
    };

    function callPillsyService(pageSize, page, searchText){
        console.log('groupMembersController - callPillsySerice');

        var startTime = moment($scope.logsDatePicker.date.startDate).startOf('day');
        var endTime   = moment($scope.logsDatePicker.date.endDate).startOf('day');

        var interval = {
            startTime: startTime.valueOf(),
            endTime:   endTime.valueOf()
        };

        interval = decodeURIComponent( JSON.stringify(interval) );

        if ($scope.groupId && $scope.patientId && $scope.drugId){
            var request = 'fetch_group_patient_drug_events';
            var api     = '/v1/a/organization/group/'+ $scope.groupId +'/patient/'+ $scope.patientId +'/drug/'+ $scope.drugId +'/drugEvents?interval='+interval+'&request='+request;
            var data;

            console.log('groupMembersController - callPillsySerice - api: '+api);

            apiService.get(api).then(function(result){
                $scope.loadingLogs = false;

                if (result){
                    if (result.msg == 'success'){
                        console.log('groupMembersController - callPillsySerice - apiService.get - successfully retrieved drugEvents: '+result);

                        // result.docs 
                        // result.total 
                        // result.limit - 10 
                        // result.page - 3 
                        // result.pages
                         
                        var drugEvents = result.data;
                        var objs       = [];

                        drugEvents.forEach(function(drugEvent){
                            var obj   = {};
                            obj.date  = moment(drugEvent.eventTime).format('YYYY-MM-DD');
                            obj.time  = moment(drugEvent.eventTime).format("HH:mm A");
                            obj.event = drugEvent.eventValue; 
                            
                            objs.push(obj);
                        });

                        $scope.setPagingData(objs, page, pageSize);
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
        $scope.loadingLogs = true;
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
            { field:'date',  displayName: 'Date' },
            { field:'time',  displayName: 'Time' },
            { field:'event', displayName: 'Event' }
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

app.filter('fromNow', function() {
    return function(dateString) {
        return moment(dateString).fromNow()
    };
});
