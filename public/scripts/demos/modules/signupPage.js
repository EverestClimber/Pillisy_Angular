/** Pillsy
 *  @author  Chuks Onwuneme
 *  @version 1.0
 *  @package Pillsy app main AngularJS module  
 */

angular
  .module('theme.demos.signup_page', [
    'theme.core.services'
  ])
  .controller('SignupPageController', ['$scope', '$http', '$theme', 'APIService', '$window',
    function($scope, $http, $theme, APIService, $window) {

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

      // If form is invalid, return and let AngularJS show validation errors.
      if (form.$invalid) {
        return;
      }

      var dataObj = {
        'email':    $scope.email,
        'password': $scope.password,
      };  
      
      var api = '/v1/n/organization/login';

      APIService.post(api,dataObj).then(function(result){
          console.log('result is: '+JSON.stringify(result));

          if (result.msg == 'success'){
            $window.sessionStorage.token = result.data.token;
            $window.sessionStorage.key   = result.data.user.id;

            console.log('token is: '+ $window.sessionStorage.token);

            //$window.location ='/'
          }
          else{
            // Erase the token if the user fails to log in
            delete $window.sessionStorage.token;
            delete $window.sessionStorage.key;

            alert(result.msg);
          }
      });

      // Making the fields empty
      //
      $scope.email='';
      $scope.password='';
    };
  }]);
