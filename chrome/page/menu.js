/**
 * UI Rendered within a target page.
 */

var ELEMENT_ID = 'mylingva-menu';

MenuCnt = function($scope) {
  $scope.stats = {};
  $scope.formatStatus = function(status) {
    return WordStatus.friendlyName(parseInt(status));
  };

  $scope.$on('update-stats', function(event, stats) {
    $scope.stats = {};
    for (var record of stats) {
      $scope.stats[record[0]] = record[1];
    }
  });
  console.log('MenuCnt created.');
};

angular.module('mylingva-menu', [])
    .controller('MenuCnt', MenuCnt);

PageMenuModule = function(extId) {
  this.extId = extId;
};

PageMenuModule.prototype.getResourceUrl = function(name) {
  return 'chrome-extension://' + this.extId + '/' + name;
};

PageMenuModule.prototype.updateWordStats = function(stats) {
  console.info('Updating word statistics: ', stats);
  this.rootScope_.$apply(this.rootScope_.$broadcast.bind(
      this.rootScope_, 'update-stats', stats));
};

PageMenuModule.prototype.buildUi = function() {
  var element = document.getElementById(ELEMENT_ID);
  if (element) {
    element.parentElement.removeChild(element);
  }
  element = document.createElement('div');
  element.setAttribute('id', ELEMENT_ID);
  element.setAttribute('ng-scp', '');
  element.setAttribute('ng-controller', 'MenuCnt');
  element.setAttribute('ng-app', 'mylingva-menu');
  element.classList.add('mylingva-menu');
  element.innerHTML = '<div ng-include="\'' + this.getResourceUrl('page/menu.html') + '\'"></div>';
  document.documentElement.appendChild(element);
  var injector = angular.bootstrap(
      document.getElementById(ELEMENT_ID), ['mylingva-menu'], {
    debugInfoEnabled: true
  });
  this.rootScope_ = injector.get('$rootScope');
};
