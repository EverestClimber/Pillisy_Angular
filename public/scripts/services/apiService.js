/** Pillsy
 *  @author  Chuks Onwuneme
 *  @version 1.0
 *  @package APIService AngularJS module  
 */

var app = angular.module('APIService', []);     //instantiates APIService module
app.factory('apiService', ['$http', 'configService',
    function ($http, configService) {    
        console.log('apiService');   

        var successCallback = function(response){
            console.log('apiService - successCallback'); 

            return response.data;
        };

        var errorCallback = function(response){
            console.log('apiService - errorCallback - data: '+JSON.stringify(response.data)); 

            return response.data;
        };

        return {
            post: function(url,params){
                console.log('apiService - post');

                return configService.retrieveConfigs()
                .then(function(configs){

                    url = configs.apiHost + url;
                    return $http.post(url, params).then(successCallback, errorCallback);
                });
            },

            put: function(url,params){
                console.log('apiService - put');

                return configService.retrieveConfigs()
                .then(function(configs){

                    url = configs.apiHost + url;
                    return $http.put(url, params).then(successCallback, errorCallback);
                });
            },

            get: function(url,params){
                console.log('apiService - get');

                return configService.retrieveConfigs()
                .then(function(configs){

                    url = configs.apiHost + url;
                    return $http.get(url).then(successCallback, errorCallback);
                });
            },

            delete: function(url,params){
                console.log('apiService - delete');

                return configService.retrieveConfigs()
                .then(function(configs){

                    url = configs.apiHost + url;
                    return $http.delete(url, params).then(successCallback, errorCallback);
                });
            }
        }
    }
]);
