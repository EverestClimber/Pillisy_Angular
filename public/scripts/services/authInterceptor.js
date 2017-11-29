/** Pillsy
 *  @author  Chuks Onwuneme
 *  @version 1.0
 *  @package AuthInterceptor AngularJS module  
 */

var app = angular.module('AuthInterceptor', []);     //instantiates AuthInterceptor module
app.factory('authInterceptor', function ($rootScope, $q, $window, $cookies, $location) {
	return {
		request: function (config) {
			console.log('authInterceptor - I have intercepted http request...');

			config.headers = config.headers || {};

			if ($window.sessionStorage.pillsy){
				console.log('authInterceptor - found pillsy object in sessionStorage...');

				try{
					var pillsy = JSON.parse($window.sessionStorage.pillsy);

					if (pillsy){
						console.log('authInterceptor - successfully parsed pillsy object in sessionStorage...');

						var token = pillsy.token;
						var user  = pillsy.user;

						if (token && user){
							console.log('authInterceptor - successfully retrieved token and user');

							var subdomain = null;
					        var host      = $location.host();

					        if (host === 'localhost'){
					            subdomain = 'localhost';
					        }
					        else{
					            var parts = host.split('.');
					            // more than domain.com, will always return the first
					            if (parts.length > 2){
					                subdomain = parts[0];
					                subdomain = subdomain.toLowerCase();
					            }
					        }
					        
							config.headers['x-access-token'] = token;
							config.headers['x-key']          = user.id;
							config.headers['x-subdomain']    = subdomain;
						}
						else{
							console.log('authInterceptor - missing token and user');
						}
					}
				}
				catch(e){
					console.log('authInterceptor - error parsing pillsy object in sessionStorage: '+e.message);
				}
			}
			else{
				console.log('authInterceptor - did not find pillsy object in sessionStorage...');
			}

			return config;
		},

		response: function (response) {
			if (response.status === 401 || response.status === 403) {
				console.log('authInterceptor - user is not authenticated...');

				$location.path('/index');
			}

			return response || $q.when(response);
		}
	};
});