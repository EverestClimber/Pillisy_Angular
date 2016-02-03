/** Pillsy
*  @author  Chuks Onwuneme
*  @version 1.0
*  @package GroupPatientDrugLogsController AngularJS module  
*/

var app = angular.module('GroupPatientDrugLogsController', ['ngGrid']);     //instantiates GroupPatientDrugLogsController module
app.controller('groupPatientDrugLogsController', function ($scope, $filter, $http, $location, $rootScope, apiService, stateService) {
	'use strict';

    var pillsy = stateService.getPillsy();

    if (!pillsy.active_group) {
        $location.path('/')
    }
    else{
        
        initVars();
    }

    function initVars(){

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

    $scope.setPagingData = function(data, page, pageSize) {
        var pagedData = data.slice((page - 1) * pageSize, page * pageSize);
        $scope.myData = pagedData;
        $scope.totalServerItems = data.length;
        if (!$scope.$$phase) {
            $scope.$apply();
        }
    };

    $scope.refreshLogs = function(){
        $scope.getPagedDataAsync($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage);
    };

    function callPillsyService(pageSize, page, searchText){
        console.log('groupMembersController - callPillsySerice');

        if ($scope.groupId && $scope.patientId && $scope.drugId){
            var request = 'fetch_group_patient_drug_events';
            var api     = '/v1/a/organization/group/'+ $scope.groupId +'/patient/'+ $scope.patientId +'/drug/'+ $scope.drugId +'/drugEvents?page='+page+'&pageSize='+pageSize;
            var data;

            console.log('groupMembersController - callPillsySerice - api: '+api);

            apiService.get(api).then(function(result){
                $scope.progress = false;

                if (result){
                    if (result.msg == 'success'){
                        console.log('groupMembersController - callPillsySerice - apiService.get - successfully retrieved drugEvents: '+result);

                        // result.docs 
                        // result.total 
                        // result.limit - 10 
                        // result.page - 3 
                        // result.pages
                         
                        var returnData = result.data;
                        var drugEvents = returnData.docs;
                        var objs       = [];

                        drugEvents.forEach(function(drugEvent){
                            var obj   = {};
                            obj.date  = getDate(drugEvent.eventTime);
                            obj.time  = getTime(drugEvent.eventTime); 
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

    function getTime(date) {
        var local = new Date(date);
        //local.setMinutes(date.getMinutes() - date.getTimezoneOffset());
        var time = local.getHours() + ":" + local.getMinutes() + ":" + local.getSeconds();
        return time;
    }

    function getDate(date) {
        var local = new Date(date);
        //local.setMinutes(date.getMinutes() - date.getTimezoneOffset());
        //return local.toJSON();
        return local.toJSON().slice(0, 10);
    }

});

app.filter('fromNow', function() {
    return function(dateString) {
        return moment(dateString).fromNow()
    };
});
