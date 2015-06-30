/**
 * @param $scope
 * @param localDb
 * @constructor
 */
SettingsCnt = function($scope, localDb) {
  this.localDb_ = localDb;
  this.storageListener_ = this.onStorageUpdate_.bind(this);

  $scope.words = {};
  $scope.words.list = [];
  $scope.words.filter = {};
  $scope.langs = {};
  $scope.langs.used = [];
  $scope.langs.list = Lang.list;
  $scope.langs.toName = function(id) { return Lang.byId[id].name; };
  $scope.langs.selected = '';
  $scope.statusToName = WordStatus.friendlyName;

  this.scope_ = $scope;
  $scope.$on('$destroy', this.destroy_.bind(this));
  $scope.$watch('langs.selected', function (newCode) {
    if (newCode) {
      this.scope_.words.filter.lang = newCode;
    } else {
      delete this.scope_.words.filter.lang;
    }
  }.bind(this));
  this.attachLocalStorageListener_();

  this.loadWords_();
};

angular.module('mylingva-options', [])
    .value('localDb', new LocalDb())
    .controller('SettingsCnt', SettingsCnt);

SettingsCnt.prototype.attachLocalStorageListener_ = function() {
  window.addEventListener('storage', this.storageListener_);
};

SettingsCnt.prototype.detachLocalStorageListener_ = function() {
  window.removeEventListener('storage', this.storageListener_);
};

SettingsCnt.prototype.destroy_ = function() {
  this.detachLocalStorageListener_();
};

SettingsCnt.prototype.onStorageUpdate_ = function() {
  this.scope_.$apply(this.loadWords_.bind(this));
};

SettingsCnt.prototype.loadWords_ = function() {
  var usedLangIds = {};
  this.scope_.words.list = this.localDb_.listWords();
  for (var word of this.scope_.words.list) {
    usedLangIds[word.lang] = true;
  }
  this.scope_.langs.used = this.scope_.langs.list.filter(function(lang) {
    return this.hasOwnProperty(lang.id);
  }, usedLangIds);
};