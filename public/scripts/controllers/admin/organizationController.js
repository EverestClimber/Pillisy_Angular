/** Pillsy
*  @author  Chuks Onwuneme
*  @version 1.0
*  @package GroupController AngularJS module  
*/

var app = angular.module('OrganizationController', []);     //instantiates GroupController module
app.controller('organizationController', function ($scope, $filter, $http, $location, $rootScope, apiService, groupDetails, stateService) {
    'use strict';

});

app.filter('fromNow', function() {
    return function(dateString) {
        return moment(dateString).fromNow()
    };
});

