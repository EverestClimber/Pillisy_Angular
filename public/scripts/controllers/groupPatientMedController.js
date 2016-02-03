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
    $scope.medName 	   = pillsy.active_patient_med.name;

    //--calendar stuff
    var date = new Date();
    var d = date.getDate();
    var m = date.getMonth();
    var y = date.getFullYear();

    $scope.demoEvents = [];

    getMedHistory();

    function getMedHistory(){
        console.log('getMedHistory...');

        var patientId = null;
        var groupId   = null;
        var drugId    = null;

        var pillsy = stateService.getPillsy();

        if (pillsy){
            var patient = pillsy.active_patient;
            if (patient){
                patientId = patient.id;
            }

            var group = pillsy.active_group;
            if (group){
                groupId = group.id;
            }

            var drug = pillsy.active_patient_med;
            if (drug){
                drugId = drug.id;
            }
        }

        if (patientId && groupId && drugId){
            var api = '/v1/a/organization/group/'+groupId+'/patient/'+patientId+'/drug/'+drugId+'/adherence';
            console.log('api is: '+api);

            apiService.get(api).then(function(result){
                $scope.progress = false;

                if (result){
                    if (result.msg == 'success'){
                        console.log('APIService.get - successfully retrieved meds history');
                    }
                    else{
                        console.log('APIService.get - did not retrieve meds history');
                    }
                }
                else{
                    console.log('APIService.get - error - no result from server');
                }
            });
        }
        else{
            console.log('missing fields...');   
        }
    }

})
.filter('fromNow', function() {
    return function(dateString) {
      	return moment(dateString).fromNow()
    };
});

