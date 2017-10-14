/** Pillsy
*  @author  Chuks Onwuneme
*  @version 1.0
*  @package NavigationController AngularJS module  
*/

var app = angular.module('NavigationController', []);  //instantiates NavigationController module
app.controller('navigationController', function ($scope, $filter, $location, $timeout, $route, $rootScope, stateService, apiService) {
    'use strict';

    buildNavigationMenu();

    function buildNavigationMenu(){

        var user = stateService.getUser();

        if (user){
            if (user.role == 'org_user'){
                  $scope.menu = [{
                      id:           'groups',
                      label:        'Groups',
                      iconClasses:  'fa fa-group',
                      separator:    false,
                      children:     [],
                      url:          '/groups/data',
                  }];
            }
            else{
                $scope.menu = [
                    {
                        id:           'patients',
                        label:        'All Patients',
                        iconClasses:  'fa fa-user',
                        separator:    false,
                        url:          '/patients/data'
                    },
                    {
                        id:           'groups',
                        label:        'Groups',
                        iconClasses:  'fa fa-group',
                        separator:    false,
                        children:     [],
                        url:          '/groups/data',
                    },
                    {
                        id:           'team',
                        label:        'Team members',
                        iconClasses:  'fa fa-user',
                        separator:    false,
                        url:          '/team/data'
                    }
                ];
            }

            if (user.role == 'super_user'){
              
                var admin = {
                    id:           'admin',
                    label:        'Admin',
                    iconClasses:  'fa fa-wrench',
                    separator:    false,
                    children: [
                        {
                            label:  'Manage Organizations',
                            url:    '/admin/manageorganizations'
                        },
                    ]
                };

                $scope.menu.push(admin);
            }
        }
        else{
            $scope.menu = [
                {
                    id:           'groups',
                    label:        'Groups',
                    iconClasses:  'fa fa-group',
                    separator:    false,
                    children:     [],
                    url:          '/groups/data',
                }
            ];
        }
  	}

    $rootScope.$on("login_status_change", function(event, data){
        if ( data.isLoggedIn ){
            buildNavigationMenu();
        }
        else{
          	$scope.menu = $scope.menu.filter(function( obj ) {
              	return obj.id !== 'admin';
          	});
        }
    });

    var setParent = function(children, parent) {
      	angular.forEach(children, function(child) {
            child.parent = parent;
            if (child.children !== undefined) {
          		  setParent(child.children, child);
            }
      	});
    };

    $scope.findItemByUrl = function(children, url) {
      	for (var i = 0, length = children.length; i < length; i++) {
        	if (children[i].url && children[i].url.replace('#', '') === url) {
          		return children[i];
        	}
        	if (children[i].children !== undefined) {
          		var item = $scope.findItemByUrl(children[i].children, url);
          		if (item) {
            		return item;
          		}
        	}
      	}
    };

    setParent($scope.menu, null);

    $scope.openItems = []; 
    $scope.selectedItems = []; 
    $scope.selectedFromNavMenu = false;

    $scope.select = function(item) {

        if (item.id == 'patients'){
            
        }

        if (item.id == 'groups'){
            if (item.children.length == 0){
                
            }
            else{
                
            }
        }

        if (item.id == 'admin'){
            
        }

        if (item.type == 'group'){
            var pillsy = stateService.getPillsy();

            if (pillsy){

                var group = {
                    "id":                  item.id,
                    "group_type":          item.group_type,
                    "name":                item.name,
                    "description":         item.description,
                    "identifier":          item.identifier,
                    "avg":                 item.avg,
                    "adherence_interval":  item.adherence_interval,
                    "patients":            item.patients,
                    "members":             item.members,
                    "label":               item.label,
                    "isAdmin":             item.isAdmin,
                    "url":                 item.url,
                    "type":                item.type
                };
 
                stateService.setActiveGroup(group);
            }
        }

      	// close open nodes
      	if (item.open) {
            item.open = false;
            return;
      	}
      	
      	for (var i = $scope.openItems.length - 1; i >= 0; i--) {
        	$scope.openItems[i].open = false;
      	}
      	
      	$scope.openItems = [];
      	var parentRef = item;
      	
      	while ( parentRef ){
        	parentRef.open = true;
        	$scope.openItems.push(parentRef);
        	parentRef = parentRef.parent;
      	}

      	// handle leaf nodes
      	if (!item.children || (item.children && item.children.length < 1)) {
        	$scope.selectedFromNavMenu = true;
        	
        	for (var j = $scope.selectedItems.length - 1; j >= 0; j--) {
          		$scope.selectedItems[j].selected = false;
        	}

        	$scope.selectedItems = [];
        	parentRef = item;
        	
        	while ( parentRef ){
          		parentRef.selected = true;
          		$scope.selectedItems.push(parentRef);
          		parentRef = parentRef.parent;
        	}
      	}

        if (item.type == 'group'){
            $route.reload();
        }
    };

    $scope.highlightedItems = [];
    var highlight = function(item) {
      	var parentRef = item;
      	while (parentRef !== null) {
        	if (parentRef.selected) {
          		parentRef = null;
          		continue;
        	}
        	parentRef.selected = true;
        	$scope.highlightedItems.push(parentRef);
        	parentRef = parentRef.parent;
      	}
    };

    var highlightItems = function(children, query) {
      	angular.forEach(children, function(child) {
        	if (child.label.toLowerCase().indexOf(query) > -1) {
          		highlight(child);
        	}
        	if (child.children !== undefined) {
          		highlightItems(child.children, query);
        	}
      	});
    };

    //highlight($scope.menu[0]);

    // $scope.searchQuery = '';
    $scope.$watch('searchQuery', function(newVal, oldVal) {
      	var currentPath = '#' + $location.path();
      	if (newVal === '') {
        	for (var i = $scope.highlightedItems.length - 1; i >= 0; i--) {
          		if ($scope.selectedItems.indexOf($scope.highlightedItems[i]) < 0) {
            		if ($scope.highlightedItems[i] && $scope.highlightedItems[i] !== currentPath) {
              			$scope.highlightedItems[i].selected = false;
            		}
          		}
        	}

        	$scope.highlightedItems = [];
      	} 
      	else{
      		if (newVal !== oldVal) {
        		for (var j = $scope.highlightedItems.length - 1; j >= 0; j--) {
          			if ($scope.selectedItems.indexOf($scope.highlightedItems[j]) < 0) {
            			$scope.highlightedItems[j].selected = false;
          			}
        		}
        		$scope.highlightedItems = [];
        		highlightItems($scope.menu, newVal.toLowerCase());
      		}
      	}
    });

    $scope.$on('$routeChangeSuccess', function() {
      	if ($scope.selectedFromNavMenu === false) {
        	var item = $scope.findItemByUrl($scope.menu, $location.path());
        	if (item) {
          		$timeout(function() {
            		  $scope.select(item);
          		});
        	}
      	}
      	$scope.selectedFromNavMenu = false;
      	$scope.searchQuery = '';
    });

    var unbind = $rootScope.$on('my_groups_callback', function(e, data){
        console.log('received my_groups_callback event');

        updateMyGroupsMenu(data.groups);
    });

    $scope.$on('$destroy', unbind);

    function updateMyGroupsMenu(groups){
        console.log('groupsController - updateMyGroupsMenu');

        groups = groups.filter(function(group){
            return group.group_type != 'master';
        });

        $scope.menu.forEach(function(menuItem){
            if (menuItem.id == 'groups'){
                var index = $scope.menu.indexOf(menuItem);
                $scope.menu[index].children = groups;
            }
        });
    }

    function restoreUserGroups(){
        var pillsy = stateService.getPillsy();
        if (pillsy){
            var groups = pillsy.user_groups;

            if (groups){
                if (groups.length > 0){ 
                    updateMyGroupsMenu(groups);
                }
            }
        }
    }
});