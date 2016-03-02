/** Pillsy
*  @author  Chuks Onwuneme
*  @version 1.0
*  @package GroupController AngularJS module  
*/

var app = angular.module('GroupController', []);     //instantiates GroupController module
app.controller('groupController', function ($scope, apiService, stateService, $rootScope) {
    'use strict';

    console.log('groupController');
    var pillsy = stateService.getPillsy();

    if (!pillsy.active_group) {
        $location.path('/');
    }
    else{
        $scope.group            = pillsy.active_group;
        $scope.patients_visible = true;
        $scope.isAdmin          = $scope.group.isAdmin;

        var groups = stateService.getUserGroups();
        $rootScope.$emit("my_groups_callback", {groups: groups});
    }
    
    function getInterval(){
        var now = new Date();

        var interval = {
            startTime: moment(now.getTime()).startOf('day').subtract(3,'days').valueOf(),
            endTime:   moment().endOf('day').valueOf(),
            today:     now.getTime(),
        };

        return encodeURIComponent( JSON.stringify(interval) );
    }

    $scope.onTabSelect = function(tab){
        switch(tab){
            case 'patients':
                $scope.patients_visible = true;
                break;
            case 'members':
                $scope.patients_visible = false;
                break;
        }
    };

    $scope.updateGroup = function(key, value){

        var request = 'update_organization_group'; 

        var obj = {
            request:  request,
            interval: getInterval()
        };

        switch(key){
            case 'name':
                obj.name = value;
                break;
            case 'description':
                obj.description = value;
                break;
        }

         
        var api = '/v1/a/organization/group/'+$scope.group.id;

        apiService.put(api, obj).then(function(result){

            if (result.msg == 'success'){
                console.log('apiService.post - success');

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
                    
                    var updatedGroups = [];
                    userGroups.forEach(function(group){
                        if (group.id == obj.id){
                            group = obj;
                        }

                        updatedGroups.push(group);
                    });

                    stateService.setUserGroups(updatedGroups);
                }
                else{
                    userGroups = [];
                    userGroups.push(obj);
                    stateService.setUserGroups(userGroups);
                }

                userGroups = stateService.getUserGroups();

                $rootScope.$emit("my_groups_callback", {groups: userGroups});

                pillsy = stateService.getPillsy();

                if (pillsy){
                    if (pillsy.active_group){
                        if (pillsy.active_group.id == obj.id){

                            stateService.setActiveGroup(obj);
                            pillsy = stateService.getPillsy();
                            $scope.group = pillsy.active_group;
                        }
                    }
                }
            }
            else{
                console.log('apiService.post - error');

                alert(result.msg);
            }
        });
    }

    var rowTemplate = '<div ng-click="openPatientRecord(row)" ng-style="{ \'cursor\': row.cursor }" ng-repeat="col in renderedColumns" ng-class="col.colIndex()" class="ngCell {{col.cellClass}}"><div class="ngVerticalBar" ng-style="{height: rowHeight}" ng-class="{ ngVerticalBarVisible: !$last }">&nbsp;</div><div ng-cell></div></div>';

    $scope.myData = stateService.getGroupDetails($scope.group.id);

    $scope.gridOptions = {
        data:             'myData',
        columnDefs: [
            { field:'name',     displayName: 'Name' },
            { field:'drugs',    displayName: 'Drugs' },
            { field:'phone',    displayName: 'Phone#' },
            { field: 'delete',  displayName: 'Delete'}
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
        rowTemplate:                rowTemplate
    };

});

app.filter('fromNow', function() {
    return function(dateString) {
        return moment(dateString).fromNow()
    };
});

