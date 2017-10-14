/** Pillsy
*  @author  Chuks Onwuneme
*  @version 1.0
*  @package PatientViewController AngularJS module  
*  @Copyright Pillsy, Inc. 
*/

var app = angular.module('PatientViewController', ['theme.core.services','theme.chart.flot', 'ngGrid', 'angular-skycons',
    'theme.demos.forms','theme.demos.tasks', 'nvd3ChartDirectives']);     //instantiates PatientViewController module

app.controller('patientViewController', function ($scope, $timeout, $theme, $window, $location, $filter, $rootScope, apiService, stateService, configService) {
    'use strict';

    var d3 = $window.d3;

    var pillsy = stateService.getPillsy();

    //patient cache data
    $scope.activeGroup        = stateService.getActiveGroup();
    $scope.activePatient 	  = stateService.getActivePatient();
    $scope.organizationGroups = pillsy.organizationGroups;

	if ( !$scope.activeGroup || !$scope.activePatient){
	  	$location.path('/');
	}
	else{
		configService.retrieveConfigs()
        .then(function(configs){
            
            initData(configs);
        });
	}

	function initData(configs){
		$scope.patient_name          = $scope.activePatient.firstname + " " + $scope.activePatient.lastname;
		$scope.activePatientImageUrl = configs.awsBucket + "/users/"+ $scope.activePatient.id +"/profile/profile.jpg";
		$scope.activePatientPhone    = $scope.activePatient.phone_formatted;

		if ($scope.activePatient.city){
			$scope.activePatientLocation = $scope.activePatient.city;

			if ($scope.activePatient.state){
				$scope.activePatientLocation = $scope.activePatientLocation + ', ' + $scope.activePatient.state;
			}
		}
		else{
			$scope.activePatientLocation = 'N/A';
		}

		if ($scope.activePatient.timeZone){
			$scope.activePatientTimeZone = $scope.activePatient.timeZone;
		}
		else{
			$scope.activePatientLocation = 'N/A';
		}

		$scope.pagingOptions = {
            pageSizes: ['10', '20', '30'],
            pageSize:  '20',
            currentPage: 1
        };

        $scope.filterOptions = {
            filterText: '',
            useExternalFilter: true
        };

        $scope.totalMeds = 0;

		getDataFromCache();
	}

	$scope.$watch('pagingOptions', function(newVal, oldVal) {
        if (newVal !== oldVal) {
        	console.log('changed to pageSize: '+ $scope.pagingOptions.pageSize)
            //fetchPatients($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage);
        }
    }, true);

    $scope.$watch('filterOptions', function(newVal, oldVal) {
        if (newVal !== oldVal) {
            //fetchPatients($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage);
        }
    }, true);

	function getDataFromCache(){
		var cachedData = stateService.getActivePatientDrugs();

	    if (cachedData){
	    	cachedData.forEach(function(data){
	    		var drugReminders = data.drugReminders;
	    		var doseTimes     = [];

	    		if (drugReminders.length > 0){

	    			drugReminders.forEach(function(drugReminder){
						doseTimes.push( drugReminder.doseTimeStr );	    				
	    			});
	    		}

	    		data['doseTimes'] = doseTimes.join(';');
	    	});

	        setMedsPagingData(cachedData, $scope.pagingOptions.currentPage, $scope.pagingOptions.pageSize);
	    }
	}

	function setMedsPagingData(data, page, pageSize) {

	   	var pagedData    = data.slice((page - 1) * pageSize, page * pageSize);
	   	$scope.meds      = pagedData;
	   	$scope.totalMeds = data.length;

	   	if (!$scope.$$phase) {
	        $scope.$apply();
	   	}
	};

	$scope.onMedRowClick = function(row) {
	   	console.log("onMedRowClick");

	   	if (stateService.setActivePatientDrug(row.entity)){
	       	$location.path('/patients/patient/med/data');
	  	}
	   	else{
	       	//could not set group
	   	}
	};

	var nameTemplate = '<div><input type="button" style="color: #2685ee" value="{{ row.entity.name }}" ng-click="onMedRowClick(row)"/></div>';

	$scope.medsGridOptions = {
	   	data: 'meds',
	    columnDefs: [
	    	{ field: 'name',              displayName: 'Name', cellTemplate: nameTemplate }, 
	    	{ field: 'status',            displayName: 'Status' }, 
	    	{ field: 'doseTimes',         displayName: 'Dose Time(s)' }, 
	    	{ field: 'todayTaken',        displayName: 'Time(s) taken today' }, 
	    	{ field: 'intervalAdherence', displayName: 'Last 3 days' },
	    	{ field: 'averageAdherence',  displayName: 'Average Taken' }, 
	    	{ field: 'remaining',         displayName: 'Remaining' }, 
		],
	    multiSelect:                false,
        enablePaging:               true,
        showFooter:                 true,
        enableRowSelection:         false, 
        enableSelectAll:            false,
        enableRowHeaderSelection:   false,
        noUnselect:                 false,
        enableGridMenu:             true,
        enableColumnResize:         true,
        totalServerItems:           'totalMeds',
        pagingOptions:              $scope.pagingOptions,
        filterOptions:              $scope.medsFilterOptions,
        enableCellSelection:        false
	};

	//--profile----
	$scope.postPatientData = function(key, value){

		var patientId = $scope.activePatient.id;
	    var groupId   = $scope.activeGroup.id;

	   	if (patientId && groupId){

			var api = '/v1/a/organization/group/'+ groupId +'/patient/'+ patientId +'/data';
			var patientData  = {};
			patientData[key] = value;

			apiService.put(api, patientData).then(function(result){
		    	$scope.progress = false;

		       	if (result){
		           	if (result.msg == 'success'){
		               	console.log('apiService.get - successfully updated patient\'s '+key);

		               	var user = result.data;

		               	if ($scope.activePatient.id == user.id){
		               		for (var property in $scope.activePatient) {
								if (user.hasOwnProperty(property)) {
									$scope.activePatient[property] = user[property];
								}
							}

							$scope.patient_name = $scope.activePatient.firstname + " " + $scope.activePatient.lastname;
		                  	stateService.setActivePatient($scope.activePatient);
		               	}
		          	}
		          	else{
		               	alert(result.msg);
		           	}
		      	}
		      	else{
		           	alert('Server error');
		      	}
		 	});

		}
		else{
		   	alert('Server error');
		}	
	}

	$scope.updatePatientGroup = function(groups){

		var patientGroups = [];

		groups.forEach(function(id){
			angular.forEach($scope.organizationGroups, function(obj){
				if (id == obj.id){
					patientGroups.push(obj);
				}
			});
		});

		$scope.activePatient.groups = patientGroups;
		$scope.showGroups();
	};

  	$scope.showGroups = function() {

    	var selected = [];
    	angular.forEach($scope.activePatient.groups, function(s){
			selected.push(s.name);
    	});

    	return selected.length ? selected.join(', ') : 'Not set';
  	};

})
.filter('fromNow', function() {
    return function(dateString) {
      	return moment(dateString).fromNow()
    };
});

