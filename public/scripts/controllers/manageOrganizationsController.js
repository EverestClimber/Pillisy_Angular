/** Pillsy
*  @author  Chuks Onwuneme
*  @version 1.0
*  @package ManageOrganizationsController AngularJS module  
*/

var app = angular.module('ManageOrganizationsController', ['theme.core.services', 'ajoslin.promise-tracker']);     //instantiates ManageOrganizationsController module
app.controller('manageOrganizationsController', function ($scope, $theme, $location, $rootScope, stateService, apiService, promiseTracker) {
	'use strict';

    //for create organization
    $scope.createOrgProgressMessage  = 'Please Wait...';
    $scope.createOrgProgressBackdrop = true;
    $scope.createOrgProgressPromise  = null;

	var user = stateService.getUser();

  	$scope.filterOptions = {
        filterText: '',
        useExternalFilter: true
    };

    $scope.totalServerItems = 0;
    $scope.pagingOptions = {
        pageSizes: ['25', '50', '100'],
        pageSize: '25',
        currentPage: 1
    };

    var setPagingData = function(data, page, pageSize) {

        var pagedData = data.slice((page - 1) * pageSize, page * pageSize);
        $scope.myData = pagedData;
        $scope.totalServerItems = data.length;
        if (!$scope.$$phase) {
          	$scope.$apply();
        }
    };

    $scope.refreshOrganizations = function(){
        getPagedDataAsync($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage);
    };

    function getPagedDataAsync(pageSize, page, searchText) {
        
        setTimeout(function() {
            var userId = user.id;

            if (userId){
	          	var request = 'get_organizations';  
                var api     = '/v1/a/admin/organizations';

        	    console.log('manageOrganizationsController - apiService.get - api to call is: '+api);

                $scope.loadingOrganizations = true;
                var promise = apiService.get(api);

                promise.then(
                    function(result) { 
                        processGetOrganizationsResult(result, page, pageSize);
                    },
                    function(errorPayload) {
                        //$log.error('failure loading movie', errorPayload);
                    });

                // Track the request and show its progress to the user.
                //$scope.progress.addPromise($promise);
            }
	        else{
	          	setPagingData([], page, pageSize);
	        }
	  	}, 100);
    };

    function processGetOrganizationsResult(result, page, pageSize){
        console.log('manageOrganizationsController - processGetOrganizationsResult');

        $scope.loadingOrganizations = false;

        if (result){
            if (result.msg == 'success'){
                console.log('manageOrganizationsController - apiService.get - successfully retrieved groups: '+JSON.stringify(result));

                var largeLoad     = [];
                var organizations = result.data;

                organizations.forEach(function(organization){
                    var obj = {
                        "id":            organization.id,
                        "name":          organization.name,
                        "status":        organization.status,
                        "num_members":   organization.num_members,
                        "num_patients":  organization.num_patients,
                        "url":           '/admin/organization/data',
                        "type":          'organization'
                    };

                    largeLoad.push(obj);
                });

                setPagingData(largeLoad, page, pageSize);
                stateService.setOrganizations(largeLoad);
                //$rootScope.$emit("my_groups_callback", {groups: largeLoad});
                //$rootScope.$emit("organizations_callback", {organizations: largeLoad});
            }
            else{
                console.log('manageOrganizationsController - apiService.get - error creating group: '+result.msg);

                alert(result.msg);
            }
        }
        else{
            console.log('manageOrganizationsController - apiService.get - error - no result from server');
        }
    }

    //read from cache first, before reading from server
    var cachedOrganizations = stateService.getOrganizations();
    if (cachedOrganizations){
        setPagingData(cachedOrganizations, $scope.pagingOptions.currentPage, $scope.pagingOptions.pageSize);
    }

    //now call server
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

    $scope.mySelections = [];

    var nameTemplate = '<div><input type="button" style="color: #2685ee" value="{{ row.entity.name }}" ng-click="openOrganizationDetails(row)"/></div>'; 

    $scope.gridOptions = {
        data:                      'myData',
        columnDefs: [
          	{ field: 'name',         displayName: 'Organization', cellTemplate: nameTemplate },
            { field: 'status',       displayName: 'Status' },
          	{ field: 'num_members',  displayName: 'No. Members' },
          	{ field: 'num_patients', displayName: 'No. Patients' },
        ],
        selectedItems:      		$scope.mySelections,
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

    $scope.openOrganizationDetails = function(rowItem){
        console.log('manageOrganizationsController - openOrganizationDetails - ');

        var organization = rowItem.entity;
        
        if (stateService.setActiveOrganization(organization)){
            $location.path('/admin/organization/data');
        }
    };

    //create
    $scope.cancelCreate = function(){
        console.log('manageOrganizationsController - cancelCreate()');

        $location.path('/admin/manageorganizations');
    };

    $scope.organization = {
        name:         '',
        status:       '',
        num_members:  '',
        num_patients: ''
    };

    $scope.submitCreate = function(){
        console.log('manageOrganizationsController - submitCreate() - organization is: '+JSON.stringify($scope.organization));

        // If form is invalid, return and let AngularJS show validation errors.
        if (!$scope.organization.org_name){
            console.log('manageOrganizationsController - submitCreate() - missing organization name, return...');

            return;
        }
        else if (!$scope.organization.org_domains){
            console.log('manageOrganizationsController - submitCreate() - missing organization domains, return...');

            return;
        }
        else if (!$scope.organization.org_type){
            console.log('manageOrganizationsController - submitCreate() - missing organization type, return...');

            return;
        }
        else if (!$scope.organization.org_support_phone){
            console.log('manageOrganizationsController - submitCreate() - missing organization support phone, return...');

            return;
        }
        else if (!$scope.organization.org_support_email){
            console.log('manageOrganizationsController - submitCreate() - missing organization support email, return...');

            return;
        }
        else if (!$scope.organization.firstname){
            console.log('manageOrganizationsController - submitCreate() - missing organization admin firstname, return...');

            return;
        }
        else if (!$scope.organization.lastname){
            console.log('manageOrganizationsController - submitCreate() - missing organization admin lastname, return...');

            return;
        }
        else if (!$scope.organization.email){
            console.log('manageOrganizationsController - submitCreate() - missing organization admin email, return...');

            return;
        }
        else if (!$scope.organization.phone){
            console.log('manageOrganizationsController - submitCreate() - missing organization admin phone, return...');

            return;
        }
        else if (!$scope.organization.title){
            console.log('manageOrganizationsController - submitCreate() - missing organization admin title, return...');

            return;
        }
        else{
            console.log('manageOrganizationsController - submitCreate() - group fields ok, proceed...');

            var api = '/v1/a/admin/organization';
            console.log('manageOrganizationsController - apiService.post - api to call is: '+api);

            $scope.createOrgProgressPromise = apiService.post(api, $scope.organization).then(function(result){
                processCreateOrganizationResult(result);
            }, function(error){
                alert(error);
            });
        }
    }

    function processCreateOrganizationResult(result){
        console.log('manageOrganizationsController - processCreateOrganizationResult');

        if (result){
            if (result.msg == 'success'){
                console.log('manageOrganizationsController - apiService.post - successfully created organization. Redirecting to open organization');

                var organization = result.data;

                var obj = {
                    "id":            organization.id,
                    "name":          organization.name,
                    "status":        organization.status,
                    "num_members":   organization.num_members,
                    "num_patients":  organization.num_patients,
                    "url":           '/admin/organization/data',
                    "type":          'organization'
                };

                var organizations = stateService.getOrganizations();
                if (organizations){
                    organizations.push(obj);
                    stateService.setOrganizations(organizations);
                }
                else{
                    organizations = [];
                    organizations.push(obj);
                    stateService.setOrganizations(organizations);
                }

                $rootScope.$emit("organizations_callback", {organizations: organizations});
                        
                if (stateService.setActiveOrganization(obj)){
                    $location.path('/admin/organization/data');
                }
            }
            else{
                console.log('manageOrganizationsController - apiService.post - error creating organization: '+result.msg);

                alert(result.msg);
            }
        }
        else{
            console.log('manageOrganizationsController - apiService.post - error - no result from server');
        }
    }
});

