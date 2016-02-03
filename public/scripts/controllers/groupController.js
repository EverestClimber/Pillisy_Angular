/** Pillsy
*  @author  Chuks Onwuneme
*  @version 1.0
*  @package GroupController AngularJS module  
*/

var app = angular.module('GroupController', ['ngGrid'/*, 'StateService', 'GroupDetails'*/]);     //instantiates GroupPatientsController module
app.controller('groupController', function ($scope, $filter, $http, $location, $rootScope, apiService, groupDetails, stateService) {
    'use strict';

    console.log('groupController');
    var pillsy = stateService.getPillsy();

    if (!pillsy.active_group) {
        $location.path('/');
    }
    else{
        $scope.groupId      = pillsy.active_group.id;
        $scope.groupName    = pillsy.active_group.name;
        $scope.groupExtName = pillsy.active_group.identifier;
    }
    
});

app.filter('fromNow', function() {
    return function(dateString) {
        return moment(dateString).fromNow()
    };
});