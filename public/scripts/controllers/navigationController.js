/** Pillsy
*  @author  Chuks Onwuneme
*  @version 1.0
*  @package NavigationController AngularJS module  
*/
   
var app = angular.module('NavigationController', []);  //instantiates NavigationController module
app.controller('navigationController', function ($scope, $filter, $location, $timeout, $route, $rootScope, stateService, apiService) {
    'use strict';

    var user = stateService.getUser();

    $scope.menu = [
      	{
            id:           'groups_header',
            label:        'GROUPS',
            iconClasses:  '',
            separator:    true,
      	}, 
      	{
            id:           'my_groups',
            label:        'My Groups',
            iconClasses:  'fa fa-group',
            separator:    false,
            children:     []
      	},   
      	/*{
            id:           'admin_header',
            label:        'ADMIN', // This section should be made viewable only to admins
            iconClasses:  'fa fa-wrench',
            separator:    true
      	}, 
      	{
            id:           'admin',
            label:        'Admin',
            iconClasses:  'fa fa-wrench',
            separator:    false,
            children: [
                {
                    label:  'Manage Organization',
                      url:  '/admin/manageorganization'
                },
                {
                    label:  'License Info',
                    url:    '/admin/licenseinfo'
                }
            ]
        },*/

      	/*{
        	label: 'Notifications',
        	iconClasses: 'glyphicon glyphicon-globe',
        	html: '<span class="badge badge-danger">5</span>',
        	url: '#/notifications'
      	}*/
    ];

    restoreUserGroups();

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

        if (item.type == 'group'){
            var group = item; 
            var pillsy = stateService.getPillsy();

            if (pillsy){
                if (stateService.setActiveGroup(group)){
                    $rootScope.active_group = group;
                }
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

    highlight($scope.menu[0]);

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

        var children = [];
        groups.forEach(function(group){
            group.label = group.name;
            group.url   = '/group/data';
            group.type  = 'group';
            children.push(group);
        });

        $scope.menu.forEach(function(menuItem){
            if (menuItem.id == 'my_groups'){
                var index = $scope.menu.indexOf(menuItem);
                $scope.menu[index].children = children;
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

