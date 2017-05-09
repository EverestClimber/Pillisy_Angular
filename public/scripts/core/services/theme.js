angular
  .module('theme.core.services')
  .service('$theme', ['$rootScope', 'EnquireService', '$document', function($rootScope, EnquireService, $document) {
    'use strict';
    this.settings = {
      fixedHeader: true,
      headerBarHidden: true,
      leftbarCollapsed: false,
      leftbarShown: false,
      rightbarCollapsed: false,
      fullscreen: false,
      layoutHorizontal: false,
      layoutHorizontalLargeIcons: false,
      layoutBoxed: false,
      showSmallSearchBar: false,
      topNavThemeClass: 'navbar-grape',
      sidebarThemeClass: 'sidebar-default',
      showChatBox: false,
      pageTransitionStyle: 'fadeIn',
      dropdownTransitionStyle: 'flipInX'
    };

    var brandColors = {
      'pillsy':  '#4098D3',
	    'default': '#4098D3',
      'inverse': '#4098D3',
      'primary': '#4098D3',
      'success': '#4098D3',
      'warning': '#4098D3',
      'danger':  '#4098D3',
      'info':    '#4098D3',	  
      'brown':   '#4098D3',
      'indigo':  '#4098D3',
      'orange': '#4098D3',
      'midnightblue': '#4098D3',
      'sky': '#4098D3',
      'magenta': '#4098D3',
      'purple': '#4098D3',
      'green': '#4098D3',
      'grape': '#4098D3',
      'toyo': '#4098D3',
      'alizarin': '#4098D3'
    };

    this.getBrandColor = function(name) {
      if (brandColors[name]) {
        return brandColors[name];
      } else {
        return brandColors['default'];
      }
    };

    $document.ready(function() {
      EnquireService.register('screen and (max-width: 767px)', {
        match: function() {
          $rootScope.$broadcast('themeEvent:maxWidth767', true);
        },
        unmatch: function() {
          $rootScope.$broadcast('themeEvent:maxWidth767', false);
        }
      });
    });

    this.get = function(key) {
      return this.settings[key];
    };
    this.set = function(key, value) {
      this.settings[key] = value;
      $rootScope.$broadcast('themeEvent:changed', {
        key: key,
        value: this.settings[key]
      });
      $rootScope.$broadcast('themeEvent:changed:' + key, this.settings[key]);
    };
    this.values = function() {
      return this.settings;
    };
  }]);