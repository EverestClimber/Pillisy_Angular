/** Pillsy
 *  @author  Chuks Onwuneme
 *  @version 1.0
 *  @package StateService AngularJS module  
 */

var app = angular.module('StateService', []);     //instantiates StateService module
app.service('stateService', function($window, $rootScope, $location, $cookies, $http, apiService){
	console.log('stateService...');

	this.setActivePatientMed = function(med){
        var pillsy = this.getPillsy();

        if (pillsy){
            pillsy.active_patient_med = med;

            $window.sessionStorage.pillsy = JSON.stringify(pillsy);

            return true;
        }
        else{
            return false;
        }
    }

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
    }

    this.setUserGroups = function(groups){
        console.log('stateService - setUserGroups...');

        var pillsy = this.getPillsy();

        if (pillsy){
            console.log('stateService - setUserGroups, got pillsy, set groups');

            pillsy.user_groups = groups;

            $window.sessionStorage.pillsy = JSON.stringify(pillsy);

            return true;
        }
        else{
            return false;
        }
    }

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

        var user = null;

        try{
            if ($window.sessionStorage.pillsy){
                console.log('stateService - getUser - got pillsy, parse...');

                user = JSON.parse($window.sessionStorage.pillsy).user;
           	}
            else{
                console.log('stateService - getUser - no pillsy, ignore...');
            }

            return user; 
        }
        catch(error){
            console.log('stateService - getUser Error retrieving user - '+error.message);

            return null;
        }
    };

    this.isLoggedIn = function(){
        console.log('stateService - isLoggedIn?..');

        try{
           	if ($window.sessionStorage.pillsy){
                console.log('stateService - isLoggedIn?..got pillsy, check...');

                var pillsy = JSON.parse($window.sessionStorage.pillsy);
                var token  = pillsy.token; 
                var user   = pillsy.user;  
                console.log('stateService - isLoggedIn - token is: '+token);
                console.log('stateService - isLoggedIn - user is: '+user);

                if ( token && user ){
                    console.log('stateService - isLoggedIn is true');

                    return true;
                }
                else{
                    console.log('stateService - isLoggedIn is false');

                    return false;
                }
            }
            else{
                console.log('stateService - isLoggedIn?..no pillsy, not logged in...');

                return false;
            }
        }
        catch(error){
            console.log('stateService - isLoggedIn error: '+error.message);

            return false;
        }
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