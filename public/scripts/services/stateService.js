/** Pillsy
 *  @author  Chuks Onwuneme
 *  @version 1.0
 *  @package StateService AngularJS module  
 */

var app = angular.module('StateService', []);     //instantiates StateService module
app.service('stateService', function($window, $rootScope, $location, $cookies, $http, apiService){
	console.log('stateService...');

    //---------CACHING------------
    this.setActiveGroupMembers = function(members){
        var pillsy = this.getPillsy();

        if (pillsy){
            console.log('stateService - setActiveGroup, got pillsy, set groupData');

            var activeGroup = this.getActiveGroup();

            if (activeGroup){
                activeGroup.members = members;
            }

            this.setActiveGroup(activeGroup);
        }
    }

    this.getActiveGroupMembers = function(){
        var pillsy = this.getPillsy();
        var members = [];

        if (pillsy){
            console.log('stateService - setActiveGroup, got pillsy, set groupData');

            var activeGroup = this.getActiveGroup();

            if (activeGroup){
                if (activeGroup.members){
                    members = activeGroup.members
                }
            }
        }

        return members;
    }

    this.setActiveMember = function(member){
        var activeGroup = this.getActiveGroup();

        if (activeGroup){
            if (activeGroup.members){
                var members = activeGroup.members

                members.forEach(function(iMember){
                    if (iMember.id == member.id){
                        iMember.active = true;
                    }
                    else{
                        iMember.active = false;
                    }
                });

                activeGroup.members = members;
                this.setActiveGroup(activeGroup);
            }
        }
    }

    this.getActiveMember = function(){
        var member = null;
        
        var activeGroup = this.getActiveGroup();

        if (activeGroup){
            if (activeGroup.members){
                var members = activeGroup.members

                members.some(function(iMember){
                    if (iMember.active == true){
                        member = iMember;
                        return true;
                    }
                });
            }
        }

        return member;
    }

    this.getActivePatientDrugs = function(){
        console.log('stateService - getPatientDrugs');

        var drugs  = [];
        var pillsy = this.getPillsy();

        if (pillsy){
            console.log('stateService - getPatientDrugs');

            var activePatient = this.getActivePatient();

            if (activePatient){

                var organization = pillsy.organization;
                if (organization){
                    var patients = organization.patients;

                    if (patients){
                        patients.some(function(patient){
                            if (patient.id == activePatient.id){
                                drugs = patient.drugs;

                                return true;
                            }
                        });
                    }
                }
            }
        }

        return drugs;
    }

    this.updatePatientDrugReminders = function(patientId, drugId, drugReminders, startTime){
        console.log('stateService - updatePatientDrugReminders...');

        var pillsy = this.getPillsy();
        var patient = null;

        if (pillsy){
            console.log('stateService - setActiveGroup, got pillsy, set groupData');

            var organization = pillsy.organization;

            if (organization){
                var patients = organization.patients;

                if (patients){
                    var index   = 0;
                    var exists  = false;
        
                    patients.some(function(iPatient){
                        if (iPatient.id == patientId){
                            patient = iPatient;
                            return true;
                        }

                        index++;
                    });

                    if (patient){
                        var drugs = patient.drugs;
                        
                        drugs.some(function(drug){
                            if (drug.id == drugId){
                                
                                if (startTime){
                                    drug.startTime = startTime;
                                }

                                //check for reminders and update...
                                var iDrugReminders = drug.drugReminders;

                                drugReminders.forEach(function(drugReminder){

                                    iDrugReminders = iDrugReminders.map(function(iDrugReminder){
                                        if (drugReminder.id == iDrugReminder.id){
                                            return drugReminder;
                                        }
                                        else{
                                            return iDrugReminder;
                                        }
                                    });

                                });

                                drug.drugReminders = iDrugReminders;

                                return true;
                            }
                        });

                        patient.drugs         = drugs;
                        patients[index]       = patient;
                        organization.patients = patients;

                        pillsy.organization = organization;
                        $window.sessionStorage.pillsy = JSON.stringify(pillsy);
                    }
                }
            }
        }
    }

    this.updatePatientDrug = function(patientId, updatedDrug){
        console.log('stateService - updatePatientDrug...');

        var pillsy = this.getPillsy();
        var patient = null;

        if (pillsy){
            console.log('stateService - setActiveGroup, got pillsy, set groupData');

            var organization = pillsy.organization;

            if (organization){
                var patients = organization.patients;

                if (patients){
                    var index   = 0;
                    var exists  = false;
        
                    patients.some(function(iPatient){
                        if (iPatient.id == patientId){
                            patient = iPatient;
                            return true;
                        }

                        index++;
                    });

                    if (patient){
                        var drugs = patient.drugs;
                        
                        drugs.some(function(drug){
                            if (drug.id == updatedDrug.id){
                                for (var property in updatedDrug){
                                    if ( Object.prototype.hasOwnProperty.call(updatedDrug, property) ) {

                                        drug[property] = updatedDrug[property];
                                    }
                                }

                                return true;
                            }
                        });

                        patient.drugs         = drugs;
                        patients[index]       = patient;
                        organization.patients = patients;

                        pillsy.organization = organization;
                        $window.sessionStorage.pillsy = JSON.stringify(pillsy);
                    }
                }
            }
        }
    }

    this.addNewDrugToPatient = function(drug, patientId){
        console.log('stateService - addNewDrugToPatient...');

        var pillsy = this.getPillsy();
        var patient = null;

        if (pillsy){
            console.log('stateService - setActiveGroup, got pillsy, set groupData');

            var organization = pillsy.organization;

            if (organization){
                var patients = organization.patients;

                if (patients){
                    var index   = 0;
                    var exists  = false;
        
                    patients.some(function(iPatient){
                        if (iPatient.id == patientId){
                            patient = iPatient;
                            return true;
                        }

                        index++;
                    });

                    if (patient){
                        var drugs = patient.drugs;
                        if (drugs){
                            drugs.push(drug);
                        }
                        else{
                            drugs = [drug];
                        }

                        patient.drugs         = drugs;
                        patients[index]       = patient;
                        organization.patients = patients;

                        pillsy.organization = organization;
                        $window.sessionStorage.pillsy = JSON.stringify(pillsy);
                    }
                }
            }
        }

        if (patient){
            return true;
        }
        else{
            return false;
        }
    }

    this.getOrganizationGroups = function(){

        var groups = [];
        var pillsy = this.getPillsy();

        if (pillsy){
            groups = pillsy.organizationGroups;
        }

        return groups;
    }

    this.getMasterOrganizationGroup = function(){

        var group  = null;
        var pillsy = this.getPillsy();

        if (pillsy){
            var groups = pillsy.organizationGroups;

            if (groups.length > 0){

                groups.some(function(iGroup){
                    if (iGroup.type == 'master'){
                        group = iGroup;

                        return true;
                    }
                });
            }
        }

        return group;
    }

    this.setOrganizationGroups = function(groups){

        var pillsy = this.getPillsy();

        if (pillsy){
            console.log('stateService - setOrganizationGroups, got pillsy, set groupData');
        
            var organizationGroups = groups.map(function(group){
                var obj = {
                    id:   group.id,
                    name: group.name,
                    type: group.type
                };

                return obj;
            });

            pillsy.organizationGroups = organizationGroups;
            $window.sessionStorage.pillsy = JSON.stringify(pillsy);
        }
    }

    //single patient
    this.setGroupPatientData = function(groupPatientData){
        console.log('stateService - setGroupData...');

        var pillsy = this.getPillsy();

        if (pillsy){
            console.log('stateService - setActiveGroup, got pillsy, set groupData');

            var group        = groupPatientData.group;
            var patient      = groupPatientData.patient;
            var organization = pillsy.organization;

            if (organization){
                var patients = organization.patients;

                if (patients){

                    var exists = false;
                    var index  = 0;
                    patients.some(function(iPatient){
                        if (iPatient.id == patient.id){
                            exists = true;
                            return true;
                        }

                        index++;
                    });

                    if (!exists){
                        patients.push(patient);
                    }
                    else{
                        patients[index] = patient;
                    }

                    organization.patients = patients;
                }
                else{
                    organization.patients = [patient];
                }
            }
            else{
                //there was no organization object, so this is new...
                organization = {
                    patients: [patient],
                    groups:   [group]
                };
            }

            pillsy.organization = organization;
            $window.sessionStorage.pillsy = JSON.stringify(pillsy);

            return true;
        }
    }

    this.setGroupPatientsData = function(groupPatientsData){
        console.log('stateService - setGroupData...');

        var pillsy = this.getPillsy();

        if (pillsy){
            console.log('stateService - setActiveGroup, got pillsy, set groupData');

            var group        = groupPatientsData.group;
            var patients     = groupPatientsData.patients;
            var organization = pillsy.organization;

            if (group.type = 'master'){

                if (organization){
                    organization['patients'] = patients;

                    var groups = organization.groups;

                    var index = 0;
                    var exists = false;
                    groups.some(function(iGroup){
                        if (iGroup.id == group.id){

                            exists = true;
                            return true;
                        }

                        index++;
                    });

                    if (exists){
                        groups[index] = group;
                    }
                    else{
                        groups.push(group);
                    }

                    organization['groups'] = groups;
                }
                else{
                    //there was no organization object, so this is new...
                    organization = {
                        patients: patients,
                        groups:   [group]
                    };
                }
            }
            else{
                if (organization){

                    //groups
                    var groups = organization.groups;

                    var index = 0;
                    var exists = false;
                    groups.some(function(iGroup){
                        if (iGroup.id == group.id){

                            exists = true;
                            return true;
                        }

                        index++;
                    });

                    if (exists){
                        groups[index] = group;
                    }
                    else{
                        groups.push(group);
                    }

                    organization['groups'] = groups;

                    //patients
                    var iPatients = organization.iPatients;

                    patients.forEach(function(patient){

                        var y = 0;
                        var yExists = false;
                        iPatients.some(function(iPatient){
                            if (iPatient.id == patient.id){
                                yExists = true;
                                return true;
                            }

                            y++;
                        });

                        if (yExists){
                            iPatient[y] = patient;
                        }
                        else{
                            iPatient.push(patient);
                        }

                    });
                }
                else{
                    //there was no organization object, so this is new...
                    organization = {
                        patients: patients,
                        groups:   [group]
                    };
                }
            }

            pillsy.organization = organization;
            $window.sessionStorage.pillsy = JSON.stringify(pillsy);

            return true;
        }
        else{
            return false;
        }
    };

    this.getGroupPatients = function(groupId){
        var pillsy = this.getPillsy();

        if (pillsy){

            var organization = pillsy.organization;

            if (organization){
                var groups   = organization.groups;
                var patients = organization.patients;

                if (groups){
                    if (groups.length > 0){

                        var theGroup = null;
                        groups.some(function(group){
                            if ((groupId == 1) && (group.type == 'master')){
                                theGroup = group;

                                return true;
                            }
                            else if (group.id == groupId){
                                theGroup = group;

                                return true;
                            }
                        });

                        if (theGroup){
                            
                            var iPatients = [];

                            if (patients){
                                if (patients.length > 0){
                                    theGroup.patients.forEach(function(xPatient){

                                        patients.some(function(zPatient){
                                            if (zPatient.id == xPatient){
                                                iPatients.push(zPatient);

                                                return true;
                                            }
                                        });
                                    });

                                    return iPatients;
                                }
                                else{
                                    return [];
                                }
                            }   
                            else{
                                return [];
                            }
                        }
                        else{
                            return [];
                        }
                    }
                    else{
                        return [];
                    }
                }
                else{
                    return []
                }
            }
            else{
                return [];
            }
        }
        else{
            return [];
        }
    }

    this.setOrganizationMasterGroupId = function(groupId){
        var pillsy = this.getPillsy();
        if (pillsy){
            pillsy.organizationMasterGroupId = groupId;
            $window.sessionStorage.pillsy    = JSON.stringify(pillsy);

            return true;
        }
        else{
            return false;
        }
    }

    this.getOrganizationMasterGroupId = function(){
        var pillsy        = this.getPillsy();
        var masterGroupId = null;

        if (pillsy){
            masterGroupId = pillsy.organizationMasterGroupId;
        }
        
        return masterGroupId;
    };

    //for caching organizations for admin routes
    this.getOrganizations = function(groupId){
        var pillsy        = this.getPillsy();
        var organizations = null;

        if (pillsy){
            organizations = pillsy.organizations;
        }
        
        return organizations;
    };

    this.setOrganizations = function(organizations){
        var pillsy = this.getPillsy();
        if (pillsy){
            pillsy.organizations = organizations;
            $window.sessionStorage.pillsy = JSON.stringify(pillsy);

            return true;
        }
        else{
            return false;
        }
    };

    this.getOrganizationPatients = function(){
        var pillsy               = this.getPillsy();
        var organizationPatients = null;

        if (pillsy){
            organizationPatients = pillsy.organizationPatients;
        }
        
        return organizationPatients;
    };

    this.setOrganizationPatients = function(organizationPatients){
        var pillsy = this.getPillsy();
        if (pillsy){
            pillsy.organizationPatients   = organizationPatients
            $window.sessionStorage.pillsy = JSON.stringify(pillsy);

            return true;
        }
        else{
            return false;
        }
    };

    this.getActiveOrganization = function(){
        console.log('stateService - getActiveOrganization...');

        var pillsy = this.getPillsy();

        if (pillsy){
            return pillsy.active_organization;
        }
        else{
            return null;
        }
    };

    this.setActiveOrganization = function(organization){
        console.log('stateService - setActiveOrganization...');

        var pillsy = this.getPillsy();
        if (pillsy){
            console.log('stateService - setActiveOrganization, got pillsy, set active organization to: '+organization.id);

            pillsy.active_organization = organization;
            $window.sessionStorage.pillsy = JSON.stringify(pillsy);

            return true;
        }
        else{
            return false;
        }
    };
    
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

    this.setPatientGroups = function(patientId, groups){
        var pillsy = this.getPillsy();

        if (pillsy){
            var organization = pillsy.organization;

            if (organization){
                var patients = organization.patients;

                if (patients){

                    var exists = false;
                    var index  = 0;
                    patients.some(function(iPatient){
                        if (iPatient.id == patientId){
                            exists = true;
                            return true;
                        }

                        index++;
                    });

                    if (exists){
                        var patient           = patients[index];
                        patient.groups        = groups; 
                        patients[index]       = patient;
                        organization.patients = patients;
                    }
                }
                else{
                    
                }
            }
        }
    }

    //for caching patients
    this.setPatientDetails = function(patientId, patientDetails){
        var pillsy = this.getPillsy();
        if (pillsy){
            if (pillsy.patient_details){
                
                var pDetails = pillsy.patient_details;
                var exists = false;
                var index  = 0;

                pDetails.some(function(patient){
                    if (patient.id == patientId){
                        patient.details = patientDetails;
                        exists = true;
                        return true;
                    }

                    index++;
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
            console.log('stateService - setActiveGroup, got pillsy, set active group');

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

    this.getCachedGroup = function(groupId){
        console.log('stateService - getActiveGroup...');

        var pillsy   = this.getPillsy();
        var theGroup = null;

        if (pillsy){
            var organization = pillsy.organization;
            if (organization){
                var groups = organization.groups;

                if (groups){

                    groups.some(function(group){
                        if ((groupId == 1) && (group.type == 'master')){
                            theGroup = group;
                            return true;
                        }
                        else if (group.id == groupId){

                            theGroup = group;
                            return true;
                        }
                    });
                }
            }
        }

        return theGroup;
    };

    this.removePatientFromGroup = function(patient, group){
        var pillsy = this.getPillsy();
        if (pillsy){
           
            if (group.type == 'master'){
                //remove from all the groups
                var organization = pillsy.organization;
                if (organization){
                    var patients = organization.patients;

                    if (patients){

                        var index = 0;
                        var exists = false;
                        patients.some(function(iPatient){
                            if (iPatient.id == patient.id){
                                exists = true;
                                return true;
                            }

                            index++;
                        });

                        if (exists){
                            patients.splice(index, 1);
                        }

                        organization.patients = patients;
                    }
                }
            }
            else{
                //delete from group only
            }

            pillsy.organization = organization;
            $window.sessionStorage.pillsy = JSON.stringify(pillsy);

            return true;
        }
        else{
            return false;
        }
    }

    //when a patient is clicked, this sets that patient as the actively opened patient within a group
    this.setActivePatient = function(patient){
        var pillsy = this.getPillsy();

        if (pillsy){
           
            pillsy.active_patient = patient;
            $window.sessionStorage.pillsy = JSON.stringify(pillsy);

            return true;
        }
        else{
            return false;
        }
    }

    this.getActivePatient = function(){
        var activePatient = null;
        var pillsy        = this.getPillsy();

        if (pillsy){
            activePatient = pillsy.active_patient;
        }

        return activePatient;
    };

	this.setActivePatientDrug = function(drug){
        var pillsy = this.getPillsy();

        if (pillsy){
           
            pillsy.active_drug = drug;
            $window.sessionStorage.pillsy = JSON.stringify(pillsy);

            return true;
        }
        else{
            return false;
        }
    };

    this.getActivePatientDrug = function(){
        var activePatientDrug = null;
        var pillsy = this.getPillsy();

        if (pillsy){
            activePatientDrug = pillsy.active_drug;
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
            user:               data.user,
            organizationGroups: data.organizationGroups,
            token:              data.token,
            tokenExpiry:        data.tokenExpiry
        };

        $window.sessionStorage.pillsy = JSON.stringify(pillsy);

        this.setActiveGroup(data.masterGroup);  //master group

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

    this.getFormattedPhone = function(phone){

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

    this.formatUSPhone = function(phone){

        if (phone){
            phone = phone.replace(/\(/g, '');  //remove ( prefix
            phone = phone.replace(/\)/g, '');  //remove ) prefix  
            phone = phone.replace(/\./g, '');  //remove .
            phone = phone.replace(/\,/g, '');  //remove , 
            phone = phone.replace(/\-/g, '');  //remove -
            phone = phone.replace(/\s/g, '');  //remove all spaces

            if (phone.charAt(0) != '+'){
                phone = '+'+phone;
            }

            if (phone.charAt(1) != '1'){

                phone = phone.substring(0, 1) + '1' + phone.substring(1, phone.length);
            }
        }
        
        return phone;
    }
});