/** Pillsy
*  @author  Chuks Onwuneme
*  @version 1.0
*  @package mainController AngularJS module  
*/
   
var app = angular.module('MainController', ['theme.core.services']);  //instantiates MainController module
app.controller('mainController', function ($scope, $theme, $timeout, $rootScope, progressLoader, $location, stateService) {
	'use strict';

  $scope.copyright_year = new Date().getUTCFullYear();

	// $scope.layoutIsSmallScreen = false;
	$scope.layoutFixedHeader 			 = $theme.get('fixedHeader');
    $scope.layoutPageTransitionStyle     = $theme.get('pageTransitionStyle');
    $scope.layoutDropdownTransitionStyle = $theme.get('dropdownTransitionStyle');
    $scope.layoutPageTransitionStyleList = ['bounce',
      	'flash',
      	'pulse',
      	'bounceIn',
      	'bounceInDown',
      	'bounceInLeft',
      	'bounceInRight',
      	'bounceInUp',
      	'fadeIn',
      	'fadeInDown',
      	'fadeInDownBig',
      	'fadeInLeft',
      	'fadeInLeftBig',
      	'fadeInRight',
      	'fadeInRightBig',
      	'fadeInUp',
      	'fadeInUpBig',
      	'flipInX',
      	'flipInY',
      	'lightSpeedIn',
      	'rotateIn',
      	'rotateInDownLeft',
      	'rotateInDownRight',
      	'rotateInUpLeft',
      	'rotateInUpRight',
      	'rollIn',
      	'zoomIn',
      	'zoomInDown',
      	'zoomInLeft',
      	'zoomInRight',
      	'zoomInUp'
    ];

    $scope.layoutLoading = true;
    $scope.getLayoutOption = function(key) {
      	return $theme.get(key);
    };

    $scope.setNavbarClass = function(classname, $event) {
      	$event.preventDefault();
      	$event.stopPropagation();
      	$theme.set('topNavThemeClass', classname);
    };

    $scope.setSidebarClass = function(classname, $event) {
      	$event.preventDefault();
      	$event.stopPropagation();
      	$theme.set('sidebarThemeClass', classname);
    };

    $scope.$watch('layoutFixedHeader', function(newVal, oldval) {
      	if (newVal === undefined || newVal === oldval) {
        	return;
      	}
      	$theme.set('fixedHeader', newVal);
    });

    $scope.$watch('layoutLayoutBoxed', function(newVal, oldval) {
      	if (newVal === undefined || newVal === oldval) {
        	return;
      	}
      	$theme.set('layoutBoxed', newVal);
    });

    $scope.$watch('layoutLayoutHorizontal', function(newVal, oldval) {
      	if (newVal === undefined || newVal === oldval) {
        	return;
      	}
      	$theme.set('layoutHorizontal', newVal);
    });

    $scope.$watch('layoutPageTransitionStyle', function(newVal) {
      	$theme.set('pageTransitionStyle', newVal);
    });

    $scope.$watch('layoutDropdownTransitionStyle', function(newVal) {
      	$theme.set('dropdownTransitionStyle', newVal);
    });

    $scope.hideHeaderBar = function() {
      	$theme.set('headerBarHidden', true);
    };

    $scope.showHeaderBar = function($event) {
      	$event.stopPropagation();
      	$theme.set('headerBarHidden', false);
    };

    $scope.toggleLeftBar = function() {
      	if ($scope.layoutIsSmallScreen) {
        	return $theme.set('leftbarShown', !$theme.get('leftbarShown'));
      	}
      	$theme.set('leftbarCollapsed', !$theme.get('leftbarCollapsed'));
    };

    $scope.toggleRightBar = function() {
      	$theme.set('rightbarCollapsed', !$theme.get('rightbarCollapsed'));
    };

    $scope.toggleSearchBar = function($event) {
      	$event.stopPropagation();
      	$event.preventDefault();
      	$theme.set('showSmallSearchBar', !$theme.get('showSmallSearchBar'));
    };

    $scope.chatters = [
    	{
      		id: 0,
      		status: 'online',
      		avatar: 'potter.png',
      		name: 'Jeremy Potter'
    	}, 
    	{
      		id: 1,
      		status: 'online',
      		avatar: 'tennant.png',
      		name: 'David Tennant'
    	}, 
    	{
      		id: 2,
      		status: 'online',
      		avatar: 'johansson.png',
      		name: 'Anna Johansson'
    	}
    ];

    $scope.currentChatterId = null;
    $scope.hideChatBox = function() {
      	$theme.set('showChatBox', false);
    };

    $scope.toggleChatBox = function(chatter, $event) {
      	$event.preventDefault();
      	if ($scope.currentChatterId === chatter.id) {
        	$theme.set('showChatBox', !$theme.get('showChatBox'));
      	} else {
        	$theme.set('showChatBox', true);
      	}
      	$scope.currentChatterId = chatter.id;
    };

    $scope.hideChatBox = function() {
      	$theme.set('showChatBox', false);
    };

    $scope.$on('themeEvent:maxWidth767', function(event, newVal) {
      	$timeout(function() {
        	$scope.layoutIsSmallScreen = newVal;
        	if (!newVal) {
          		$theme.set('leftbarShown', false);
        	} else {
          	$theme.set('leftbarCollapsed', false);
        }
      });
    });

    $scope.$on('themeEvent:changed:fixedHeader', function(event, newVal) {
      	$scope.layoutFixedHeader = newVal;
    });

    $scope.$on('themeEvent:changed:layoutHorizontal', function(event, newVal) {
      	$scope.layoutLayoutHorizontal = newVal;
    });

    $scope.$on('themeEvent:changed:layoutBoxed', function(event, newVal) {
      	$scope.layoutLayoutBoxed = newVal;
    });

    $scope.isLoggedIn = stateService.isLoggedIn(); 

    $scope.getUser = function(){
        console.log('mainController - getUser...');

        return stateService.getUser();
    }

    $scope.getLoggedInUserFullName = function(){
        console.log('mainController - getLoggedInUserFullName...');

        var user = stateService.getUser();
        var fullName = '';

        if (user){
            console.log('mainController - getLoggedInUserFullName...got user, return fullName');

            fullName =  user.lastname +', '+user.firstname;
        }
        else{
            console.log('mainController - getLoggedInUserFullName...did not get fullName');
        }

        return fullName;
    }

    $scope.logOut = function() {
        console.log('mainController - logging out...');

        stateService.logOut();
    };

    var unbind = $rootScope.$on("login_status_change", function (event, data) {
        console.log('mainController - got login_success event...'); 

        var isLoggedIn    = data.isLoggedIn;
        $scope.isLoggedIn = isLoggedIn;

        if (!isLoggedIn){
            console.log('mainController - logged out'); 
            $location.path( "/index" );
        }

    });

    $scope.$on('$destroy', unbind);
    $scope.rightbarAccordionsShowOne = false;
    $scope.rightbarAccordions = [
    	{
      		open: true
    	}, 
    	{
      		open: true
    	}, 
    	{
      		open: true
    	}, 
    	{
      		open: true
    	}, 
    	{
      		open: true
    	}, 
    	{
      		open: true
    	}, 
    	{
      		open: true
    	}
    ];

    $scope.$on('$routeChangeStart', function() {
      	if ($location.path() === '') {
        	return $location.path('/');
      	}
      	progressLoader.start();
      	progressLoader.set(50);
    });

    $scope.$on('$routeChangeSuccess', function() {
      	progressLoader.end();
      	if ($scope.layoutLoading) {
        	$scope.layoutLoading = false;
      	}
    });
});
