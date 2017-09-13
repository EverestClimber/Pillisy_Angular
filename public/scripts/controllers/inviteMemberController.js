/** Pillsy
*  @author  Chuks Onwuneme
*  @version 1.0
*  @package InviteMemberController AngularJS module  
*/

var app = angular.module('InviteMemberController', []);     //instantiates InviteMemberController module
app.controller('inviteMemberController', function ($scope, $filter, $location, apiService, stateService) {
	'use strict';

    console.log('inviteMemberController');

    var pillsy = stateService.getPillsy();

    var toggleForm = function(visible){
        $scope.invite_member_form   = visible;
        $scope.invite_member_status = !visible;
    };

    if (!pillsy.active_group) {
        $location.path('/');
    }
    else{
        $scope.searchButtonText = 'Invite';
        $scope.searchLoading    = false;
        $scope.groupId          = pillsy.active_group.id;
        $scope.groupName        = pillsy.active_group.name;
        $scope.groupExtName     = pillsy.active_group.identifier;

        console.log('inviteMemberController - $scope.groupId: '+ $scope.groupId );
        console.log('inviteMemberController - $scope.groupName: '+ $scope.groupName);
        console.log('inviteMemberController - $scope.groupExtName: '+ $scope.groupExtName);

        toggleForm(true);
    }
    
    $scope.searchUser = function(user){
        if (!user.email){
            alert('Email required');
        }
        else{
            var groupId = $scope.groupId;
            var api = '/v1/a/organization/group/'+groupId+'/member/invitation';  

            $scope.searchButtonText = 'Sending...';
            $scope.searchLoading    = true;

            apiService.post(api, user).then(function(result){
                $scope.searchButtonText = 'Invite';
                $scope.searchLoading    = false;

                if (result.msg == 'success'){
                    console.log('apiService.post - success - found user, email sent');

                    var inviteStatus = result.data.status; 
                    switch(inviteStatus){
                        case 0:
                            $scope.serverMsg = 'The email you entered is not valid for your organization.';
                            break;
                        case 1:
                            $scope.serverMsg = 'An invitation has been sent to the user.';
                            break;
                            
                        case 2:
                            $scope.serverMsg = 'The user you tried to invite is already a member of your organization.';
                            break;
                    }
                }
                else{
                    console.log('apiService.post - error');

                    $scope.serverMsg = result.msg;
                }

                toggleForm(false);
            });
        }
    }
});

app.filter('fromNow', function() {
    return function(dateString) {
      	return moment(dateString).fromNow()
    };
});
