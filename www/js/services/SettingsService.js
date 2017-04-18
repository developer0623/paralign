ParalignAppServices
  .service('SettingsService', ['$rootScope', '$serverConsole', 'Settings', 'User', SettingsService]);


function SettingsService($rootScope, $serverConsole, Settings, User) {
  "use strict";
  var self = this;

  this.refreshAppSettings       = refreshAppSettings;
  this.isSettingsAllow          = isSettingsAllow;
  this.saveAppDetailsToUser     = saveAppDetailsToUser;
  this.saveTimeDetailsToUser    = saveTimeDetailsToUser;

  var waitPluginCounter = 0;
  this._waitForAppVersionPlugin = _waitForAppVersionPlugin;



  return this;





  function refreshAppSettings(cb) {
    var isCallback = typeof(cb) === 'function';
    if (!$rootScope.serverSettingsOn) {
      if (isCallback) return cb();
      else return undefined;
    }
    new Settings
      .$query()
      .then(function(settings) {
        var _settings = settings ? settings[0] : undefined;
        $rootScope.AppSettings = _settings;
        if (isCallback) return cb(null, _settings);
        else return undefined;
      })
      .catch(function(err){
        $serverConsole.error('SettingsService :: getAppSettings. Could not get app settings.', err);
        if (isCallback) return cb(err);
        else return undefined;
      });
    return undefined;
  }




  function isSettingsAllow(name, type) {
    if (!$rootScope.serverSettingsOn) return true;
    var settings = $rootScope.AppSettings;
    if (!settings) return true;
    if (!!settings.allowAll) return true;
    if (!name) return false;

    var platformSettings = settings[$rootScope.platform];

    switch (name){
      case 'guides'    : {
        if ($rootScope.user.anonymous){
          return platformSettings.guides_for_anonymous ? platformSettings.guides_for_anonymous.indexOf(type) > -1 : false;
        }
        else {
          return platformSettings.guides ? platformSettings.guides.indexOf(type) > -1 : false;
        }
      }
      case 'isFreeGuide': {
        return platformSettings.guides_not_free ? platformSettings.guides_not_free.indexOf(type) === -1 : false;
      }
      default: return false; break;
    }
  }



  function _waitForAppVersionPlugin(cb){
    function _waitPlugin(){
      if(!window.cordova || !window.cordova.getAppVersion) return setTimeout(function(){
        self._waitForAppVersionPlugin(cb);
      }, 1000);
      else {
        waitPluginCounter = 0;
        return cb();
      }
    }
    if (waitPluginCounter++ < 8) return _waitPlugin();
    else return console.error('SettingsService :: _waitForAppVersionPlugin. AppVersion plugin is not defined.');
  }





  function saveAppDetailsToUser() {
    if (!$rootScope.plgnAppVersionOn) return undefined;
    if (!window.cordova || !window.cordova.getAppVersion) {
      return self._waitForAppVersionPlugin(self.saveAppDetailsToUser);
    }

    cordova.getAppVersion.getVersionNumber().then(function (appVersion) {
      var _user = {};
      _user.id = $rootScope.user ? $rootScope.user.id : undefined;
      _user.currentAppDetails = {};
      _user.currentAppDetails[$rootScope.platform] = {};
      _user.currentAppDetails[$rootScope.platform].version = appVersion;
      _user.currentAppDetails[$rootScope.platform].build   = $rootScope.appBuild;  // hmmm...

      new User
        .$update(_user)
        .then(function(updatedUser){
          if (updatedUser && updatedUser.id) $rootScope.user = updatedUser;
        }, function(err){
          console.error('SettingsService :: saveAppDetailsToUser. Could not update the User.', err);
        });
    });
  }




  function saveTimeDetailsToUser() {
    if (!$rootScope.settingsTimeOn) return undefined;
    var _user = {};
    _user.id = $rootScope.user ? $rootScope.user.id : undefined;
    _user.lastVisitAt    = moment().utc().format();
    _user.timezoneOffset = moment().format('Z');

    new User
      .$update(_user)
      .then(function(updatedUser){
        if (updatedUser && updatedUser.id) $rootScope.user = updatedUser;
      }, function(err){
        console.error('SettingsService :: saveAppDetailsToUser. Could not update the User.', err);
      });
  }
}