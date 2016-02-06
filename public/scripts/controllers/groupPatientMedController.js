/** Pillsy
*  @author  Chuks Onwuneme
*  @version 1.0
*  @package GroupPatientMedController AngularJS module  
*/

var app = angular.module('GroupPatientMedController', []);     //instantiates GroupPatientMedController module
app.config(['$routeProvider', function($routeProvider) {
    'use strict';
    $routeProvider.when('/group/patient/med/', {
        templateUrl: 'views/group/patient/med/data.html',
            resolve: {
                loadCalendar: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        'bower_components/fullcalendar/fullcalendar.js'
                    ]);
                }]
            }
        });
}]);

app.controller('groupPatientMedController', function ($scope, $filter, $http, $location, apiService, stateService) {
    'use strict';

    var pillsy = stateService.getPillsy();

    if ( (!pillsy.active_group) || (!pillsy.active_patient) || (!pillsy.active_patient_med) ){
        $location.path('/');
    }

    $scope.groupName   = pillsy.active_group.name;
    $scope.patientName = pillsy.active_patient.name;
    $scope.medName     = pillsy.active_patient_med.name;
    
})
.filter('fromNow', function() {
    return function(dateString) {
        return moment(dateString).fromNow()
    };
});