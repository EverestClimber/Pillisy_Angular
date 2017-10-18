/** Pillsy
*  @author  Chuks Onwuneme
*  @version 1.0
*  @package GroupMembersController AngularJS module  
*/

var app = angular.module('GroupMembersController', ['ngGrid','xeditable']);     //instantiates GroupMembersController module
app.controller('groupMembersController', function ($window, $scope, $filter, $http, $location, $rootScope, apiService, stateService, lodash) {
    'use strict';

    var pillsy = stateService.getPillsy();

    if (!pillsy.active_group) {
        $location.path('/');
    }
    else{
        
        initVars();
    }

    function initVars(){

        $scope.groupId = pillsy.active_group.id;
        $scope.totalServerItems = 0;

        $scope.filterOptions = {
            filterText: '',
            useExternalFilter: true
        };

        $scope.totalServerItems = 0;
        $scope.pagingOptions = {
            pageSizes:   ['25', '50', '100'],
            pageSize:    '25',
            currentPage: 1
        };

        var pagedData = stateService.getActiveGroupMembers();
        $scope.myData = lodash.sortBy(pagedData, 'name');
    }

    $scope.setPagingData = function(data, page, pageSize) {
        var pagedData = data.slice((page - 1) * pageSize, page * pageSize);

        $scope.myData = lodash.sortBy(pagedData, 'name');
        $scope.totalServerItems = data.length;
        if (!$scope.$$phase) {
            $scope.$apply();
        }
    };

    $scope.refreshMembers = function(){
        $scope.getPagedDataAsync($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage);
    };
    
    function getFormattedPhone(phone){

        if ( phone.charAt(0) === '+'){
            phone = phone.slice(1);
        }

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
                                'id':               member.id,
                                'firstname':        member.firstname,
                                'lastname':         member.lastname,
                                'name':             member.lastname +', '+member.firstname,
                                'title':            member.title,
                                'phone':            member.phone,
                                'formatted_phone':  getFormattedPhone(member.phone),
                                'email':            member.email,
                                'status':           member.status,
                                'role':             member.role,
                                'groups':           member.groups
                            };

                            members.push(obj);
                        });

                        if (searchText){
                            var ft = searchText.toLowerCase();

                            members = members.filter(function(item) {
                                return JSON.stringify(item).toLowerCase().indexOf(ft) !== -1;
                            });
                        }

                        stateService.setActiveGroupMembers(members);
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

    $scope.deleteMember = function($event, memberToDelete) {
        $event.stopPropagation();
        var answer = confirm('Are you sure you want to delete '+memberToDelete.name+'\'s account?');

        if (answer){
            var api = '/v1/a/organization/user/'+memberToDelete.id;

            apiService.delete(api, {}).then(function(result){
                console.log('groupMembersController - apiService.put - result is: '+JSON.stringify(result));

                if (result.msg == 'success'){
                    console.log('groupMembersController - apiService.put - success');

                    var members = stateService.getActiveGroupMembers();
                    members = members.filter(function(member){
                        return member.id != memberToDelete.id;
                    });

                    stateService.setActiveGroupMembers(members);
                    $scope.setPagingData(members, $scope.pagingOptions.currentPage, $scope.pagingOptions.pageSize);
                }
                else{
                    console.log('groupMembersController - apiService.put - error: '+result.msg);
                }
            });
        }
    }

    var removeTemplate   = '<div ng-show="row.entity.role == \'member\'"><input type="button" style="color: #2685ee" value="Delete" ng-click="deleteMember($event, row.entity)" />';
    var nameCellTemplate = '<div><input type="button" style="color: #2685ee" value="{{ row.entity.name }}" ng-click="openTeamMemberDetails(row)"/></div>';

    var statusCellTemplate = '<div style="display: flex; align-items: center;">'+
        '&nbsp;&nbsp;<a href="#" onaftersave="handleEditMemberStatus(myData[ row.rowIndex ])" '+
        'editable-select="myData[ row.rowIndex ].status" e-ng-options="s.value as s.text for s in statuses">{{ myData[ row.rowIndex ].status }} </a>'+
        '</div>';

    var roleCellTemplate = '<div style="display: flex; align-items: center;">'+
        '&nbsp;&nbsp;<a href="#" onaftersave="handleEditMemberRole(myData[ row.rowIndex ])" editable-select="myData[ row.rowIndex ].role" '+
        'e-ng-options="s.value as s.text for s in roles">{{ myData[ row.rowIndex ].role }} </a>'+
        '</div>';    

    function callUpdate(dataObj, memberId){
        console.log('orgUserProfileController - callUpdate');

        var api = '/v1/a/organization/user/'+memberId;

        apiService.put(api, dataObj).then(function(result){
            console.log('orgUserProfileController - apiService.put - result is: '+JSON.stringify(result));

            if (result.msg == 'success'){
                console.log('orgUserProfileController - apiService.put - success');

                var member = result.data;
            }
            else{
                console.log('orgUserProfileController - apiService.put - error: '+result.msg);
            }
        });
    }

    $scope.openTeamMemberDetails = function(row) {
        console.log("openTeamMemberDetails");

        $scope.activeMember = row.entity;
        stateService.setActiveMember($scope.activeMember);
        $location.path('/team/member/data');
    };

    function getColumnDefs(){
        var columnDefs = [];
        var user = stateService.getUser();

        if ((user.role == 'org_admin') || (user.role == 'super_user')){
            columnDefs = [
                { field: 'name',            displayName: 'Name',   cellTemplate: nameCellTemplate },
                { field: 'title',           displayName: 'Title' },
                { field: 'formatted_phone', displayName: 'Phone' },
                { field: 'email',           displayName: 'Email' },
                { field: 'status',          displayName: 'Status' },
                { field: 'role',            displayName: 'Role' },
                { field: 'delete',          displayName: '',        cellTemplate: removeTemplate },
            ];
        }
        else{
            columnDefs = [
                { field: 'name',            displayName: 'Name'  },
                { field: 'title',           displayName: 'Title' },
                { field: 'formatted_phone', displayName: 'Phone' },
                { field: 'email',           displayName: 'Email'},
                { field: 'status',          displayName: 'Status' },
                { field: 'role',            displayName: 'Role' }
            ];
        }

        return columnDefs;
    }

    $scope.status = 'status';
    $scope.role   = 'role';

    $scope.statuses = [
        {value: 'pending',     text: 'pending'},
        {value: 'active',      text: 'active'},
        {value: 'suspended',   text: 'suspended'},
        {value: 'deactivated', text: 'deactivated'}
    ];

    $scope.roles = [
        {value: 'member', text: 'member'},
        {value: 'admin',  text: 'admin'}
    ];

    $scope.membersGridOptions = {
        data:                       'myData',
        columnDefs:                 getColumnDefs(),
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
        enableCellSelection:        false,
        cellEditableCondition:      'row.getProperty(\'id\') == stateService.getUser().id'
    };
});

