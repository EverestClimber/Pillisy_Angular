/** Pillsy
*  @author  Chuks Onwuneme
*  @version 1.0
*  @package GroupPatientsController AngularJS module  
*/

var app = angular.module('GroupPatientsController', ['ngGrid','GroupDetails']);     //instantiates GroupPatientsController module
app.controller('groupPatientsController', function ($scope, $filter, $http, $location, $rootScope, apiService, groupDetails, stateService) {
	'use strict';

    console.log('groupPatientsController');

	var pillsy = stateService.getPillsy();

    if (!pillsy.active_group) {
        $location.path('/');
    }
    else{
        initVars();
    }
   
   	function initVars(){
	   	$scope.groupId      = pillsy.active_group.id;
        $scope.groupName    = pillsy.active_group.name;
        $scope.groupExtName = pillsy.active_group.identifier;

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

    $scope.setPagingData = function(data, page, pageSize) {
        var pagedData = data.slice((page - 1) * pageSize, page * pageSize);
        $scope.myData = pagedData;
        $scope.totalServerItems = data.length;
        if (!$scope.$$phase) {
          	$scope.$apply();
        }
    };

    $scope.refreshPatients = function(){
        $scope.getPagedDataAsync($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage);
    };

    function fireoffGroupDetailsFetch(pageSize, page, searchText){

    	var groupid = $scope.groupId;

    	if (groupid){
            var request  = 'fetch_group_patients';
            var interval = 'last_7_days'; 
            var today    = new Date().getTime();
    		var api      = '/v1/a/organization/group/'+groupid+'/patients?interval='+interval+'&request='+request+'&today='+today;
	        var data;

	        apiService.get(api).then(function(result){
	            $scope.loadingPatients = false;

	            if (result){
	                if (result.msg == 'success'){
	                  	console.log('groupPatientsController - apiService.get - successfully retrieved group patients: '+result);

	                  	var largeLoad = [];
	                  	result.data.forEach(function(patient){

	                    	var obj = {
	                        	"id":           patient.id,
	                        	"name":         patient.name,
	                        	"status":       patient.status,
	                        	"today":        patient.adherence_today,
	                        	"interval":     patient.adherence_interval,
	                        	"all_time":     patient.adherence_all,
                                "address1":     patient.address1,
                                "address2":     patient.address2,
                                "city":         patient.city,
                                "state":        patient.state,
                                "zip":          patient.zip,
                                "phone":        patient.phone,
                                "phone2":       patient.phone2,
                                "email":        patient.email
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
    
    $scope.getPagedDataAsync = function(pageSize, page, searchText) {
        $scope.loadingPatients = true;

        setTimeout(function() {
	        fireoffGroupDetailsFetch(pageSize, page, searchText);
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

    $scope.$watch(function() {
	  	return $rootScope.active_group;
	}, function() {

	  	initVars();
    	$scope.getPagedDataAsync($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage);

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

    var rowTemplate = '<div ng-click="openPatientRecord(row)" ng-style="{ \'cursor\': row.cursor }" ng-repeat="col in renderedColumns" ng-class="col.colIndex()" class="ngCell {{col.cellClass}}"><div class="ngVerticalBar" ng-style="{height: rowHeight}" ng-class="{ ngVerticalBarVisible: !$last }">&nbsp;</div><div ng-cell></div></div>';

    $scope.gridOptions = {
        data:             'myData',
        columnDefs: [
          	{ field:'name',     displayName: 'Name' },
          	{ field:'status',   displayName: 'Status' },
          	{ field:'today',    displayName: 'Today' },
          	{ field:'interval', displayName: 'Last 7 days' },
          	{ field:'all_time', displayName: 'All time' }
        ],
        multiSelect:        		false,
        enablePaging:       		true,
        showFooter:         		true,
        enableRowSelection: 		true, 
        enableSelectAll:    		false,
        enableRowHeaderSelection: 	false,
        noUnselect:         		true,
        enableGridMenu:     		true,
        totalServerItems:   		'totalServerItems',
        pagingOptions:      		$scope.pagingOptions,
        filterOptions:      		$scope.filterOptions,
        rowTemplate:        		rowTemplate
    };

});

app.filter('fromNow', function() {
    return function(dateString) {
      	return moment(dateString).fromNow()
    };
});

