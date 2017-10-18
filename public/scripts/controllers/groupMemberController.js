/** Pillsy
*  @author  Chuks Onwuneme
*  @version 1.0
*  @package GroupMembersController AngularJS module  
*/

var app = angular.module('GroupMemberController', ['ngGrid','xeditable']);     //instantiates GroupMemberController module
app.controller('groupMemberController', function ($window, $scope, $filter, $http, $location, $rootScope, apiService, stateService, lodash) {
    'use strict';

    var pillsy = stateService.getPillsy();

    if (!pillsy.active_group) {
        $location.path('/');
    }

    $scope.activeMember       = stateService.getActiveMember();
    $scope.organizationGroups = getOrganizationGroups();   //doesnt include master group

    $scope.statuses = [
        {value: 'pending',     text: 'pending'},
        {value: 'active',      text: 'active'},
        {value: 'suspended',   text: 'suspended'},
        {value: 'deactivated', text: 'deactivated'}
    ];

    $scope.roles = [
        {value: 'member', text: 'member'},
        {value: 'admin',  text: 'admin'}
    ];

    $scope.deleteMember = function(){

    };

    $scope.updateMember = function(key, member){
    	
    	if (key == 'role'){
    		if (member.role == 'admin'){
    			var answer = confirm('This will give '+member.firstname+' complete access to all data in your organization. Are you sure?');

    			if (answer){
    				processUpdateMember(key, member);
    			}
    			else{
    				$scope.activeMember.role = 'member';
    			}
    		}
    		else{
    			processUpdateMember(key, member);
    		}
    	}
    	else{
    		processUpdateMember(key, member);
    	}
    };

    function processUpdateMember(key, member){

    	var dataObj  = {};
        dataObj[key] = member[key];

      	callUpdate(dataObj, member.id);
    }

    $scope.updateMemberGroups = function(groupIds){

    	var memberGroups = [];

		groupIds.forEach(function(groupId){
			angular.forEach($scope.organizationGroups, function(obj){
				if (groupId == obj.id){
					var group = {
						id:   obj.id,
						name: obj.name,
						type: obj.type
					};

					memberGroups.push(group);
				}
			});
		});

		$scope.activeMember.groups = memberGroups;
		$scope.showGroups();

		updateMemberGroupsForOrganization();
    }

    $scope.showStatus = function(){
    	var selected = $filter('filter')($scope.statuses, {value: $scope.activeMember.status});
    	return ($scope.activeMember.status && selected.length) ? selected[0].text : 'Not set';
    }

    $scope.showRole = function(){
    	
    	var selected = $filter('filter')($scope.roles, {value: $scope.activeMember.role});
    	return ($scope.activeMember.role && selected.length) ? selected[0].text : 'Not set';
    }

    $scope.showGroups = function() {
    	var selected = [];
    	angular.forEach($scope.activeMember.groups, function(s){
    		if (s.type != 'master'){
				selected.push(s.name);
			}
    	});

    	return selected.length ? selected.join(', ') : 'Not set';
  	};

  	function callUpdate(dataObj, memberId){
        console.log('orgUserProfileController - callUpdate');

        var api = '/v1/a/organization/user/'+memberId;

        apiService.put(api, dataObj).then(function(result){
            console.log('orgUserProfileController - apiService.put - result is: '+JSON.stringify(result));

            if (result.msg == 'success'){
                console.log('orgUserProfileController - apiService.put - success');

                var member = result.data;
            }
            else{
                console.log('orgUserProfileController - apiService.put - error: '+result.msg);
            }
        });
    }

    function getOrganizationGroups(){

		var groups = [];
		var pillsy = stateService.getPillsy();

		if (pillsy){
			groups = pillsy.organizationGroups;

			//don't show the master group on the list
			if (groups.length > 0){
				groups = groups.filter(function(group){
					return group.type != 'master';
				});
			}
		}

		return groups;
	}

	function updateMemberGroupsForOrganization(){

  		var activeMember = $scope.activeMember;
  		var groups       = activeMember.groups;

  		var memberGroups = {
  			groups: groups
  		};

  		var api = '/v1/a/organization/member/'+ activeMember.id +'/groups';
			
		apiService.put(api, memberGroups).then(function(result){
		    $scope.progress = false;

		  	if (result){
		      	if (result.msg == 'success'){
		          	console.log('apiService.get - successfully updated member\'s '+groups);

		          	var data     = result.data;
		          	var memberId = data.memberId;
		          	var groups   = data.groups;

		          	$scope.activeMember.groups = groups;
		          	stateService.setMemberGroups(memberId, groups);
		      	}
		       	else{
		          	alert(result.msg);
		      	}
		    }
		    else{
		       	alert('Server error');
		    } 	
		});
  	}
});

