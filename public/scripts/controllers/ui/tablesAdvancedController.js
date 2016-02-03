/** Pillsy
*  @author  Chuks Onwuneme
*  @version 1.0
*  @package TablesAdvancedController AngularJS module  
*/

var app = angular.module('TablesAdvancedController', ['ngGrid','APIService']);     //instantiates TablesAdvancedController module
app.controller('tablesAdvancedController', function ($scope, $filter, $http, apiService) {
	'use strict';

	$scope.filterOptions = {
      	filterText: '',
      	useExternalFilter: true
    };

    $scope.totalServerItems = 0;
    $scope.pagingOptions = {
      	pageSizes: [25, 50, 100],
      	pageSize: 25,
      	currentPage: 1
    };

    $scope.setPagingData = function(data, page, pageSize) {
      	var pagedData = data.slice((page - 1) * pageSize, page * pageSize);
      	$scope.myData = pagedData;
      	$scope.totalServerItems = data.length;
      
      	if (!$scope.$$phase) {
        	$scope.$apply();
      	}
    };

    $scope.getPagedDataAsync = function(pageSize, page, searchText) {
      	setTimeout(function() {
        	var api = '/v1/a/organization/groups';
        	var data;

        	if (searchText) {
          		var ft = searchText.toLowerCase();

          		apiService.get(api).then(function(result){
            		$scope.progress = false;

            		if (result){
              			if (result.msg == 'success'){
                			console.log('apiService.get - successfully retrieved groups: '+result);

                			var largeLoad = [];
                			
                			result.data.forEach(function(data){
                  
                  				var obj = {
                    				"Name":     data.name,
                    				"Owner":    data.owner.lastname+', '+data.owner.firstname,
                    				"Status":   data.status,
                    				"Patients": data.patients.length.toString(),
                    				"Created":  $filter('date')(data.createdAt, 'mediumDate')
                  				};

                  				largeLoad.push(obj);

                			});

                			data = largeLoad.filter(function(item) {
                  				return JSON.stringify(item).toLowerCase().indexOf(ft) !== -1;
                			});

                			$scope.setPagingData(data, page, pageSize);
              			}

              			else{
                			console.log('apiService.get - error creating group: '+result.msg);

                			alert(result.msg);
              			}
            		}
            		else{
              			console.log('apiService.get - error - no result from server');
            		}
          		});

        	} 
        	else {

          		apiService.get(api).then(function(result){
            		$scope.progress = false;

            		if (result){
              			if (result.msg == 'success'){
                			console.log('apiService.get - successfully retrieved groups: '+JSON.stringify(result));

                			var largeLoad = [];
                			result.data.forEach(function(data){

	                  			console.log('apiService.get - data.patients.length: '+data.patients.length);
	                  			console.log('apiService.get - data.name: '+data.name);

	                  			var obj = {
	                    			"Name":     data.name,
	                    			"Owner":    data.owner.lastname+', '+data.owner.firstname,
	                    			"Status":   data.status,
	                    			"Patients": data.patients.length,
	                    			"Created":  $filter('date')(data.createdAt, 'mediumDate')
	                  			}

	                  			largeLoad.push(obj);

                			});

                			$scope.setPagingData(largeLoad, page, pageSize);
              			}
              			else{
                			console.log('apiService.get - error creating group: '+result.msg);

                			alert(result.msg);
              			}
            		}
            		else{
              			console.log('apiService.get - error - no result from server');
            		}
          		});
        	}
      	}, 100);
    };

    $scope.getPagedDataAsync($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage);

    $scope.$watch('pagingOptions', function(newVal, oldVal) {
      	if (newVal !== oldVal) {
        	$scope.getPagedDataAsync($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage, $scope.filterOptions.filterText);
      	}
    }, true);

    $scope.$watch('filterOptions', function(newVal, oldVal) {
      	if (newVal !== oldVal) {
        	$scope.getPagedDataAsync($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage, $scope.filterOptions.filterText);
      	}
    }, true);

    $scope.gridOptions = {
      	data:              'myData',
      	enablePaging:      true,
      	showFooter:        true,
      	totalServerItems:  'totalServerItems',
      	pagingOptions:     $scope.pagingOptions,
      	filterOptions:     $scope.filterOptions
    };

});

app.filter('fromNow', function() {
    return function(dateString) {
      	return moment(dateString).fromNow()
    };
});

