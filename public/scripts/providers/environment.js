/** Pillsy
*  @author  Chuks Onwuneme
*  @version 1.0
*  @package Environment provider 
*/
   
var app = angular.module('Environment', []);     //instantiates EnvironmentProvider module   
app.provider('environment', function(){
    return {
        $get: function($http){
            /*console.log('environment provider');
            
            var url = '/environment';

            return $http.get(url)
                .then(function(response) {
                    if (typeof response.data === 'object') {
                        return response.data;
                    } 
                    else {    
                        return response.data;
                    }

                }, function(response) {
                    return response.data;
            });*/
        },
    }
});