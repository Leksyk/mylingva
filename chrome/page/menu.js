/**
 * UI Rendered within a target page.
 */

var ELEMENT_ID = 'mylingva-menu';

MenuCnt = function($scope) {
  console.log('MenuCnt created.');
};

angular.module('mylingva-menu', [])
    .controller('MenuCnt', MenuCnt)
    .run();

PageMenuModule = function(extId) {
  this.extId = extId;
};

PageMenuModule.prototype.getResourceUrl = function(name) {
  return 'chrome-extension://' + this.extId + '/' + name;
};

PageMenuModule.prototype.initialize = function() {
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
  angular.bootstrap(document.getElementById(ELEMENT_ID), ['mylingva-menu'], {
    debugInfoEnabled: true
  });
};
