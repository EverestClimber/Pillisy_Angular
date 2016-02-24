/** Pillsy
 *  @author  Chuks Onwuneme
 *  @version 1.0
 *  @package StateService AngularJS module  
 */

var app = angular.module('StateService', []);     //instantiates StateService module
app.service('stateService', function($window, $rootScope, $location, $cookies, $http, apiService){
	console.log('stateService...');

    //---------CACHING------------
    //for caching groups
    this.setGroupDetails = function(groupId, groupDetails){
        var pillsy = this.getPillsy();
        if (pillsy){
            if (pillsy.group_details){
                
                var gDetails = pillsy.group_details;
                var exists = false;

                gDetails.some(function(group){
                    if (group.id == groupId){
                        group.details = groupDetails;
                        exists = true;
                        return true;
                    }
                });

                if (exists){
                    pillsy.group_details = gDetails;
                }
                else{
                    var obj = {
                        id:      groupId,
                        details: groupDetails
                    };

                    pillsy.group_details.push(obj);
                }
            }
            else{
                var obj = {
                    id:      groupId,
                    details: groupDetails
                };

                pillsy.group_details = [];
                pillsy.group_details.push(obj);
            }

            $window.sessionStorage.pillsy = JSON.stringify(pillsy);

            return true;
        }
        else{
            return false;
        }
    };

    this.getGroupDetails = function(groupId){
        var pillsy       = this.getPillsy();
        var groupDetails = null;

        if (pillsy){

            var gDetails = pillsy.group_details;
            if (gDetails){

                gDetails.some(function(group){
                    if (group.id == groupId){
                        groupDetails = group.details;
                        return true;
                    }
                });
            }
        }
        
        return groupDetails;
    }

    //for caching patients
    this.setPatientDetails = function(patientId, patientDetails){
        var pillsy = this.getPillsy();
        if (pillsy){
            if (pillsy.patient_details){
                
                var pDetails = pillsy.patient_details;
                var exists = false;

                pDetails.some(function(patient){
                    if (patient.id == patientId){
                        patient.details = patientDetails;
                        exists = true;
                        return true;
                    }
                });

                if (exists){
                    pillsy.patient_details = pDetails;
                }
                else{
                    var obj = {
                        id:                patientId,
                        details:           patientDetails,
                        drugsCacheDetails: null
                    };

                    pillsy.patient_details.push(obj);
                }
            }
            else{
                var obj = {
                    id:                patientId,
                    details:           patientDetails,
                    drugsCacheDetails: null
                };

                pillsy.patient_details = [];
                pillsy.patient_details.push(obj);
            }

            $window.sessionStorage.pillsy = JSON.stringify(pillsy);

            return true;
        }
        else{
            return false;
        }
    };

    this.getPatientDetails = function(patientId){
        var pillsy         = this.getPillsy();
        var patientDetails = null;

        if (pillsy){

            var pDetails = pillsy.patient_details;
            if (pDetails){

                pDetails.some(function(patient){
                    if (patient.id == patientId){
                        patientDetails = patient.details;
                        return true;
                    }
                });
            }
        }
        
        return patientDetails;
    }

    //for caching patients default interval schedule or logs
    this.setPatientDrugDefaultIntervalCache = function(patientId, drugId, defaultIntervalDetails, type){
        var pillsy = this.getPillsy();
        if (pillsy){
            if (pillsy.patient_details){
                
                var pDetails = pillsy.patient_details;
                var modified = false;

                pDetails.some(function(patient){
                    if (patientId == patient.id){

                        if (patient.drugsCacheDetails){
                            patient.drugsCacheDetails.some(function(drugCacheDetails){
                                if (drugCacheDetails.drugId == drugId){
                                    if (type == 'schedule'){
                                        drugCacheDetails.scheduleDetails = defaultIntervalDetails;
                                    }
                                    else if (type == 'logs'){
                                        drugCacheDetails.logDetails = defaultIntervalDetails;
                                    }

                                    modified = true;
                                    return true;
                                }
                            });
                        }
                        else{
                            patient.drugsCacheDetails = [];
                            var drugCacheDetailsObj   = {
                                drugId: drugId
                            };

                            if (type == 'schedule'){
                                drugCacheDetailsObj.scheduleDetails = defaultIntervalDetails;
                                drugCacheDetailsObj.logDetails      = null;
                            }
                            else if (type == 'logs'){
                                drugCacheDetailsObj.scheduleDetails = null;
                                drugCacheDetailsObj.logDetails      = defaultIntervalDetails;
                            }
                            
                            patient.drugsCacheDetails.push(drugCacheDetailsObj);
                            modified = true;
                        }

                        return true;
                    }
                });

                if (modified){
                    pillsy.patient_details = pDetails;
                    $window.sessionStorage.pillsy = JSON.stringify(pillsy);
                }
            }

            return true;
        }
        else{
            return false;
        }
    };

    this.getPatientDrugDefaultIntervalCache = function(patientId, drugId, type){
        var pillsy               = this.getPillsy();
        var intervalCacheDetails = null;  //type, either 'schedule', or 'logs'

        if (pillsy){
            var pDetails = pillsy.patient_details;
            if (pDetails){

                pDetails.some(function(patient){
                    if (patientId == patient.id){
                        if (patient.drugsCacheDetails){
                            patient.drugsCacheDetails.some(function(drugCacheDetails){
                                if (drugCacheDetails.drugId == drugId){
                                    if (type == 'schedule'){
                                        intervalCacheDetails = drugCacheDetails.scheduleDetails;
                                    }
                                    else if (type == 'logs'){
                                        intervalCacheDetails = drugCacheDetails.logDetails;
                                    }
                                    return true;
                                }
                            });
                        }
                        return true;
                    }
                });
            }
        }
        
        return intervalCacheDetails;
    }

    //---------------END CACHING------------------


    //------------ACTIVE STATE--------------------
    //when a group is opened, this sets that group as the actively opened group
     this.setActiveGroup = function(group){
        console.log('stateService - setActiveGroup...');

        var pillsy = this.getPillsy();

        if (pillsy){
            console.log('stateService - setActiveGroup, got pillsy, set active group to: '+group.id);

            pillsy.active_group = group;

            $window.sessionStorage.pillsy = JSON.stringify(pillsy);

            return true;
        }
        else{
            return false;
        }
    };

    this.getActiveGroup = function(){
        console.log('stateService - getActiveGroup...');

        var pillsy = this.getPillsy();

        if (pillsy){
            return pillsy.active_group;
        }
        else{
            return null;
        }
    };

    //when a patient is clicked, this sets that patient as the actively opened patient within a group
    this.setActivePatient = function(patient){
        var pillsy = this.getPillsy();

        if (pillsy){
            var activeGroup = this.getActiveGroup();

            if (activeGroup){
                try{
                    activeGroup.active_patient    = patient;
                    pillsy.active_group           = activeGroup;
                    $window.sessionStorage.pillsy = JSON.stringify(pillsy);

                    return true;
                }
                catch(e){
                    console.log('stateService - setActivePatient - error setting active patient: '+e);

                    return false;
                }
            }
            else{
                return false;
            }
        }
        else{
            return false;
        }
    }

    this.getActivePatient = function(){
        var activePatient = null;
        var pillsy        = this.getPillsy();

        if (pillsy){
            var activeGroup = this.getActiveGroup();

            if (activeGroup){
                activePatient = activeGroup.active_patient;
            }
        }

        return activePatient;
    };

	this.setActivePatientDrug = function(drug){
        var pillsy = this.getPillsy();

        try{
            if (pillsy){
                var activeGroup = this.getActiveGroup();

                if (activeGroup){
                    var activePatient = activeGroup.active_patient;

                    if (activePatient){
                        activePatient.active_drug     = drug;
                        activeGroup.active_patient    = activePatient;
                        pillsy.active_group           = activeGroup;
                        $window.sessionStorage.pillsy = JSON.stringify(pillsy);

                        return true;
                    }
                    else{
                        return false;
                    }
                }
                else{
                    return false;
                }
            }
            else{
                return false;
            }
        }
        catch(e){
            return false;
        }
    };

    this.getActivePatientDrug = function(){
        var activePatientDrug = null;
        var pillsy = this.getPillsy();

        if (pillsy){
            var activeGroup = this.getActiveGroup();

            if (activeGroup){
                var activePatient = activeGroup.active_patient;

                if (activePatient){
                    activePatientDrug = activePatient.active_drug;
                }    
            }
        }

        return activePatientDrug;
    }

    
    this.setUserGroups = function(groups){
        console.log('stateService - setUserGroups...');

        var pillsy = this.getPillsy();

        if (pillsy){
            console.log('stateService - setUserGroups, got pillsy, set groups');

            var user = pillsy.user;

            if (user){
                user.groups = groups;
                pillsy.user = user;
                $window.sessionStorage.pillsy = JSON.stringify(pillsy);

                return true;
            }
            else{
                return false;
            }
        }
        else{
            return false;
        }
    }

    this.getUserGroups = function(){

        var groups = null;
        var pillsy = this.getPillsy();

        if (pillsy){
            var user = pillsy.user;

            if (user){
                groups = user.groups;
            }
        }

        return groups;
    };

    this.getPillsy = function(){
        console.log('stateService - getPillsy');

        try{
           	var pillsy = null;

            if ($window.sessionStorage.pillsy){
                console.log('stateService - getPillsy - I got it...');

                pillsy = JSON.parse($window.sessionStorage.pillsy);
           	}
            else{
                console.log('stateService - getPillsy - no pillsy...');
            }

            return pillsy; 
        }
        catch(error){
            console.log('stateService - getPillsy - Error retrieving user - '+error.message);

            return null;
        }
    };

    this.getUser = function(){
        console.log('stateService - getUser');

        var user   = null;
        var pillsy = this.getPillsy();

        if (pillsy){
            user = pillsy.user;
        }

        return user;
    };

    this.isLoggedIn = function(){
        console.log('stateService - isLoggedIn?..');

        var loggedIn = false;
        var pillsy   = this.getPillsy();

        if (pillsy){
            var user   = pillsy.user;
            var token  = pillsy.token; 

            if (user && token){
                loggedIn = true;
            }
        }

        return loggedIn;
    };

    this.loginSuccessCallback = function(data){
      	console.log('stateService...loginSuccessCallback - setting loggedInUser to: '+JSON.stringify(data));

        var pillsy = {
            user:        data.user,
            token:       data.token,
            tokenExpiry: data.tokenExpiry
        };

        $window.sessionStorage.pillsy = JSON.stringify(pillsy);
      	$rootScope.$emit("login_status_change", { isLoggedIn: true });
      	$location.path( "/" );
    };

    this.logOut = function(){
      	console.log('stateService...logOut');

        try{
            var user = JSON.parse($window.sessionStorage.pillsy).user;

            if (user){
              	console.log('stateService...logOut - current loggedIn user is: '+JSON.stringify(user));

              	var dataObj = {
                	id: user.id
              	};

              	console.log('stateService...logOut - dataObj: '+JSON.stringify(dataObj));

              	var api = '/v1/a/organization/logout';

              	apiService.post(api, dataObj).then(function(result){
                  	console.log('stateService - apiService.post - result is: '+JSON.stringify(result));

                  	if (result.msg == 'success'){
                    	console.log('stateService - apiService.post - successfully logged out');

                        delete $window.sessionStorage.pillsy;
                        $rootScope.$emit("login_status_change", { isLoggedIn: false });
                  	}
                  	else{
                    	console.log('stateService - apiService.post - error');

                    	alert(result.msg);
                  	}
              	});
            }
            else{
                console.log('stateService - did not find user, check...');
            }
        }
        catch(error){
            console.log('stateService - cannot logOut due to error: '+error.message);

            alert(error);
        }
    };
});