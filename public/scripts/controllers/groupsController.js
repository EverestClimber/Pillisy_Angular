/** Pillsy
*  @author  Chuks Onwuneme
*  @version 1.0
*  @package GroupsController AngularJS module  
*/

var app = angular.module('GroupsController', ['theme.core.services', 'GroupDetails']);     //instantiates GroupsController module
app.controller('groupsController', function ($scope, $theme, $location, $rootScope, stateService, apiService, groupDetails) {
	'use strict';

	var user = stateService.getUser();

    if (user.role == 'org_user'){
        $scope.is_group_admin = false;
    }
    else{
        $scope.is_group_admin = true;
    }

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

    $scope.setPagingData = function(data, page, pageSize) {
        var pagedData = data.slice((page - 1) * pageSize, page * pageSize);

        pagedData = pagedData.filter(function(group){
            return group.group_type != 'master';
        });

        $scope.myData = pagedData;
        $scope.totalServerItems = data.length;
        if (!$scope.$$phase) {
          	$scope.$apply();
        }
    };

    $scope.refreshGroups = function(){
        getPagedDataAsync($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage);
    };

    function getPagedDataAsync(pageSize, page, searchText) {
        $scope.loadingGroups = true;

        setTimeout(function() {
            var userId = user.id;

            if (userId){
	          	var request = 'get_organization_user_groups';  
                var api     = '/v1/a/organization/user/groups';

        	    console.log('groupsController - apiService.get - api to call is: '+api);

        		apiService.get(api).then(function(result){
	              	$scope.loadingGroups = false;

	              	if (result){
	                	if (result.msg == 'success'){
                            console.log('groupsController - apiService.get - successfully retrieved groups: '+JSON.stringify(result));

	                  		var largeLoad = [];
	                  		var groups    = result.data;

	                  		groups.forEach(function(group){
                                var obj = {
                                    "id":          group.id,
                                    "group_type":  group.type,
                                    "name":        group.name,
                                    "description": group.description,
                                    "patients":    group.patients,
                                    "members":     group.members,
                                    "label":       group.name,
                                    "isAdmin":     group.isAdmin,
                                    "url":         '/group/data',
                                    "type":        'group'
                                };

                                largeLoad.push(obj);
                            });

                            $scope.setPagingData(largeLoad, page, pageSize);
                            stateService.setUserGroups(largeLoad);
                            $rootScope.$emit("my_groups_callback", {groups: largeLoad});
                        }
                        else{
                            console.log('groupsController - apiService.get - error creating group: '+result.msg);

	                        alert(result.msg);
	                    }
	              	}
	              	else{
	                	console.log('groupsController - apiService.get - error - no result from server');
	              	}
                });
            }
	        else{
	          	$scope.setPagingData([], page, pageSize);
	        }
	  	}, 100);
    };

    //read from cache first, before reading from server
    var cachedGroups = stateService.getUserGroups();
    if (cachedGroups){
        $scope.setPagingData(cachedGroups, $scope.pagingOptions.currentPage, $scope.pagingOptions.pageSize);
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

    var nameTemplate = '<div><input type="button" style="color: #2685ee" value="{{ row.entity.name }}" ng-click="openGroupDetails(row)"/></div>'; 

    var columnDefs = [
        { field:'name',         displayName: 'Name',    cellTemplate: nameTemplate },
        { field:'patients',     displayName: 'Number of Patients' },
    ];

    if ($scope.is_group_admin){
        columnDefs.push({ field:'members', displayName: 'Number of team members' });
    }

    $scope.gridOptions = {
        data:                      'myData',
        columnDefs:                 columnDefs,
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

    $scope.openGroupDetails = function(rowItem){
        console.log('groupsController - openGroupDetails - ');

        var group = rowItem.entity;
        
        if (stateService.setActiveGroup(group)){
            $location.path('/group/data');
        }
    };

    //create
    $scope.cancelCreate = function(){
        console.log('groupsController - cancelCreate()');

        $location.path('/groups/data');
    };

    $scope.group = {
        name: '',
        description: ''
    };

    $scope.submitCreate = function(){
        console.log('groupsController - submitCreate() - group is: '+JSON.stringify($scope.group));
        console.log('groupsController - groupname: '+ $scope.group.name);
        console.log('groupsController - groupdescription: '+ $scope.group.description);

        $scope.loadingGroups = true;

        // If form is invalid, return and let AngularJS show validation errors.
        if (!$scope.group.name){
            console.log('groupsController - createNewGroup() - missing groupname, return...');

            return;
        }
        else if (!$scope.group.description){
            console.log('groupsController - createNewGroup() - missing groupdescription, return...');

            return;
        }
        else{
            console.log('groupsController - createNewGroup() - group fields ok, proceed...');

            var api = '/v1/a/organization/group';
            console.log('groupsController - apiService.post - api to call is: '+api);

            apiService.post(api,$scope.group).then(function(result){
                $scope.loadingGroups = false;

                if (result){
                    if (result.msg == 'success'){
                        console.log('groupsController - apiService.post - successfully created group. Redirecting to open group');

                        var group = result.data;

                        var obj = {
                            "id":          group.id,
                            "name":        group.name,
                            "description": group.description,
                            "patients":    group.patients,
                            "members":     group.members,
                            "label":       group.name,
                            "isAdmin":     group.isAdmin,
                            "url":         '/group/data',
                            "type":        'group'
                        };

                        var userGroups = stateService.getUserGroups();
                        if (userGroups){
                            userGroups.push(obj);
                            stateService.setUserGroups(userGroups);
                        }
                        else{
                            userGroups = [];
                            userGroups.push(obj);
                            stateService.setUserGroups(userGroups);
                        }

                        $rootScope.$emit("my_groups_callback", {groups: userGroups});
                        $location.path('/groups/data');
                    }
                    else{
                        console.log('groupsController - apiService.post - error creating group: '+result.msg);

                        alert(result.msg);
                    }
                }
                else{
                    console.log('groupsController - apiService.post - error - no result from server');
                }
            });
        }
    }

});

app.filter('fromNow', function() {
    return function(dateString) {
      	return moment(dateString).fromNow()
    };
});

