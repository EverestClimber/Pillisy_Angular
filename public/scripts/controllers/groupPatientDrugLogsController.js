/** Pillsy
*  @author  Chuks Onwuneme
*  @version 1.0
*  @package GroupPatientDrugLogsController AngularJS module  
*  @Copyright Pillsy, Inc. 
*/


var app = angular.module('GroupPatientDrugLogsController', ['ngGrid','daterangepicker']);     //instantiates GroupPatientDrugLogsController module
app.controller('groupPatientDrugLogsController', function ($scope, $filter, $http, $location, apiService, stateService) {
	'use strict';

    //patient cache data
    $scope.activeGroup = stateService.getActiveGroup();
    var last7;

    if (!$scope.activeGroup){
        $location.path('/');
    }
    else{
        try{

            $scope.activePatient = stateService.getActivePatient();
            $scope.activeDrug    = stateService.getActivePatientDrug();

            initVars();
        }
        catch(e){
            $location.path('/');
        }
    }

    function initVars(){

        var now = moment();
        
        $scope.logRanges = {
            'Today':        [ moment(now).startOf('day'), moment(now).endOf('day') ],
            'Yesterday':    [ moment(now).subtract(1, 'days').startOf('day'), moment(now).subtract(1, 'days').endOf('day') ],
            'Last 7 days':  [ moment(now).subtract(7, 'days').startOf('day'), moment(now).endOf('day') ],
            'Last 30 days': [ moment(now).subtract(30,'days').startOf('day'), moment(now).endOf('day') ],
            'This month':   [ moment(now).startOf('month').startOf('day'), moment(now).endOf('month').endOf('day') ]
        };

        var ranges = $scope.logRanges;
        last7  = ranges['Last 7 days'];

        $scope.logsDatePicker      = {};
        $scope.logsDatePicker.date = {
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

    $scope.refreshLogs = function(){
        refresh();
    };

    function callPillsyService(pageSize, page, searchText){
        console.log('groupMembersController - callPillsySerice');

        var now = new Date();

        var interval = {
            intervalStartTime:  moment($scope.logsDatePicker.date.startDate).startOf('day').valueOf(),
            intervalEndTime:    moment($scope.logsDatePicker.date.endDate).endOf('day').valueOf(),
            now:                now.getTime(),
            timeZoneOffset:     now.getTimezoneOffset()
        };

        interval = decodeURIComponent( JSON.stringify(interval) );

        if ($scope.activeGroup.id && $scope.activePatient.id && $scope.activeDrug.id){
            var request = 'fetch_group_patient_drug_events';
            var api     = '/v1/a/organization/group/'+ $scope.activeGroup.id +'/patient/'+ $scope.activePatient.id +'/drug/'+ $scope.activeDrug.id +'/drugEvents?interval='+interval+'&request='+request;
            var data;

            console.log('groupMembersController - callPillsySerice - api: '+api);

            $scope.loadingLogs = true;
            apiService.get(api).then(function(result){
                $scope.loadingLogs = false;

                if (result){
                    if (result.msg == 'success'){
                        console.log('groupMembersController - callPillsySerice - apiService.get - successfully retrieved drugEvents: '+result);

                        var drugEvents = result.data;
                        var objs       = [];

                        drugEvents.forEach(function(drugEvent){
                            var obj      = {};
                            obj.date     = moment(drugEvent.eventTime).format('YYYY-MM-DD');
                            obj.time     = moment(drugEvent.eventTime).format("h:mm:ss A");
                            obj.event    = drugEvent.eventValue; 
                            obj.platform = drugEvent.platform;
                            obj.method   = drugEvent.method === 'AUTO' ? 'DEVICE' : 'MOBILE APP';
                            
                            objs.push(obj);
                        });

                        if ( ($scope.logsDatePicker.date.startDate == last7[0]) && ($scope.logsDatePicker.date.endDate == last7[1]) ){
                            stateService.setPatientDrugDefaultIntervalCache($scope.activePatient.id, $scope.activeDrug.id, objs, 'logs');
                        }

                        $scope.setPagingData(objs, page, pageSize);
                    }
                    else{
                        console.log('groupMembersController - callPillsySerice - apiService.get - error creating group: '+result.msg);

                        //alert(result.msg);
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
    var logs = stateService.getPatientDrugDefaultIntervalCache($scope.activePatient.id, $scope.activeDrug.id, 'logs');
    if (logs){
        $scope.setPagingData(logs, $scope.pagingOptions.currentPage, $scope.pagingOptions.pageSize);
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

    $scope.logGridOptions = {
        data:             'myData',
        enablePaging:     true,
        showFooter:       true,
        totalServerItems: 'totalServerItems',
        pagingOptions:    $scope.pagingOptions,
        filterOptions:    $scope.filterOptions,
        columnDefs: [
            { field:'date',     displayName: 'Date' },
            { field:'time',     displayName: 'Time' },
            { field:'event',    displayName: 'Event' },
            { field:'platform', displayName: 'Platform' },
            { field:'method',   displayName: 'Method' }
        ],
        multiSelect:                false,
        enablePaging:               true,
        showFooter:                 true,
        enableRowSelection:         false, 
        enableSelectAll:            false,
        enableColumnResize:         true,
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
