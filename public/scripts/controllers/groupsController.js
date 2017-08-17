/** Pillsy
*  @author  Chuks Onwuneme
*  @version 1.0
*  @package GroupsController AngularJS module  
*/

var app = angular.module('GroupsController', ['theme.core.services', 'GroupDetails']);     //instantiates GroupsController module
app.controller('groupsController', function ($scope, $theme, $location, $rootScope, stateService, apiService, groupDetails) {
	'use strict';

	var user = stateService.getUser();

  	$scope.filterOptions = {
        filterText: '',
        useExternalFilter: true
    };

    $scope.totalServerItems = 0;
    $scope.pagingOptions = {
        pageSizes: [25, 50, 100],
        pageSize: 25,
        currentPage: 1
    };

    $scope.setPagingData = function(data, page, pageSize) {
        var pagedData = data.slice((page - 1) * pageSize, page * pageSize);
        $scope.myData = pagedData;
        $scope.totalServerItems = data.length;
        if (!$scope.$$phase) {
          	$scope.$apply();
        }
    };

    $scope.refreshGroups = function(){
        getPagedDataAsync($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage);
    };

    function getInterval(){
        var now = new Date();

        var interval = {
            intervalStartTime:  moment(now.getTime()).subtract(3,'days').startOf('day').valueOf(),
            intervalEndTime:    now.getTime(),
            now:                now.getTime(),
            timeZoneOffset:     now.getTimezoneOffset()
        };

        return encodeURIComponent( JSON.stringify(interval) );
    }

    function getPagedDataAsync(pageSize, page, searchText) {
        $scope.loadingGroups = true;

        setTimeout(function() {
            var userId = user.id;

            if (userId){
	          	var request = 'get_organization_user_groups';  
                var api     = '/v1/a/organization/user/groups?request='+request+'&interval='+getInterval();

        	    console.log('groupsController - apiService.get - api to call is: '+api);

        		apiService.get(api).then(function(result){
	              	$scope.loadingGroups = false;

	              	if (result){
	                	if (result.msg == 'success'){
                            console.log('groupsController - apiService.get - successfully retrieved groups: '+JSON.stringify(result));

	                  		var largeLoad = [];
	                  		var groups = result.data;

	                  		groups.forEach(function(group){
                                var obj = {
                                    "id":                  group.id,
                                    "name":                group.name,
                                    "description":         group.description,
                                    "identifier":          group.extName,
                                    "avg":                 group.avg,
                                    "adherence_interval":  group.adherence_interval,
                                    "patients":            group.patients,
                                    "members": 		       group.members,
                                    "label":               group.name,
                                    "isAdmin":             group.isAdmin,
                                    "url":                 '/group/data',
                                    "type":                'group'
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

    $scope.gridOptions = {
        data:                      'myData',
        columnDefs: [
          	{ field:'name',               displayName: 'Name',    cellTemplate: nameTemplate },
          	{ field:'avg',      	      displayName: 'Avg.' },
          	{ field:'adherence_interval', displayName: 'Last 3 days' },
          	{ field:'patients', 	      displayName: 'Patients' },
          	{ field:'members',		      displayName: 'Members' },
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

        $location.path('/groups/mygroups');
    };

    $scope.types = [
        //{ name: 'Clinical trials', desc: 'Patients activities in this group will be used in clinical trials.'},
        { name: 'Monitor',  desc: 'This group will be used for monitoring adherence behavior of patients.'},
        { name: 'Research', desc: 'This group will be used for research.'},
        { name: 'Study',    desc: 'This group will be used for conducting studies.'},
    ];

    $scope.selected_type = $scope.types[0].name;
    $scope.selected_desc = $scope.types[0].desc;

    $scope.selectType = function(type){
        $scope.selected_type = type.name;
        $scope.selected_desc = type.desc;
    };

    $scope.group = {
        name: '',
        description: '',
        type: ''
    };

    $scope.submitCreate = function(){
        console.log('groupsController - submitCreate() - group is: '+JSON.stringify($scope.group));
        console.log('groupsController - groupname: '+ $scope.group.name);
        console.log('groupsController - groupdescription: '+ $scope.group.description);
        console.log('groupsController - grouptype: '+ $scope.selected_type);

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
        else if (!$scope.selected_type){
            console.log('groupsController - createNewGroup() - missing group type, return...');

            return;
        }
        else{
            console.log('groupsController - createNewGroup() - group fields ok, proceed...');

            $scope.group.type     = $scope.selected_type;
            $scope.group.interval = getInterval(); 

            var api = '/v1/a/organization/group';
            console.log('groupsController - apiService.post - api to call is: '+api);

            apiService.post(api,$scope.group).then(function(result){
                $scope.loadingGroups = false;

                if (result){
                    if (result.msg == 'success'){
                        console.log('groupsController - apiService.post - successfully created group. Redirecting to open group');

                        var group = result.data;

                        var obj = {
                            "id":                  group.id,
                            "name":                group.name,
                            "description":         group.description,
                            "identifier":          group.extName,
                            "avg":                 group.avg,
                            "adherence_interval":  group.adherence_interval,
                            "patients":            group.patients,
                            "members":             group.members,
                            "label":               group.name,
                            "isAdmin":             group.isAdmin,
                            "url":                 '/group/data',
                            "type":                'group'
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
                        
                        if (stateService.setActiveGroup(obj)){
                            $location.path('/group/data');
                        }
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

