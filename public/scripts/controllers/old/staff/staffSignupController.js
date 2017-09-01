/** Pillsy
 *  @author  Chuks Onwuneme
 *  @version 1.0
 *  @package Pillsy app main AngularJS module  
 */

angular
  .module('staff_signup', ['theme.core.services'])
  .controller('StaffSignupController', ['$scope', '$http', '$theme', 'APIService', '$location',
    function($scope, $http, $theme, apiService, $location) {

        'use strict';
        $theme.set('fullscreen', true);

        $scope.$on('$destroy', function() {
            $theme.set('fullscreen', false);
        });

        $scope.confirmationSent = false;

        $scope.submit = function(form) {
            console.log('submitted form...firstname: '+ $scope.firstname);
            console.log('submitted form...lastname: '+ $scope.lastname);
            console.log('submitted form...title: '+ $scope.title);
            console.log('submitted form...email: '+ $scope.email);
            console.log('submitted form...password: '+ $scope.password);
            console.log('submitted form...confirm_password: '+ $scope.confirm_password);

            if ($scope.password == $scope.confirm_password){

                console.log('Passwords match, proceed with registration...');

                // Trigger validation flag.
                $scope.submitted = true;

                var dataObj = {
                    'firstname':  $scope.firstname,
                    'lastname':   $scope.lastname,
                    'title':      $scope.title,
                    'email':      $scope.email,
                    'phone':      $scope.phone,
                    'password':   $scope.password,
                };  
                
                var api = '/v1/n/staff/user';
                console.log('apiService.post - api is: '+api);

                apiService.post(api,dataObj).then(function(result){
                    console.log('apiService.post - result is: '+JSON.stringify(result));

                    if (result.msg == 'success'){
                        console.log('apiService.post - success');

                        $location.path('/stafflogin');
                    }
                    else{
                        console.log('apiService.post - error');

                        alert(result.msg);
                    }
                });
            }
            else{
                alert('Passwords don\'t match');
            }
        };

  }]);
