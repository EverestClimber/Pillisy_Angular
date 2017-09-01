/** Pillsy
 *  @author  Chuks Onwuneme
 *  @version 1.0
 *  @package Pillsy app main AngularJS module  
 */

angular
  .module('staff_login', ['theme.core.services'])
  .controller('StaffLoginController', ['$scope', '$http', '$theme', 'APIService', '$window', 'StateService',
    function($scope, $http, $theme, apiService, $window, stateService) {

    'use strict';
    $theme.set('fullscreen', true);

    $scope.$on('$destroy', function() {
      $theme.set('fullscreen', false);
    });

    $scope.submit = function(form) {
      console.log('submitted form...email: '+ $scope.email);
      console.log('submitted form...password: '+ $scope.password);

      // Trigger validation flag.
      $scope.submitted = true;

      var dataObj = {
        'email':    $scope.email,
        'password': $scope.password,
      };  
      
      var api = '/v1/n/staff/login';
      console.log('apiService.post - api is: '+api);

      apiService.post(api,dataObj).then(function(result){
          console.log('apiService.post - result is: '+JSON.stringify(result));

          if (result.msg == 'success'){
            console.log('apiService.post - success');

            stateService.login(result.data);
          }
          else{
            console.log('apiService.post - error');

            // Erase the token if the user fails to log in
            if ($window.sessionStorage.pillsy){
                delete $window.sessionStorage.pillsy;
            }

            alert(result.msg);
          }
      });

      // Making the fields empty
      //
      $scope.email='';
      $scope.password='';
    };
  }]);
