/** Pillsy
 *  @author  Chuks Onwuneme
 *  @version 1.0
 *  @package ConfigService AngularJS module  
 */

var app = angular.module('ConfigService', []);     //instantiates ConfigService module
app.service('configService', ['$http', function ($http) {    
    console.log('configService');   

    return {
        retrieveConfigs: function(){
            return $http.get('/v1/n/environment').then(
                function(response) {
                    console.log('successCallback--');

                    return response.data;
                }, 
                function(response) {
                    console.log('errorCallback--');

                    return response.data;
                }
            );
        }
    }

}]);
