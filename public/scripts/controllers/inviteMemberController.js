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
        $scope.searchButtonText = 'Search';
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
            var api = '/v1/a/organization/group/'+groupId+'/member/groupInvitation';  

            $scope.searchButtonText = 'Searching';
            $scope.searchLoading    = true;

            apiService.post(api, user).then(function(result){
                $scope.searchButtonText = 'Search';
                $scope.searchLoading    = false;

                if (result.msg == 'success'){
                    console.log('apiService.post - success - found user, email/sms sent');

                    var inviteStatus = result.data.status; 
                    switch(inviteStatus){
                        case 0:
                            $scope.serverMsg = 'The person you are searching for does not exist on the Pillsy platform. '+
                                               'Try searching again with a valid organization email.';
                            break;
                        case 1:
                            $scope.serverMsg = 'An invitation has been sent to the user.';
                            break;
                            
                        case 2:
                            $scope.serverMsg = 'The user you tried to invite is already a member of your group.';
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
