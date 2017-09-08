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

    //patient cache data
    $scope.activeGroup   = stateService.getActiveGroup();
    $scope.activePatient = stateService.getActivePatient();

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

		if ($scope.activePatient.currentTimeZone){
			$scope.activePatientTimeZone = $scope.activePatient.timeZone;
		}
		else{
			$scope.activePatientLocation = 'N/A';
		}

		var groups = stateService.getUserGroups();
        $rootScope.$emit("my_groups_callback", {groups: groups});
		
		$scope.totalMeds = 0;
		$scope.pagingOptions = {
		   	pageSizes: [10, 20, 30],
		   	pageSize:   10,
		    currentPage: 1
		};

		getDataFromCache();
	}

	function getDataFromCache(){
		var cachedData = stateService.getActivePatientDrugs();

	    if (cachedData){
	        setMedsPagingData(cachedData, $scope.pagingOptions.currentPage, $scope.pagingOptions.pageSize);
	    }
	}

	/*function preparePatientData(cachedData){
		var data = [];

		var filteredData = cachedData.filter(function(patient){
			return (patient.id == $scope.activePatient.id);
		});

		if (filteredData.length > 0){
			
			var patientData = filteredData[0];
			var drugs       = patientData.drugs;

			drugs.forEach(function(drug){

				var obj = {
	                "id": 		  drug.id,
	                "name":       drug.name,
	                "status":     drug.status,
	                "doseTimes":  drug.doseTimes,
	                "todayTaken": drug.todayTaken,
	                "interval":   drug.interval,
	                "average":    drug.average,
	                "remaining":  drug.remaining
	          	};

	            if (patient.todayDoses){
	                var todayDoses = patient.todayDoses;
	                    		
	                if (todayDoses.length > 0){
	                    console.log('apiService.get - found doses, display...');

	                    var doseTime  = '';
	                    var doseTaken = '';
	                    var index = 0;

	                    todayDoses.forEach(function(todayDose){
	                    	if (todayDose.doseTime){
		                    	if ( (todayDose.doseTime != 'N/A') && (todayDose.doseTime != 'MISSED') && (todayDose.doseTime != '--')){
		                    		todayDose.doseTime = moment(todayDose.doseTime).format("h:mm A")
		                    	}
		                    }

		                    doseTime = doseTime + todayDose.doseTime;

		                    if (todayDose.doseTaken){
		                    	if ((todayDose.doseTaken != 'N/A') && (todayDose.doseTaken != 'MISSED') && (todayDose.doseTaken != '--')){
		                    		todayDose.doseTaken = moment(todayDose.doseTaken).format("h:mm:ss A")
		                    	}
		                    }

		                    doseTaken = doseTaken + todayDose.doseTaken;
		                    index++;

		                    if (index < todayDoses.length){
		                    	doseTime  = doseTime + '; ';
		                    	doseTaken = doseTaken + '; ';
		                    }
	                    });

	                    obj.doseTime  = doseTime;
	                    obj.doseTaken = doseTaken;
	                }
	                else{
	                    console.log('apiService.get - there are no doses...');

	                    obj.doseTime  = 'N/A';
	                    obj.doseTaken = 'N/A';
	                }
	            }

	            data.push(obj);
			});
		}

		return data;
	}*/

	function getInterval(){
        var now = new Date();

        var interval = {
        	intervalStartTime:  moment(now.getTime()).subtract(3,'days').startOf('day').valueOf(),
            intervalEndTime:    now.getTime(),
            now:                now.getTime(),
            timeZoneOffset:     now.getTimezoneOffset()
        };

        return encodeURIComponent( JSON.stringify(interval) );
    }

    /*function getPercentValue(value, total){
    	var percent;

    	if (total > 0){
            if (value > 0){
                var numY = (value / total) * 100;
                percent = (Math.round( numY * 10 ) / 10) + '%';
            }
            else{
                percent = '0%';
            }
        }
        else{
            percent = 'N/A';
        }

        return percent;
    };*/

	function setMedsPagingData(data, page, pageSize) {
	   	var pagedData    = data.slice((page - 1) * pageSize, page * pageSize);

	   	$scope.meds      = pagedData;
	   	$scope.totalMeds = data.length;

	   	if (!$scope.$$phase) {
	        $scope.$apply();
	   	}
	};

	$scope.refreshMeds = function(){
		$scope.loadingMeds = false;
	   	//getMedsPagedDataAsync($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage);
	};

	/*$scope.$watch('pagingOptions', function(newVal, oldVal) {
	   	if (newVal !== oldVal) {
	        getMedsPagedDataAsync($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage, $scope.medsFilterOptions.filterText);
	   	}
	}, true);

	$scope.$watch('medsFilterOptions', function(newVal, oldVal) {
	   	if (newVal !== oldVal) {
	       	getMedsPagedDataAsync($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage, $scope.medsFilterOptions.filterText);
	   	}
	}, true);*/

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

							var nameArr = $scope.activePatient.name.split(', ');

							if (nameArr.length > 0){
								$scope.activePatient.lastname = nameArr[0];

								if (nameArr.length == 2){
								    $scope.activePatient.firstname = nameArr[1];
								}
							}
                  				
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

})
.filter('fromNow', function() {
    return function(dateString) {
      	return moment(dateString).fromNow()
    };
});

