/** Pillsy
*  @author  Chuks Onwuneme
*  @version 1.0
*  @package GroupMembersController AngularJS module  
*/

var app = angular.module('GroupMembersController', ['ngGrid']);     //instantiates GroupMembersController module
app.controller('groupMembersController', function ($scope, $filter, $http, $location, $rootScope, apiService, stateService) {
	'use strict';

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

    $scope.refreshMembers = function(){
      	$scope.getPagedDataAsync($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage);
    };
    
    function callPillsyService(pageSize, page, searchText){
        console.log('groupMembersController - callPillsySerice');

        var groupid = $scope.groupId;

        if (groupid){
            var request  = 'fetch_group_members';
            var api      = '/v1/a/organization/group/'+groupid+'/members';
            var data;

            apiService.get(api).then(function(result){
                $scope.progress = false;

                if (result){
                    if (result.msg == 'success'){
                        console.log('groupMembersController - callPillsySerice - apiService.get - successfully retrieved group members: '+result);

                        var members = [];
                        result.data.forEach(function(member){

                            var obj = {
                                "Name":   member.name,
                                "Title":  member.title,
                                "Phone":  member.phone,
                                "Email":  member.email,
                                "Status": member.status,
                                "Role":   member.role
                            }

                            members.push(obj);
                        });

                        if (searchText){
                            var ft = searchText.toLowerCase();

                            members = members.filter(function(item) {
                                return JSON.stringify(item).toLowerCase().indexOf(ft) !== -1;
                            });
                        }

                        $scope.setPagingData(members, page, pageSize);
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
      	data: 			  'myData',
      	enablePaging: 	  true,
      	showFooter: 	  true,
      	totalServerItems: 'totalServerItems',
      	pagingOptions: 	  $scope.pagingOptions,
      	filterOptions: 	  $scope.filterOptions
    };

});

app.filter('fromNow', function() {
    return function(dateString) {
      	return moment(dateString).fromNow()
    };
});
