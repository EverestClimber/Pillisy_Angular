/** Pillsy
*  @author  Chuks Onwuneme
*  @version 1.0
*  @package NotificationsController AngularJS module  
*/
   
var app = angular.module('NotificationsController', []);  //instantiates NotificationsController module
app.controller('notificationsController', function ($scope, $filter) {
	'use strict';

	$scope.notifications = [
		{
      		text: 'Server #1 is live',
      		time: '4m',
      		class: 'notification-success',
      		iconClasses: 'glyphicon glyphicon-ok',
      		seen: true
    	}, 
    	{
      		text: 'New user Registered',
      		time: '10m',
      		class: 'notification-user',
      		iconClasses: 'glyphicon glyphicon-user',
      		seen: false
    	}, 
    	{
      		text: 'CPU at 92% on server#3!',
      		time: '22m',
      		class: 'notification-danger',
      		iconClasses: 'glyphicon glyphicon-exclamation-sign',
      		seen: false
    	},
    ];

    $scope.setSeen = function(item, $event) {
      	$event.preventDefault();
      	$event.stopPropagation();
      	item.seen = true;
    };

    $scope.setUnseen = function(item, $event) {
      	$event.preventDefault();
      	$event.stopPropagation();
      	item.seen = false;
    };

    $scope.setSeenAll = function($event) {
      	$event.preventDefault();
      	$event.stopPropagation();
      	angular.forEach($scope.notifications, function(item) {
        	item.seen = true;
      	});
    };

    $scope.unseenCount = $filter('filter')($scope.notifications, {
      	seen: false
    }).length;

    $scope.$watch('notifications', function(notifications) {
      	$scope.unseenCount = $filter('filter')(notifications, {
        	seen: false
      	}).length;
    }, true);
});
