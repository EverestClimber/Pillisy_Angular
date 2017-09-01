/** Pillsy
*  @author  Chuks Onwuneme
*  @version 1.0
*  @package GroupPatientMedController AngularJS module  
*/

var app = angular.module('PatientMedController', []);     //instantiates GroupPatientMedController module
app.config(['$routeProvider', function($routeProvider) {
    'use strict';
    $routeProvider.when('/patients/patient/med/', {
        templateUrl: 'views/patients/patient/med/data.html',
            resolve: {
                loadCalendar: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        'bower_components/fullcalendar/fullcalendar.js'
                    ]);
                }]
            }
        }); 
}]);

app.controller('patientMedController', function ($scope, $filter, $http, $location, $rootScope, apiService, stateService) {
    'use strict';

    //patient cache data
    $scope.activeGroup   = stateService.getActiveGroup();
    $scope.activePatient = stateService.getActivePatient();
    $scope.activeDrug    = stateService.getActivePatientDrug();

    if (!$scope.activeGroup){
        $location.path('/');
    }
    else{
        /*try{

            var groups = stateService.getUserGroups();
            $rootScope.$emit("my_groups_callback", {groups: groups});

            $scope.activePatient       = $scope.activeGroup.active_patient;
            $scope.activeDrug          = $scope.activeGroup.active_patient.active_drug;
            $scope.activeDrug.numDoses = $scope.activeDrug.reminders.length;

            if ($scope.activeDrug.numDoses > 0){
                
                var reminder = $scope.activeDrug.reminders[0];
                $scope.activeDrug.startTime = moment(reminder.startTime).format("MM-DD-YYYY");

                var index = 1;
                $scope.activeDrug.reminders.forEach(function(reminder){
                    switch(index){
                        case 1:
                            $scope.activeDrug.reminder1 = reminder;
                            $scope.activeDrug.reminder1.initScheduleTime = moment(reminder.initScheduleTime).format("h:mm A");
                            break;
                        case 2:
                            $scope.activeDrug.reminder2 = reminder;
                            $scope.activeDrug.reminder2.initScheduleTime = moment(reminder.initScheduleTime).format("h:mm A");
                            break;
                        case 3:
                            $scope.activeDrug.reminder3 = reminder;
                            $scope.activeDrug.reminder3.initScheduleTime = moment(reminder.initScheduleTime).format("h:mm A");
                            break;
                        case 4:
                            $scope.activeDrug.reminder4 = reminder;
                            $scope.activeDrug.reminder4.initScheduleTime = rmoment(eminder.initScheduleTime).format("h:mm A");
                            break;
                    }
                });
            }

            $scope.integerval  = /^\d*$/; 
        }
        catch(e){
            alert('error: '+e);

            $location.path('/');
        }*/
    } 

    $scope.postDrug = function(key, value){
        var groupId   = $scope.activeGroup.id;
        var patientId = $scope.activePatient.id;
        var drugId    = $scope.activeDrug.id;

        var obj = {};

        switch(key){
            case 'reminder1_time':
                var reminder = $scope.activeDrug.reminders[0];
                obj.reminder = {};
                obj.reminder.id = reminder.id;
                obj.reminder.initScheduleTime = value;

                break;
            case 'reminder2_time':
                var reminder = $scope.activeDrug.reminders[1];
                obj.reminder = {};
                obj.reminder.id = reminder.id;
                obj.reminder.initScheduleTime = value;

                break;
            case 'reminder3_time':
                var reminder = $scope.activeDrug.reminders[2];
                obj.reminder = {};
                obj.reminder.id = reminder.id;
                obj.reminder.initScheduleTime = value;

                break;
            case 'reminder4_time':
                var reminder = $scope.activeDrug.reminders[3];
                obj.reminder = {};
                obj.reminder.id = reminder.id;
                obj.reminder.initScheduleTime = value;

                break;

            case 'quantity_pills_dose':
                obj.quantity_pills_dose = value;
                break;

            case 'name':
                obj.name = value;
                break;

            case 'quantity':
                obj.quantity = value;
                break;
        }

        var api = '/v1/a/organization/group/'+groupId+'/patient/'+ patientId +'/drug/'+drugId;
        
        $scope.loadingMeds = true;
        apiService.put(api, obj).then(function(result){
            $scope.loadingMeds = false;

            if (result){
                if (result.msg == 'success'){

                }
                else{
                    alert(result.msg);
                }
            }
            else{

            }
        });
    }
    
})
.filter('fromNow', function() {
    return function(dateString) {
        return moment(dateString).fromNow()
    };
});