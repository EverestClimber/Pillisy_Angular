/** Pillsy
*  @author  Chuks Onwuneme
*  @version 1.0
*  @package PatientViewController AngularJS module  
*  @Copyright Pillsy, Inc. 
*/

var app = angular.module('PatientViewController', ['theme.core.services','theme.chart.flot', 'ngGrid', 'angular-skycons',
    'theme.demos.forms','theme.demos.tasks', 'nvd3ChartDirectives']);     //instantiates PatientViewController module

app.controller('patientViewController', function ($scope, $timeout, $theme, $window, $location, $filter, apiService, stateService) {
    'use strict';

   	function getInterval(){
        var now = new Date();

        var interval = {
            startTime: moment(now.getTime()).startOf('day').subtract(3,'days').valueOf(),
            endTime:   moment().endOf('day').valueOf(),
            today:     now.getTime(),
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

    var d3 = $window.d3;

    //patient cache data
    var pillsy = stateService.getPillsy();
    
	if ( (!pillsy.active_patient) || (!pillsy.active_group) ){
	  	$location.path('/');
	}
	else{
		$scope.groupName = pillsy.active_group.name;
		$scope.patient   = pillsy.active_patient;

		initData();
	}

	function initData(){
	   	
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
		$scope.medsPagingOptions = {
		   	pageSizes: [5, 10, 20, 30],
		   	pageSize: 5,
		    currentPage: 1
		};
	}

	$scope.setMedsPagingData = function(data, page, pageSize) {
	    $scope.loadingMeds = false;

	   	var pagedData = data.slice((page - 1) * pageSize, page * pageSize);
	   	$scope.meds = pagedData;
	   	$scope.totalMeds = data.length;
	   	if (!$scope.$$phase) {
	        $scope.$apply();
	   	}

	   	setPlotTrendsChartData();
	   	setMultiBarChartData();
	};

	$scope.refreshMeds = function(){
	    $scope.loadingMeds = true;
	   	$scope.getMedsPagedDataAsync($scope.medsPagingOptions.pageSize, $scope.medsPagingOptions.currentPage);
	};

	$scope.getMedsPagedDataAsync = function(pageSize, page, searchText) {
	    $scope.progress = true;

	   	setTimeout(function() {

	      	var patientId = null;
	      	var groupId   = null;
	      	var interval  = $scope.interval;
	      	var pillsy    = stateService.getPillsy();

	      	if (pillsy){
	      		var group   = pillsy.active_group;
	      		var patient = pillsy.active_patient;

	      		if (group){
	      			groupId = group.id;
	      		}
	      			
	      		if (patient){
	      			patientId = patient.id;
	      		}
	      	}

	        if (patientId && groupId){
		        var api = '/v1/a/organization/group/'+groupId+'/patient/'+patientId+'/drugs/adherence?interval='+getInterval();
		        console.log('api is: '+api);
		        
				apiService.get(api).then(function(result){
              		$scope.progress = false;

              		if (result){
                		if (result.msg == 'success'){
                  			console.log('apiService.get - successfully retrieved group patients: '+result);

                  			var data = [];
                  			result.data.forEach(function(drug){
                  				
	                    		var obj = {
	                    			"id": 		   drug.id,
	                      			"name":        drug.name,
	                      			"status":      drug.status,
	                     			"interval":    getPercentValue(drug.intervalTaken, drug.intervalTotal),
	                      			"avg": 		   getPercentValue(drug.allTimeTaken, drug.allTimeTotal),
	                      			"remaining":   drug.remaining
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
		                    					if (todayDose.doseTime != 'N/A'){
		                    						todayDose.doseTime = moment(todayDose.doseTime).format("h:mm A")
		                    					}
		                    				}

		                    				doseTime = doseTime + todayDose.doseTime;

		                    				if (todayDose.doseTaken){
		                    					if ((todayDose.doseTaken != 'N/A') && (todayDose.doseTaken != '--')){
		                    						todayDose.doseTaken = moment(todayDose.doseTaken).format("h:mm A")
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

	                    				/*var firstDose = todayDoses[0];
	                    				if (firstDose.doseTime){
	                    					if (firstDose.doseTime != 'N/A'){
	                    						firstDose.doseTime = moment(firstDose.doseTime).format("h:mm A")
	                    					}
	                    				}

	                    				obj.doseTime  = firstDose.doseTime;

	                    				if (firstDose.doseTaken){
	                    					if ((firstDose.doseTaken != 'N/A') && (firstDose.doseTaken != '--')){
	                    						firstDose.doseTaken = moment(firstDose.doseTaken).format("h:mm A")
	                    					}
	                    				}

	                     				obj.doseTaken = firstDose.doseTaken;*/
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

                  			$scope.setMedsPagingData(data, page, pageSize);
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
		   	}
		   	else{
	          	$scope.setMedsPagingData([], page, pageSize);
	        }

	   	},100);
	};

	$scope.getMedsPagedDataAsync($scope.medsPagingOptions.pageSize, $scope.medsPagingOptions.currentPage);

	$scope.$watch('medsPagingOptions', function(newVal, oldVal) {
	   	if (newVal !== oldVal) {
	        $scope.getMedsPagedDataAsync($scope.medsPagingOptions.pageSize, $scope.medsPagingOptions.currentPage, $scope.medsFilterOptions.filterText);
	   	}
	}, true);

	$scope.$watch('medsFilterOptions', function(newVal, oldVal) {
	   	if (newVal !== oldVal) {
	       	$scope.getMedsPagedDataAsync($scope.medsPagingOptions.pageSize, $scope.medsPagingOptions.currentPage, $scope.medsFilterOptions.filterText);
	   	}
	}, true);

	$scope.onMedRowClick = function(row) {
	   	console.log("onMedRowClick");

	  	if (stateService.setActivePatientMed(row.entity)){
	       	$location.path('/group/patient/med/data');
	  	}
	   	else{
	       	//could not set group
	   	}
	        
	};

	var rowTemplate = '<div ng-click="onMedRowClick(row)" ng-style="{ \'cursor\': row.cursor }" ng-repeat="col in renderedColumns" ng-class="col.colIndex()" class="ngCell {{col.cellClass}}"><div class="ngVerticalBar" ng-style="{height: rowHeight}" ng-class="{ ngVerticalBarVisible: !$last }">&nbsp;</div><div ng-cell></div></div>';

	$scope.medsGridOptions = {
	   	data: 'meds',
	    columnDefs: [
	    	{ field: 'name',      displayName: 'Name' }, 
	    	{ field: 'status',    displayName: 'Status' }, 
	    	{ field: 'doseTime',  displayName: 'Dose Time(s)' }, 
	    	{ field: 'doseTaken', displayName: 'Time(s) taken today' }, 
	    	{ field: 'interval',  displayName: 'Last 3 days' },
	    	{ field: 'avg',       displayName: 'Average Taken' }, 
	    	{ field: 'remaining', displayName: 'Remaining' }, 
		],
		multiSelect:        		false,
        enablePaging:       		true,
        showFooter:         		true,
        enableRowSelection: 		true, 
        enableSelectAll:    		false,
        enableRowHeaderSelection: 	false,
        noUnselect:         		true,
        enableGridMenu:     		true,
        enableColumnResize:         true,
	    totalServerItems:   		'totalMeds',
	    pagingOptions:      		$scope.medsPagingOptions,
	    filterOptions:      		$scope.medsFilterOptions,
	    rowTemplate: 				rowTemplate
	};

	$scope.medClick = function(med){
	  	console.log('medClick');

	  	setPlotTrendsChartData();
	  	setMultiBarChartData();
	}

	//-------trends charts

	$scope.trendsDataOptions = {
	    series: {
	        	stack: true,
	        	lines: {
	          		//show: true,
	          		lineWidth: 2,
	          		fill: 0.1
	        	},
	        	splines: {
	          		show: true,
	          		tension: 0.3,
	          		fill: 0.1,
	          		lineWidth: 3
	        	},
	        	points: {
	          		show: true
	        	},
	        	shadowSize: 0
	    },
	    showControls: true,
	    grid: {
	        	labelMargin: 10,
	        	hoverable: true,
	        	clickable: true,
	        	borderWidth: 0
	    },
	    tooltip: true,
	      		tooltipOpts: {
	        	defaultTheme: false,
	        	//content: 'Adherence: %y'
	        	content: '<center><h4> Truvada </h4></center>' +
            			'<p>Adherence: %y% </p>'
	    },
	    colors: ['#b3bcc7'],
	    xaxis: {
	        tickColor: 'rgba(0,0,0,0.04)',
	        ticks: 10,
	        tickDecimals: 0,
	        autoscaleMargin: 0,
	        font: {
	          	color: 'rgba(0,0,0,0.4)',
	          	size: 11
	        }
	   	},
	    yaxis: {
	        tickColor: 'transparent',
	        ticks: 4,
	        tickDecimals: 0,
	        //tickColor: 'rgba(0,0,0,0.04)',
	        font: {
	          	color: 'rgba(0,0,0,0.4)',
	          	size: 11
	        },
	        tickFormatter: function(val) {
	          	if (val > 999) {
	            	return (val / 1000) + 'K';
	          	} 
	          	else {
	            	return val;
	         	}
	        }
	    },
	    legend: {
	        labelBoxBorderColor: 'transparent',
	    }
	};
	  	
	function setPlotTrendsChartData(){
	    console.log('setPlotTrendsChartData');

	    var plotTrendsChartData = [];

	    $scope.meds.forEach(function(med){
	    	console.log('setPlotTrendsChartData - checking: '+med.name);

	    	if (med.selected){	
				console.log('setPlotTrendsChartData - '+med.name+' selected...');

				var medObj = {
	    			'data': [
			        	[1, randomIntFromInterval(30,100)],
			        	[2, randomIntFromInterval(90,100)],
			        	[3, randomIntFromInterval(30,100)],
			        	[4, randomIntFromInterval(40,100)],
			        	[5, randomIntFromInterval(60,100)],
			        	[6, randomIntFromInterval(30,100)],
			        	[7, randomIntFromInterval(30,100)],
			        	[8, randomIntFromInterval(0,100)],
			        	[9, randomIntFromInterval(20,100)],
			        	[10, randomIntFromInterval(20,100)]
			      	],
	    			'label': med.name,
	    		};

	    		plotTrendsChartData.push(medObj);
	    	}

	    });

	    $scope.trendsData = plotTrendsChartData;
	}

	$scope.refreshTrendsAction = function() {
	    $scope.loadingTrendsChartData = true;
	    $timeout(function() {
	      	setPlotTrendsChartData();

	        $scope.loadingTrendsChartData = false;
	   	}, 2000);
	};

	$scope.percentages = [53, 65, 23, 99];
	$scope.randomizePie = function() {
	    $scope.percentages = _.shuffle($scope.percentages);
	};

	$scope.plotRevenueData = [{
	    data: [
	        [1, 1100],
	        [2, 1400],
	        [3, 1200],
		    [4, 800],
		    [5, 600],
		    [6, 800],
		    [7, 700],
		    [8, 900],
		    [9, 700],
		    [10, 300]
	    ],
	    label: 'Revenues'
	}];

	$scope.plotRevenueOptions = {
	    series: {
		    //lines: {
		    //	show: true,
		    //	lineWidth: 1.5,
		    //  fill: 0.1
			//},
		   	bars: {
		        show: true,
		        fill: 1,
		        lineWidth: 0,
		        barWidth: 0.6,
		        align: 'center'
		    },
		    points: {
		        show: false
		    },
		    shadowSize: 0
		},
	   	grid: {
	        labelMargin: 10,
	        hoverable: true,
	        clickable: true,
	        borderWidth: 0
	    },
	    tooltip: true,
	    tooltipOpts: {
	        defaultTheme: false,
	        content: 'Revenue: %y'
	    },
	    colors: ['#b3bcc7'],
	    xaxis: {
	        tickColor: 'transparent',
	        //min: -0.5,
	        //max: 2.7,
	        tickDecimals: 0,
	        autoscaleMargin: 0,
	        font: {
	          	color: 'rgba(0,0,0,0.4)',
	          	size: 11
	        }
	    },
	    yaxis: {
	        ticks: 4,
	        tickDecimals: 0,
	        tickColor: 'rgba(0,0,0,0.04)',
	        font: {
	          	color: 'rgba(0,0,0,0.4)',
	          	size: 11
	        },
	        tickFormatter: function(val) {
	          	if (val > 999) {
	            	return '$' + (val / 1000) + 'K';
	          	} 
	          	else {
	            	return '$' + val;
	          	}
	        }
	    },
	    legend: {
	        labelBoxBorderColor: 'transparent'
	    }
	};

	//----
	$scope.drp_start = moment().subtract(1, 'days').format('MMMM D, YYYY');
	$scope.drp_end   = moment().add(31, 'days').format('MMMM D, YYYY');
	$scope.drp_options = {
	    ranges: {
	    	'Today': 		[moment(), moment()],
	        'Yesterday': 	[moment().subtract(1, 'days'), moment().subtract(1, 'days')],
	        'Last 7 Days': 	[moment().subtract(6, 'days'), moment()],
	        'Last 30 Days': [moment().subtract(29, 'days'), moment()],
	        'This Month': 	[moment().startOf('month'), moment().endOf('month')],
	        'Last Month': 	[moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
	   	},
	   	opens: 'left',
	   	startDate: moment().subtract(29, 'days'),
	   	endDate: moment()
	};

	$scope.selectDoseTrends = function(dose){
	   	$scope.selected_dose_trends = dose;
	    //do the change....
	};

	    
	//---adherence period
	$scope.selectDoseMeds = function(dose){
	   	$scope.selected_dose_meds = dose;
	    //do the change....
	};

	$scope.refreshMedsAction = function() {
	   	$scope.loadingMedsChartData = true;
	   	$timeout(function() {
	      	$scope.loadingMedsChartData = false;
	  	}, 2000);
	};

	$scope.periods = [
	   	'Today',
	    'Yesterday',
	    'Last 7 days',
	    'Last month',
	    'Last year',
	    'All time'
	];

	$scope.selected_period = 'Today';

	$scope.selectPeriod = function(period){
	    $scope.selected_period = period;
	    //do the change....
	};

	function setMultiBarChartData(){
	   	console.log('setMultiBarChartData');

	    var multiBarChartData = [];
	    var pieChartData = [];

	    $scope.meds.forEach(function(med){
	    	if (med.selected){
	    		var adherence = randomIntFromInterval(30,100);

	    		var medObj = {
	    			'key': med.name,
	    			'values': [
	    				[1025409600000, adherence]
	    			]
	    		};

	    		multiBarChartData.push(medObj);

	    		var pieMedObj = {
	    			'key': med.name,
	    			'y':   adherence
	    		}

	    		pieChartData.push(pieMedObj);
	    	}
	    });

	    $scope.multiBarChartData = multiBarChartData;
	    $scope.pieChartData = pieChartData;
	}

	function randomIntFromInterval(min,max){
    	return Math.floor(Math.random()*(max-min+1)+min);
	}

	$scope.xAxisTickFormatFunction = function() {
      	return function(d) {
        	return d3.time.format('%x')(new Date(d));
      	};
    };

    $scope.yAxisTickFormatFunction = function() {
      	return function(d) {
        	return d3.format('d')(d);
      	};
    };

    $scope.toolTipContentFunction = function(){
		return function(key, x, y, e, graph) {
    		return  '<center><h4>' + key.toUpperCase() + '</h4></center>' +
            		'<p>Adherence: ' +  y + '% </p>'
		}
	}

	$scope.toolTipContentPieFunction = function(){
		return function(key, x, y, e, graph) {
		   	return  '<center><h4>' + key.toUpperCase() + '</h4></center>' +
           			'<p>Adherence: ' +  y + '% </p>'
		}
	}

	$scope.xPieFunction = function() {
      	return function(d) {
      		var myScale = d3.scale.ordinal().domain(['Ongoing', 'completed']).range([0,1]);

        	//return d.key;
        	return myScale(d.key);
      	};
    };

    $scope.yPieFunction = function() {
      	return function(d) {
        	return d.y;
      	};
    };


	//--profile----
	$scope.postPatientData = function(key, value){

		var pillsy = stateService.getPillsy();

	  	if (pillsy){
	      	var group     = pillsy.active_group;
	      	var patient   = pillsy.active_patient;
	      	var groupId   = null;
	      	var patientId = null;

	      	if (group){
	      		groupId = group.id;
	      	}
	      			
	      	if (patient){
	      		patientId = patient.id;
	      	}

	      	if (patientId && groupId){

				var api = '/v1/a/organization/group/'+ groupId +'/patient/'+ patientId +'/data';
				var patientData = {};
				patientData[key] = value;

				apiService.put(api, patientData).then(function(result){
		            $scope.progress = false;

		            if (result){
		                if (result.msg == 'success'){
		                  	console.log('apiService.get - successfully updated patient\'s '+key);

		                  	var user = result.data;
		                  	pillsy = stateService.getPillsy();
		                  	if (pillsy){
		                  		var patient = pillsy.active_patient;

		                  		if (patient){
		                  			if (patient.id == user.id){

		                  				for (var property in user) {
										    if (user.hasOwnProperty(property)) {
										        patient[property] = user[property];
										    }
										}

										var nameArr = patient.name.split(', ');

								        if (nameArr.length > 0){
								            patient.lastname = nameArr[0];

								            if (nameArr.length == 2){
								                patient.firstname = nameArr[1];
								            }
								        }
                  				
		                  				stateService.setActivePatient(patient);
		                  				pillsy         = stateService.getPillsy();
		                  				$scope.patient = pillsy.active_patient;
		                  			}
		                  		}
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
	}

})
.filter('fromNow', function() {
    return function(dateString) {
      	return moment(dateString).fromNow()
    };
});

