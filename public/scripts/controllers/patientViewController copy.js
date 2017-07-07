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

		var groups = stateService.getUserGroups();
        $rootScope.$emit("my_groups_callback", {groups: groups});

	    $scope.trendsData = [];
		$scope.multiBarChartData = [];
		$scope.pieChartData = [];

	    $scope.loadingTrendsChartData = false;
		$scope.loadingMedsChartData   = false;
		$scope.loadingMeds = false;

		$scope.doses = [
		    {
		    	id:  0,
		    	tag: 'All' 
		    },
		    {
		    	id:  1,
		    	tag: 'Morning' 
		    },
		    {
		    	id:  3,
		    	tag: 'Day' 
		    },
		    {
		    	id:  4,
		    	tag: 'Night' 
		    }
		];

		$scope.selected_dose_trends = $scope.doses[0];
		$scope.selected_dose_meds   = $scope.doses[0];

		$scope.medChartTypes = ['Bar','Pie'];
		$scope.medChartType  = $scope.medChartTypes[0];

		/*$scope.changeMedChartType = function(type){
		   	$scope.medChartType = type;

		    setMultiBarChartData();
		}*/

		//----MEDS----
		$scope.medsFilterOptions = {
		   	filterText: '',
		   	useExternalFilter: true
		};
		
		$scope.totalMeds = 0;
		$scope.pagingOptions = {
		   	pageSizes: [5, 10, 20, 30],
		   	pageSize: 5,
		    currentPage: 1
		};

		getDataFromCache();

		/*
		//get from cache
	    var cachedData = stateService.getPatientDetails($scope.activePatient.id);
	    if (cachedData){
	    	var patientData = preparePatientData(cachedData);
	        setMedsPagingData(patientData, $scope.pagingOptions.currentPage, $scope.pagingOptions.pageSize);
	    }

	    //now make service call...
		getMedsPagedDataAsync($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage);*/
	}

	function getDataFromCache(){
		//var cachedData = stateService.getPatientDetails($scope.activePatient.id);
		var cachedData = stateService.getGroupDetails($scope.activeGroup.id);
	    if (cachedData){
	    	var patientData = preparePatientData(cachedData);
	        setMedsPagingData(patientData, $scope.pagingOptions.currentPage, $scope.pagingOptions.pageSize);
	    }
	}

	function preparePatientData(cachedData){
		var data = [];

		var filteredData = cachedData.filter(function(data){
			return (data.id == $scope.activePatient.id);
		});

		if (filteredData){
			alert('filteredData: '+JSON.stringify(filteredData));

			filteredData.forEach(function(patient){

				var obj = {
	                "id": 		   patient.drugId,
	                "name":        patient.drugName,
	                "status":      patient.status,
	                "interval":    patient.interval,
	                "average": 	   patient.all_time,
	                "remaining":   patient.remaining,
	                "quantity":    patient.quantity,
	                "reminders":   patient.drugReminders
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
	}

	function getInterval(){
        var now = new Date();

        var interval = {
        	startTime:  moment(now.getTime()).startOf('day').subtract(3,'days').valueOf(),
            endTime:    moment(now.getTime()).endOf('day').valueOf(),
            today:      now.getTime(),
            startOfDay: moment(now.getTime()).startOf('day').valueOf(),
            endOfDay:   moment(now.getTime()).endOf('day').valueOf()
        };

        return encodeURIComponent( JSON.stringify(interval) );
    }

    function getPercentValue(value, total){
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
    };

	function setMedsPagingData(data, page, pageSize) {
	   	var pagedData    = data.slice((page - 1) * pageSize, page * pageSize);
	   	$scope.meds      = pagedData;
	   	$scope.totalMeds = data.length;

	   	if (!$scope.$$phase) {
	        $scope.$apply();
	   	}

	   	//setPlotTrendsChartData();
	   	//setMultiBarChartData();
	};

	$scope.refreshMeds = function(){
	   	getMedsPagedDataAsync($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage);
	};

	function getMedsPagedDataAsync(pageSize, page, searchText) {

	   	/*var patientId = $scope.activePatient.id;
	    var groupId   = $scope.activeGroup.id;

	    if (patientId && groupId){
		  	var api = '/v1/a/organization/group/'+groupId+'/patient/'+patientId+'/drugs/adherence?interval='+getInterval();
		   	console.log('api is: '+api);
		        
		    $scope.loadingMeds = true;
			apiService.get(api).then(function(result){
              	$scope.loadingMeds = false;

              	if (result){
                	if (result.msg == 'success'){
                  		console.log('apiService.get - successfully retrieved group patients: '+result);

                  		var data = [];
                  		result.data.forEach(function(drug){
                  				
	                    	var obj = {
	                    		"id": 		   drug.id,
	                      		"name":        drug.name,
	                      		"status":      drug.status,
	                     		"interval":    drug.interval,
	                      		"average": 	   drug.average,
	                      		"remaining":   drug.remaining,
	                      		"quantity":    drug.quantity,
	                      		"reminders":   drug.reminders
	                    	};

	                    	if (drug.todayDoses){
	                    		var todayDoses = drug.todayDoses;
	                    		
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

                  		if (searchText) {
							var ft = searchText.toLowerCase();
                  			data = data.filter(function(item) {
                    			return JSON.stringify(item).toLowerCase().indexOf(ft) !== -1;
                  			});
                  		}

                  		stateService.setPatientDetails($scope.activePatient.id, data);
                  		setMedsPagingData(data, page, pageSize);
                	}
                	else{
                  		console.log('apiService.get - error retrieving patient meds: '+result.msg);

                  		alert(result.msg);
                	}
              	}
              	else{
                	console.log('apiService.get - error - no result from server');
              	}
            });
	    }*/
	};

	$scope.$watch('pagingOptions', function(newVal, oldVal) {
	   	if (newVal !== oldVal) {
	        getMedsPagedDataAsync($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage, $scope.medsFilterOptions.filterText);
	   	}
	}, true);

	$scope.$watch('medsFilterOptions', function(newVal, oldVal) {
	   	if (newVal !== oldVal) {
	       	getMedsPagedDataAsync($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage, $scope.medsFilterOptions.filterText);
	   	}
	}, true);

	$scope.onMedRowClick = function(row) {
	   	console.log("onMedRowClick");

	  	if (stateService.setActivePatientDrug(row.entity)){
	       	$location.path('/group/patient/med/data');
	  	}
	   	else{
	       	//could not set group
	   	}
	};

	var nameTemplate = '<div><input type="button" style="color: #2685ee" value="{{ row.entity.name }}" ng-click="onMedRowClick(row)"/></div>';

	$scope.medsGridOptions = {
	   	data: 'meds',
	    columnDefs: [
	    	{ field: 'name',      displayName: 'Name', cellTemplate: nameTemplate }, 
	    	{ field: 'status',    displayName: 'Status' }, 
	    	{ field: 'doseTime',  displayName: 'Dose Time(s)' }, 
	    	{ field: 'doseTaken', displayName: 'Time(s) taken today' }, 
	    	{ field: 'interval',  displayName: 'Last 3 days' },
	    	{ field: 'average',   displayName: 'Average Taken' }, 
	    	{ field: 'remaining', displayName: 'Remaining' }, 
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

	$scope.medClick = function(med){
	  	console.log('medClick');

	  	setPlotTrendsChartData();
	  	setMultiBarChartData();
	}

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

	$scope.sparklineChartData = [
      [1025409600000, 0],
      [1028088000000, -6.3382185140371],
      [1030766400000, -5.9507873460847],
      [1033358400000, -11.569146943813],
      [1036040400000, -5.4767332317425],
      [1038632400000, 0.50794682203014],
      [1041310800000, -5.5310285460542],
      [1043989200000, -5.7838296963382],
      [1046408400000, -7.3249341615649],
      [1049086800000, -6.7078630712489],
      [1051675200000, 0.44227126150934],
      [1054353600000, 7.2481659343222],
      [1056945600000, 9.2512381306992],
      [1059624000000, 11.341210982529],
      [1062302400000, 14.734820409020],
      [1064894400000, 12.387148007542],
      [1067576400000, 18.436471461827],
      [1070168400000, 19.830742266977],
      [1072846800000, 22.643205829887],
      [1075525200000, 26.743156781239],
      [1078030800000, 29.597478802228],
      [1080709200000, 30.831697585341],
      [1083297600000, 28.054068024708],
      [1085976000000, 29.294079423832],
      [1088568000000, 30.269264061274],
      [1091246400000, 24.934526898906],
      [1093924800000, 24.265982759406],
      [1096516800000, 27.217794897473],
      [1099195200000, 30.802601992077],
      [1101790800000, 36.331003758254],
      [1104469200000, 43.142498700060],
      [1107147600000, 40.558263931958],
      [1109566800000, 42.543622385800],
      [1112245200000, 41.683584710331],
      [1114833600000, 36.375367302328],
      [1117512000000, 40.719688980730],
      [1120104000000, 43.897963036919],
      [1122782400000, 49.797033975368],
      [1125460800000, 47.085993935989],
      [1128052800000, 46.601972859745],
      [1130734800000, 41.567784572762],
      [1133326800000, 47.296923737245],
      [1136005200000, 47.642969612080],
      [1138683600000, 50.781515820954],
      [1141102800000, 52.600229204305],
      [1143781200000, 55.599684490628],
      [1146369600000, 57.920388436633],
      [1149048000000, 53.503593218971],
      [1151640000000, 53.522973979964],
      [1154318400000, 49.846822298548],
      [1156996800000, 54.721341614650],
      [1159588800000, 58.186236223191],
      [1162270800000, 63.908065540997],
      [1164862800000, 69.767285129367],
      [1167541200000, 72.534013373592],
      [1170219600000, 77.991819436573],
      [1172638800000, 78.143584404990],
      [1175313600000, 83.702398665233],
      [1177905600000, 91.140859312418],
      [1180584000000, 98.590960607028],
      [1183176000000, 96.245634754228],
      [1185854400000, 92.326364432615],
      [1188532800000, 97.068765332230],
      [1191124800000, 105.81025556260],
      [1193803200000, 114.38348777791],
      [1196398800000, 103.59604949810],
      [1199077200000, 101.72488429307],
      [1201755600000, 89.840147735028],
      [1204261200000, 86.963597532664],
      [1206936000000, 84.075505208491],
      [1209528000000, 93.170105645831],
      [1212206400000, 103.62838083121],
      [1214798400000, 87.458241365091],
      [1217476800000, 85.808374141319],
      [1220155200000, 93.158054469193],
      [1222747200000, 65.973252382360],
      [1225425600000, 44.580686638224],
      [1228021200000, 36.418977140128],
      [1230699600000, 38.727678144761],
      [1233378000000, 36.692674173387],
      [1235797200000, 30.033022809480],
      [1238472000000, 36.707532162718],
      [1241064000000, 52.191457688389],
      [1243742400000, 56.357883979735],
      [1246334400000, 57.629002180305],
      [1249012800000, 66.650985790166],
      [1251691200000, 70.839243432186],
      [1254283200000, 78.731998491499],
      [1256961600000, 72.375528540349],
      [1259557200000, 81.738387881630],
      [1262235600000, 87.539792394232],
      [1264914000000, 84.320762662273],
      [1267333200000, 90.621278391889],
      [1270008000000, 102.47144881651],
      [1272600000000, 102.79320353429],
      [1275278400000, 90.529736050479],
      [1277870400000, 76.580859994531],
      [1280548800000, 86.548979376972],
      [1283227200000, 81.879653334089],
      [1285819200000, 101.72550015956],
      [1288497600000, 107.97964852260],
      [1291093200000, 106.16240630785],
      [1293771600000, 114.84268599533],
      [1296450000000, 121.60793322282],
      [1298869200000, 133.41437346605],
      [1301544000000, 125.46646042904],
      [1304136000000, 129.76784954301],
      [1306814400000, 128.15798861044],
      [1309406400000, 121.92388706072],
      [1312084800000, 116.70036100870],
      [1314763200000, 88.367701837033],
      [1317355200000, 59.159665765725],
      [1320033600000, 79.793568139753],
      [1322629200000, 75.903834028417],
      [1325307600000, 72.704218209157],
      [1327986000000, 84.936990804097],
      [1330491600000, 93.388148670744]
    ];

    $scope.sparklineXFunction = function() {
      return function(d) {
        return d[0];
      };
    };

    $scope.sparklineYFunction = function() {
      return function(d) {
        return d[1];
      };
    };

})
.filter('fromNow', function() {
    return function(dateString) {
      	return moment(dateString).fromNow()
    };
});

