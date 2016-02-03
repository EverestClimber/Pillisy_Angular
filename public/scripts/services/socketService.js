/** Pillsy
*  @author  Chuks Onwuneme
*  @version 1.0
*  @package SocketService AngularJS module  
*/

var app = angular.module('SocketService', []);     //instantiates SocketService module
app.factory('socketService', function ($rootScope) {
	var socket = io.connect();  //connects to the current website's domain and port

	return {
    	on: function (eventName, callback) {
      		socket.on(eventName, function () {  
        		var args = arguments;
        		$rootScope.$apply(function () {
          			callback.apply(socket, args);
        		});
      		});
    	},
    	emit: function (eventName, data, callback) {
      		socket.emit(eventName, data, function () {
        		var args = arguments;
        		$rootScope.$apply(function () {
          			if (callback) {
            			callback.apply(socket, args);
          			}
        		});
      		});
    	}
  	};

});