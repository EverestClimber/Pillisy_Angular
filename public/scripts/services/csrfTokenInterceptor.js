
/** Pillsy
 *  @author  Chuks Onwuneme
 *  @version 1.0
 *  @package CsrfTokenInterceptor AngularJS module  
 */

var app = angular.module('CsrfTokenInterceptor', []);     //instantiates CsrfTokenInterceptor module
app.factory('csrfTokenInterceptor', function () {

	var readCookie = function(name) {
	    var nameEQ = name + "=";
	    var ca = document.cookie.split(';');
	    for(var i=0;i < ca.length;i++) {
	        var c = ca[i];
	        while (c.charAt(0)==' ') c = c.substring(1,c.length);
	        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
	    }
	    return null;
	}

	var XSRFInterceptor = {
        request: function(config) {
            var token = readCookie('XSRF-TOKEN');
            if (token) {
                config.headers['X-XSRF-TOKEN'] = token;
            }
            return config;
        }
    };

    return XSRFInterceptor;
});