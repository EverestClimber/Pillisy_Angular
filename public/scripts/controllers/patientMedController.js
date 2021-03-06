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
    $scope.activeDrug    = processActiveDrug();

    if (!$scope.activeGroup){
        $location.path('/');
    }
    else{
    
    } 

    function processActiveDrug(){

        var activeDrug       = stateService.getActivePatientDrug();
        var numDoses         = 0;
        var drugReminders    = activeDrug.drugReminders;
        activeDrug.startTime = moment(activeDrug.startTime).format('YYYY-MM-DD');

        return activeDrug;
    }

    $scope.getDoseIndex = function(index){
        //gets the dose index

        return index + 1;
    }

    $scope.postDrug = function(key, value, flag){

        var groupId   = $scope.activeGroup.id;
        var patientId = $scope.activePatient.id;
        var drugId    = $scope.activeDrug.id;

        var obj = {
            timeZone: $scope.activePatient.timeZone
        };

        switch(key){
            case 'drugReminder':
                var drugReminder = $scope.activeDrug.drugReminders[value];   //value == index

                if (flag === 'newTime'){
                    //to know what to set on the backend
                    let newTime = {
                        hours:    moment(drugReminder.initScheduleTime).get("hours"),
                        minutes:  moment(drugReminder.initScheduleTime).get("minutes"),
                        timeZone: drugReminder.timeZoneStr
                    };
                    drugReminder['newTime'] = newTime;
                    obj[key]                = drugReminder;

                    //this is just to display preperly
                    $scope.activeDrug.drugReminders[value].localTime = moment(drugReminder.initScheduleTime).format("h:mm A") + ' '+ drugReminder.timeZoneStr;
                } 
                else {  //this is for quantity
                    obj[key] = drugReminder;
                }

                break;

            case 'enableSMSReminders':
            case 'enableIVRReminders':
            case 'name':
            case 'remaining':
                obj[key] = value;
                break;

            case 'startTime':  //this is actually startDate...  //value == startTime
                let newStartTime = {
                    year:         moment(value).get('year'),
                    month:        moment(value).get('month'),
                    date:         moment(value).get('date'),  //day
                    hours:        moment(value).get("hours"),
                    minutes:      moment(value).get("minutes"),
                    seconds:      moment(value).get("seconds"),
                    milliseconds: moment(value).get("milliseconds"),
                    timeZone:     drugReminder.timeZoneStr
                };

                obj[key] = newStartTime;
                $scope.activeDrug.startTime = moment(value).format('YYYY-MM-DD');
        }

        var api = '/v1/a/organization/group/'+groupId+'/patient/'+ patientId +'/drug/'+drugId;
        
        $scope.loadingMeds = true;
        apiService.put(api, obj).then(function(result){
            $scope.loadingMeds = false;

            if (result){
                if (result.msg == 'success'){
                    var data = result.data;

                    if (data.type == 'drug'){
                        var updatedDrug = data.drug;
                        
                        stateService.updatePatientDrug(patientId, updatedDrug);
                    }
                    else if (data.type == 'drugReminders'){
                        var drugReminders = data.drugReminders;
                        var drugId        = data.drugId;
                        var startTime     = data.startTime;

                        stateService.updatePatientDrugReminders(patientId, drugId, drugReminders, startTime);
                    }
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