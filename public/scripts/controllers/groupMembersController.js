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
    
    function getFormattedPhone(phone){

        if ( phone.charAt(0) === '1'){
            phone = phone.slice(1);
        }

        String.prototype.insert = function (index, string) {
        if (index > 0)
            return this.substring(0, index) + string + this.substring(index, this.length);
        else
            return string + this;
        };

        phone = phone.insert(0, '(');
        phone = phone.insert(4, ') ');
        phone = phone.insert(9, '-');

        return phone;
    }

    function callPillsyService(pageSize, page, searchText){
        console.log('groupMembersController - callPillsySerice');

        var groupid = $scope.groupId;

        if (groupid){
            var request  = 'fetch_group_members';
            var api      = '/v1/a/organization/group/'+groupid+'/members';
            var data;

            $scope.loadingMembers = true;
            apiService.get(api).then(function(result){
                $scope.loadingMembers = false;

                if (result){
                    if (result.msg == 'success'){
                        console.log('groupMembersController - callPillsySerice - apiService.get - successfully retrieved group members: '+result);

                        var members = [];
                        result.data.forEach(function(member){

                            var obj = {
                                "name":             member.name,
                                "title":            member.title,
                                "phone":            member.phone,
                                "formatted_phone":  getFormattedPhone(member.phone),
                                "email":            member.email,
                                "status":           member.status,
                                "role":             member.role
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
        callPillsyService(pageSize, page, searchText);
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

    $scope.membersGridOptions = {
        data:                       'myData',
        columnDefs: [
            { field: 'name',            displayName: 'Name' },
            { field: 'title',           displayName: 'Title' },
            { field: 'formatted_phone', displayName: 'Phone' },
            { field: 'email',           displayName: 'Email'},
            { field: 'status',          displayName: 'Status'},
            { field: 'role',            displayName: 'Role'}
        ],
        multiSelect:                false,
        enablePaging:               true,
        showFooter:                 true,
        enableRowSelection:         true, 
        enableSelectAll:            false,
        enableRowHeaderSelection:   false,
        noUnselect:                 true,
        enableGridMenu:             true,
        enableColumnResize:         true,
        totalServerItems:           'totalServerItems',
        pagingOptions:              $scope.pagingOptions,
        filterOptions:              $scope.filterOptions,
    };

});

app.filter('fromNow', function() {
    return function(dateString) {
        return moment(dateString).fromNow()
    };
});