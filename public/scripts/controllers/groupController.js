/** Pillsy
*  @author  Chuks Onwuneme
*  @version 1.0
*  @package GroupController AngularJS module  
*/

var app = angular.module('GroupController', []);     //instantiates GroupController module
//app.controller('groupController', function ($scope, apiService, stateService, $rootScope) {
app.controller('groupController', function ($scope, $filter, $http, $location, $rootScope, apiService, groupDetails, stateService) {
    'use strict';

    console.log('groupController');
    var pillsy = stateService.getPillsy();

    if (!pillsy.active_group) {
        $location.path('/');
    }
    else{
        $scope.group_visible        = true;
        $scope.call_visible         = false;
        $scope.sms_visible          = false;
        $scope.group                = pillsy.active_group;
        $scope.patients_visible     = true;
        $scope.isAdmin              = $scope.group.isAdmin;
        $scope.sendButtonText       = 'Send';
        $scope.sendGroupId          = null;
        $scope.sendPatient          = null;
        $scope.message_patient_form = false;

        var groups = stateService.getUserGroups();
        $rootScope.$emit("my_groups_callback", {groups: groups});
    }
    
    function getInterval(){
        var now = new Date();

        var interval = {
            startTime:      moment(now.getTime()).subtract(3,'days').valueOf(),  //last three days,
            endTime:        moment(now.getTime()).valueOf(),
            today:          now.getTime(),
            //startOfDay:     moment(now.getTime()).startOf('day').valueOf(),
            //endOfDay:       moment(now.getTime()).endOf('day').valueOf(),
            timeZoneOffset: now.getTimezoneOffset()
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

    $scope.sendMessage = function(message){
        var request = 'send_sms_to_patient';
        var api     = '/v1/a/organization/group/'+ $scope.sendGroupId +'/patient/'+ $scope.sendPatient.id +'/sms';
        var payload = {
            message: message,
            request: request
        };

        $scope.sendButtonText = 'Sending';
        apiService.post(api, payload).then(function(result){
            $scope.message_patient_form = false;
            $scope.sendButtonText       = 'Send';

            if (result){
                var msg = result.msg;

                if (msg == 'success'){

                    var data = result.data;
                    var output;

                    if (data.found){
                        if (data.hasPhone){
                            if (data.smsSent){
                                output = 'Your SMS message was successfully sent to '+ $scope.sendPatient.name;
                            }
                            else{
                                output = 'Your SMS could not be sent. Please try again later';
                            }
                        }
                        else{
                            output = 'The patient, '+ $scope.sendPatient.name +', does not have a phone number associated with their account. Your SMS message was not sent.'
                        }
                    }
                    else{
                        output = 'This patient was not found.';
                    }

                    $scope.serverMsg = output
                }
                else{
                    console.log('apiService.post - error');

                    $scope.serverMsg = 'There was an error while sending the SMS message to '+ $scope.sendPatient.name +'. Please try again later.';
                }
            }
            else{
                console.log('apiService.post - error');
            }
        });
    }

    function callPatient(patientPhone){
        console.log('GroupController - callPatient');

        var request = 'call_patient';
        var api     = '/v1/a/organization/group/'+ $scope.sendGroupId +'/patient/'+ $scope.callPatient.id +'/call';
        var payload = {
            message: message,
            request: request
        };

        console.log('GroupController - callPatient - api: '+api);

        $scope.callPatientMsg = 'Please wait while a call is being placed to '+$scope.patient_to_call;

        apiService.post(api, payload).then(function(result){

            if (result){
                var msg = result.msg;

                if (msg == 'success'){

                    var data = result.data;
                }
                else{
                    console.log('apiService.post - error');

                    $scope.callPatientMsg = 'Pillsy encountered an error while trying to call '+ $scope.callPatient.name +'. Please try again later.';
                }
            }
            else{
                console.log('apiService.post - error');
            }
        });
    }

    $rootScope.$on("send_message_to_patient", function (event, data) {

        var patient = data.patient;
        
        if (patient){
            $scope.sendPatient         = patient;
            $scope.patient_to_send_sms = patient.name;
        }

        $scope.sendGroupId          = data.groupId;
        $scope.group_visible        = false;
        $scope.call_visible         = false;
        $scope.sms_visible          = true;
        $scope.sendButtonText       = 'Send';
        $scope.message_patient_form = true;
    });


    $rootScope.$on("call_patient", function (event, data) {

        var patient = data.patient;
        
        if (patient){
            $scope.callPatient     = patient;
            $scope.patient_to_call = patient.name;
        }

        $scope.sendGroupId   = data.groupId;
        $scope.group_visible = false;
        $scope.call_visible  = true;
        $scope.sms_visible   = false;

        callPatient(patient.phone);
    });

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

});

app.filter('fromNow', function() {
    return function(dateString) {
        return moment(dateString).fromNow()
    };
});

