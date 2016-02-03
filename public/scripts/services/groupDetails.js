/** Pillsy
*  @author  Chuks Onwuneme
*  @version 1.0
*  @package GroupDetails AngularJS module  
*/

var app = angular.module('GroupDetails', []);     //instantiates GroupDetails module
app.factory('groupDetails', function($window) {
	console.log('groupDetails');

    var groupService = {};
    groupService.getGroup = function(){
    	console.log('groupDetails - getGroup');

    	var group = null;

    	if ($window.sessionStorage.group){
    		group = JSON.parse($window.sessionStorage.group);
    	}

    	return group;
    }

    return groupService;
});