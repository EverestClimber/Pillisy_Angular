/** Pillsy
 *  @author  Chuks Onwuneme
 *  @version 1.0
 *  @package Pillsy app main AngularJS module  
 */

var app = angular.module('pillsyApp', ['Pillsy','theme.demos','AuthInterceptor','CsrfTokenInterceptor']);
app.config(['$provide', '$routeProvider','$locationProvider', '$httpProvider','$cookiesProvider','localStorageServiceProvider',
    function($provide, $routeProvider, $locationProvider, $httpProvider, $cookiesProvider,localStorageServiceProvider) {
        'use strict';

        localStorageServiceProvider
        .setPrefix('Pillsy')
        .setNotify(true, true);

        $routeProvider
        .when('/', {
            templateUrl: 'views/groups/mygroups.html'
        })
        .when('/:templateFile/', {
            templateUrl: function(param) {
                return 'views/' + param.templateFile + '.html';
            }
        })
        .when('/admin/:templateFile/', {
            templateUrl: function(param) {
                return 'views/admin/' + param.templateFile + '.html';
            }
        })
        .when('/auth/:templateFile/', {
            templateUrl: function(param) {
                return 'views/auth/' + param.templateFile + '.html';
            }
        })
        .when('/group/:templateFile/', {
            templateUrl: function(param) {
                return 'views/group/' + param.templateFile + '.html';
            }
        })
        .when('/profile/:templateFile/', {
            templateUrl: function(param) {
                return 'views/profile/' + param.templateFile + '.html';
            }
        })
        .when('/groups/:templateFile/', {
            templateUrl: function(param) {
                return 'views/groups/' + param.templateFile + '.html';
            }
        })
        .when('/group/patient/:templateFile/', {
            templateUrl: function(param) {
                return 'views/group/patient/' + param.templateFile + '.html';
            }
        })
        .when('/group/patient/med/:templateFile/', {
            templateUrl: function(param) {
                return 'views/group/patient/med/' + param.templateFile + '.html';
            }
        })
        .otherwise({
            redirectTo: '/'
        });

        // use the HTML5 History API
        $locationProvider.html5Mode({enabled: true, requireBase: false});
        $httpProvider.interceptors.push('authInterceptor');
        //$httpProvider.interceptors.push('socket');
        //$httpProvider.interceptors.push('csrfTokenInterceptor');
}])
.run(['$http', '$rootScope', '$location', '$templateCache', 'stateService', 'localStorageService', 
    function($http, $rootScope, $location, $templateCache, stateService, localStorageService) {

    $rootScope.numGroupsControlerCalled = 0;

    // register listener to watch route changes
    $rootScope.$on( "$routeChangeStart", function(event, next, current) {
      	console.log('app - routeChangeStart...');

     	if (!stateService.isLoggedIn()){
        	console.log('app - no logged in user. We should be going to #index');
        	console.log('app - no logged in user. next.pathParams.templateFile: '+next.pathParams.templateFile);
        
        	if (next.pathParams.templateFile == 'login'){
          		console.log(app - 'already going to /auth/login, no redirect needed');
        	} 
        	else if (next.pathParams.templateFile == 'signup'){
          		console.log('app - already going to /auth/signup, no redirect needed');
        	} 
            else if (next.pathParams.templateFile == 'staffregister'){
                console.log('app - already going to /auth/staffregister, no redirect needed');
            }
            else if (next.pathParams.templateFile == 'stafflogin'){
                console.log('app - already going to /auth/stafflogin, no redirect needed');
            } 
        	else if (next.pathParams.templateFile == 'index'){
          		console.log('app - already going to /index, no redirect needed');
        	} 
        	else{
        		$location.path( "/index" );
        	}
      	}  
      	else{
        	console.log('app - Logged in user has value');

          	if ( (next.pathParams.templateFile == 'index') 
          		|| (next.pathParams.templateFile == 'login') 
          		|| (next.pathParams.templateFile == 'signup') ){

          		console.log('app - User is logged in, but requested a loggedout state. Redirect to /');

          		$location.path( "/" );
          	}
            else{

            }
      	}     
    });
}]); 
