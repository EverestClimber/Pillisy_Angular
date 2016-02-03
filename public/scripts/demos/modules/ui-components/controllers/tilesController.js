angular
  .module('theme.demos.ui_components')
  .controller('TilesController', ['$scope', '$theme', function($scope, $theme) {
    'use strict';
    $scope.$theme = $theme;

    $scope.simpleTiles = [{
      title: 'Group Name',
      text: '1.6K',
      color: 'info'
    }, {
      title: 'Likes',
      text: '345',
      color: 'orange'
    }, {
      title: 'Bugs Fixed',
      text: '21',
      color: 'danger'
    }, {
      title: 'New Members',
      text: '124',
      color: 'midnightblue'
    }, {
      title: 'Gifts',
      text: '16',
      color: 'purple'
    }];

    $scope.largeTiles = [{
      title: '8th Street Oncology',
      titleBarInfo: '86%',
      text: '1616',
      color: 'inverse',
      classes: 'fa fa-users'
    }, {
      title: 'Emergency',
      titleBarInfo: '65%',
      text: '345',
      color: 'inverse',
      classes: 'fa fa-users'
    }, {
      title: 'Truvada Study',
      titleBarInfo: '84%',
      text: '21',
      color: 'inverse',
      classes: 'fa fa-users'
    }, {
      title: 'New Members',
      titleBarInfo: '64%',
      text: '124',
      color: 'inverse',
      classes: 'fa fa-users'
    }, {
      title: 'Cardiac Monitoring Group',
      titleBarInfo: '77%',
      text: '16',
      color: 'inverse',
      classes: 'fa fa-users'
    }, {
      title: 'Primary Care',
      titleBarInfo: '76%',
      text: '757',
      color: 'inverse',
      classes: 'fa fa-users'
    }, {
      title: 'Maternity',
      titleBarInfo: '92%',
      text: '246',
      color: 'inverse',
      classes: 'fa fa-users'
    }, {
      title: 'Senior Care',
      titleBarInfo: '87%',
      text: '679',
      color: 'inverse',
      classes: 'fa fa-users'
    }, {
      title: '13th Street Urgent Care',
      titleBarInfo: '65%',
      text: '32',
      color: 'inverse',
      classes: 'fa fa-users'
    }, {
      title: 'Pine Streen Urgent Care',
      titleBarInfo: '55%',
      text: '321',
      color: 'inverse',
      classes: 'fa fa-users'
    }, {
      title: 'Pilot 2',
      titleBarInfo: '83%',
      text: '170',
      color: 'inverse',
      classes: 'fa fa-users'
    }, {
      title: 'Pilot 1',
      titleBarInfo: '88%',
      text: '87',
      color: 'inverse',
      classes: 'fa fa-users'
    }];
    $scope.shortcutTiles = [{
      text: 'Page Views',
      titleBarInfo: '7',
      color: 'info',
      classes: 'fa fa-eye'
    }, {
      text: 'Likes',
      titleBarInfo: '15',
      color: 'orange',
      classes: 'fa fa-thumbs-o-up'
    }, {
      text: 'Bugs Fixed',
      titleBarInfo: '+10',
      color: 'danger',
      classes: 'fa fa-check-square'
    }, {
      text: 'New Members',
      titleBarInfo: '+25',
      color: 'midnightblue',
      classes: 'fa fa-group'
    }, {
      text: 'Gifts',
      titleBarInfo: '15',
      color: 'purple',
      classes: 'fa fa-gift'
    }, {
      text: 'Profits',
      titleBarInfo: '17',
      color: 'success',
      classes: 'fa fa-money'
    }, {
      text: 'Sales Revenue',
      titleBarInfo: '24',
      color: 'primary',
      classes: 'fa fa-shopping-cart'
    }, {
      text: 'New Orders',
      titleBarInfo: '15',
      color: 'indigo',
      classes: 'fa fa-comments'
    }, {
      text: 'Comments',
      titleBarInfo: '22',
      color: 'green',
      classes: 'fa fa-comments'
    }, {
      text: 'Downloads',
      titleBarInfo: '16',
      color: 'danger',
      classes: 'fa fa-download'
    }, {
      text: 'Tasks',
      titleBarInfo: '26',
      color: 'magenta',
      classes: 'fa fa-tasks'
    }, {
      text: 'Videos',
      titleBarInfo: '4',
      color: 'inverse',
      classes: 'fa fa-video-camera'
    }];
  }]);