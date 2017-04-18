'use strict';

var ParalignApp = angular.module('ParalignApp', [
  'ionic',

  'ionMdInput',

  'ionic.service.core',
  'ionic.service.push',
  'ionic.contrib.ui.tinderCards',

  'ngCordova',
  'ngCordovaOauth',
  'ngSails',
  'ngResource',
  'ngIOS9UIWebViewPatch',
  'ng-cordova-InAppBrowser-patch',
  'oauth.utils',
  'luegg.directives',
  'analytics.mixpanel',
  'monospaced.elastic',
  'ui.router',
  'angular-svg-round-progressbar',
  'angular-cache',
  'rzModule',
  'duScroll',

  'paralign.controllers',
  'paralign.services',
  'paralign.factories',
  'paralign.filters',
  'paralign.directives'
]);




var ParalignAppControllers = angular.module('paralign.controllers', []);
var ParalignAppDirectives  = angular.module('paralign.directives',  []);
var ParalignAppFilters     = angular.module('paralign.filters',     []);
var ParalignAppServices    = angular.module('paralign.services',    []);
var ParalignAppFactories   = angular.module('paralign.factories',   []);
var ParalignAppResources   = ParalignAppFactories; // this is factories too





ParalignApp.constant('APP_ENV',             ENV);
ParalignApp.constant('ServerUrl',           ENV_SERVER_URL);
ParalignApp.constant('IONIC_APP_ID',        'f9d6dd95');
ParalignApp.constant('IONIC_API_KEY',       '7884bfce1a95251f34a9b534d714ca368a8c73826c72d642');
ParalignApp.constant('GOOGLE_ID',           '252713347101');
ParalignApp.constant('GOOGLE_AUTH_ID',      '252713347101-t6e6bekn8v2b9i1941rcno4bn0d8n49s.apps.googleusercontent.com');
ParalignApp.constant('GOOGLE_ANALYTICS_ID', 'UA-43246247-2');
ParalignApp.constant('MIXPANEL_APP_TOKEN',  '3d29a04128ef0de1d329e3819ab8182b');

ParalignApp.constant('$ionicLoadingConfig', {
  noBackdrop: true,
  animation : 'fade-in',
  template  : '<ion-spinner ng-class="{ \'full-spinner\' : $state.is(\'login\') }" icon="ripple"></ion-spinner>'
});



function isDevice(){
  return /device/.test(ENV)
}

function isProduction(){
  return /prod/.test(ENV)
}





ParalignApp
  .run(['$cordovaDevice', '$rootScope', '$http', '$ionicPlatform', '$state', '$stateParams', '$timeout', 'ChatService', 'SessionService', '$ionicPopup', '$ionicLoading', '$ionicHistory', 'AuthService', 'MixpanelService', 'NotificationService', 'SocketService', 'GoogleAnalytics', 'StoreService', '$cordovaSplashscreen', '$serverConsole', 'User', 'SettingsService', 'ServerUrl', 'ThoughtService', 'APP_ENV', runMethod]);


function runMethod($cordovaDevice, $rootScope, $http, $ionicPlatform, $state, $stateParams, $timeout, ChatService, SessionService, $ionicPopup, $ionicLoading, $ionicHistory, AuthService, MixpanelService, NotificationService, SocketService, GoogleAnalytics, StoreService, $cordovaSplashscreen, $serverConsole, User, SettingsService, ServerUrl, ThoughtService, APP_ENV) {
  if (!APP_ENV) {
    console.error('Could not get the environment. The app will not be launched');
    return undefined;
  }
  
  if (!ServerUrl) {
    console.error('Could not get the server URL. The app will not be launched');
    return undefined;
  }
  
  $rootScope.ENV              = APP_ENV;
  $rootScope.GAnalyticsOn     = isDevice();
  $rootScope.purchasesOn      = isDevice();
  $rootScope.notificationsOn  = isDevice();
  $rootScope.mixpanelTrackOn  = isDevice();
  $rootScope.splashscreenOn   = isDevice();
  $rootScope.plgnAppVersionOn = isDevice();
  $rootScope.settingsTimeOn   = isDevice();
  $rootScope.deviceInfoOn     = isDevice();
  $rootScope.serverSettingsOn = true;
  $rootScope.serverLoggingOn  = true;


  ionic.$ionicPopup        = $ionicPopup;
  ionic.$http              = $http;
  ionic.SocketService      = SocketService;
  $rootScope.$state        = $state;
  $rootScope.$backState    = undefined;
  $rootScope.$ionicHistory = $ionicHistory;

  $rootScope.appVersion      = '';
  $rootScope.appBuild        = '';
  $rootScope.loadingApp      = undefined;
  $rootScope.popup           = undefined;
  $rootScope.user            = undefined;
  $rootScope.isAuthenticated = isAuthenticated;
  $rootScope.deviceOSVersion = undefined;
  $rootScope.AppSettings     = undefined;

  $rootScope.isAndroid             = $ionicPlatform.is('android');
  $rootScope.isIOS                 = $ionicPlatform.is('ios');
  $rootScope.isAdmin               = SessionService.isAdmin;
  $rootScope.isSettingsAllow       = SettingsService.isSettingsAllow;
  $rootScope.isTestServer          = isTestServer();
  $rootScope.isDevice              = isDevice();
  $rootScope.isProduction          = isProduction();
  $rootScope.isUserDetailsWasSaved = false;
  $rootScope.isSocketConnected     = false;
  $rootScope.platform              = $rootScope.isAndroid ? 'android' : $rootScope.isIOS ? 'ios' : '';

  var loadingTimer = undefined;
  var loadingTimer_MAX_MS = 15 * 1000;
  $rootScope.loadingOn              = loadingOn;
  $rootScope.loadingOff             = loadingOff;
  $rootScope.setLoggedUserDetails   = setLoggedUserDetails;
  $rootScope.getLoggedUser          = SessionService.getLoggedUser;
  $rootScope.refreshUser            = SessionService.refreshUser;
  $rootScope.logout                 = logout;



  var self = {};
  var notificationReceiveWatcher = undefined;

  self.init  = init;
  self.ready = ready;
  self.setHandlerNotification     = setHandlerNotification;
  self.notificationReceiveHandler = notificationReceiveHandler;


  self.init();
  return this;









  function init (){
    log('ENV: ' + ENV);
    if ($rootScope.serverSettingsOn) log('Server settings: ON');
    if ($rootScope.serverLoggingOn)  log('Server logs: ON');


    $rootScope.getLoggedUser(function(user){
      $rootScope.user = user;
      if (user && user.id) $rootScope.setLoggedUserDetails(user);
      return undefined;
    });

    self.setHandlerNotification();
    $ionicPlatform.ready(angular.bind(this, self.ready));
  }






  function ready() {
    if (window.StatusBar) {
      StatusBar.styleDefault();
      if ($rootScope.isAndroid) StatusBar.backgroundColorByHexString("#000000");
    }
    if ($rootScope.splashscreenOn && $cordovaSplashscreen && $cordovaSplashscreen.hasOwnProperty('hide')) {
      $timeout(function(){ $cordovaSplashscreen.hide();}, 1000);
    }

    if ($rootScope.notificationsOn) NotificationService.init();
    if ($rootScope.purchasesOn) StoreService.init();
    if ($rootScope.GAnalyticsOn) GoogleAnalytics.init();
    SettingsService.refreshAppSettings();

    if (window.cordova && window.cordova.plugins.Keyboard) window.cordova.plugins.Keyboard.disableScroll(true);
    if ($rootScope.deviceInfoOn && window.device) $rootScope.deviceOSVersion = window.device.version;
    if ($rootScope.deviceInfoOn && $cordovaDevice) $rootScope.deviceInfo = $cordovaDevice.getDevice();

    if (window.Connection && navigator.connection.type == Connection.NONE) {
      fn_alert('No Internet',
        'There is no internet or data active on your device. This app ' +
        'requires working internet or data connection',
        null,
        function () { ionic.Platform.exitApp(); }
      );
    }

    if ($rootScope.plgnAppVersionOn && window.cordova && window.cordova.getAppVersion) {
      cordova.getAppVersion.getVersionNumber().then(function (version) {
        $rootScope.appVersion = version;
      });
      cordova.getAppVersion.getVersionCode().then(function (versionCode) {
        $rootScope.appBuild = $rootScope.isAndroid ? (versionCode + '').replace(/.$/, '') : versionCode;
      });
    } else if ($rootScope.plgnAppVersionOn) {
      console.error('AppVersion plugin is not defined');
    }
  }





  function isAuthenticated(){
    return $rootScope.user && $rootScope.user.id;
  }





  // TODO: move it to a service
  function loadingOn(info, isDisabledTimeout, customTimeMS) {
    if (!$rootScope.loadingApp) {
      $rootScope.loadingApp = true;
      $ionicLoading.show();

      if (isDisabledTimeout) return undefined;

      loadingTimer = $timeout(function(){
        $serverConsole.error('Loading is too long. Page: ' +
          $state.current['name'] + '|' + JSON.stringify($stateParams),
          info || ''
        );
        $state.go('home');
        return $rootScope.loadingOff();
      }, customTimeMS || loadingTimer_MAX_MS);
    }
  }



  function loadingOff(){
    if ($rootScope.loadingApp) {
      $ionicLoading.hide();
      $rootScope.loadingApp = false;
      if (loadingTimer) {
        $timeout.cancel(loadingTimer);
        loadingTimer = undefined;
      }
    }
  }





  function isTestServer(){
    return /1338$/.test(ServerUrl) || /81$/.test(ServerUrl);
  }







  function logout(cb){
    $rootScope.loadingOn();
    var isCallback = typeof(cb) === 'function';

    if (!$rootScope.user) {
      console.error('logout. User is undefined');
      if (isCallback) return cb();
      return undefined;
    }

    var userId         = $rootScope.user.id;
    var login_provider = $rootScope.user.login_provider;
    var isAnonymous    = $rootScope.user['anonymous'];
    $rootScope.user    = null;
    AuthService.logout(userId, login_provider, isAnonymous);
    $rootScope.isUserDetailsWasSaved = false;

    $timeout(function(){
      $rootScope.loadingOff();
      $state.go('login', {mode: 'force'});
    }, 1500);
  }





  function setLoggedUserDetails(user){
    if ($rootScope.isUserDetailsWasSaved) return undefined;
    ChatService.clearCache();
    ThoughtService.clearCache('Thoughts');
    ThoughtService.clearCache('Clusters');
    ThoughtService.cacheThought('');

    $rootScope.isUserDetailsWasSaved = true;

    $serverConsole.log('User login. Login provider: ' + user.login_provider + '. Device: ' + $rootScope.platform + '. OS: ' + $rootScope.deviceOSVersion);
    log('Logged User', user);

    if (!user || !user.id) return console.error('setLoggedUserDetails. User is not defined');
    SocketService.user_subscribeSelf();
    SocketService.refreshConnection();
    ChatService.get_userChats(user, function(err, chats, chatsIDs){
      ChatService.chatConnect(chatsIDs);
      ChatService.chatCache(chats);
    });

    User.refreshSimilarMinds(user.id);
    MixpanelService.setPeople(user, function(error){
      if (error) return $rootScope.alertError(1, 'Alert', 'Could not set User in the mixpanel. Please reboot the app.');
      return undefined;
    });
    SettingsService.refreshAppSettings(function(){
      SettingsService.saveAppDetailsToUser();
      SettingsService.saveTimeDetailsToUser();
    });
    NotificationService.register(user);
    return undefined;
  }








  function setHandlerNotification(){
    if (notificationReceiveWatcher && typeof(notificationReceiveWatcher) == 'function') notificationReceiveWatcher();
    notificationReceiveWatcher = $rootScope.$on('NotificationService:notification', self.notificationReceiveHandler);
  }



  function notificationReceiveHandler (event, notification){
    if (!notification) return undefined;

    var data     = notification.additionalData;
    var payload  = data.payload;
    var redirect = payload && typeof(payload['redirect']) === 'string' ? payload['redirect'].toLowerCase() : null;

    if (!data.foreground) {
      switch (redirect) {
        case 'newthought':
          fn_redirect('newThought');
          fn_track('notifnewthought');
          break;
        case 'similarminds':
          if ($rootScope.user && $rootScope.user.id) {
            $rootScope.loadingOn();
            new User.refreshSimilarMinds($rootScope.user.id, function(){
              fn_redirect('similarMinds');
            });
          }
          fn_track('notifnewsimilar');
          break;
        case 'notalone':
          fn_redirect('myMinds', {thought: payload.thought});
          fn_track('notifnotalone');
          break;
        case 'myminds':
          fn_redirect('myMinds');
          break;
        case 'mythought':
          fn_redirect('myMinds', {thought: payload.thought});
          break;
        case 'clusters':
          fn_redirect('myMinds');
          fn_track('notifnewclusters');
          break;
        case 'guide.icediving':
          fn_redirect('icedivingintro');
          break;
        case 'guide.calmlake':
          fn_redirect('lakeintro');
          break;
        case 'guide.sunshinehill':
          fn_redirect('sunshineintro');
          break;
        case 'connections':
          payload.chat ? fn_redirect('chat', {id: payload.chat}) : fn_redirect('connections');
          fn_track('notifnewconnection');
          break;
      }
    }

    function fn_redirect(state, params){
      $rootScope.loadingOn(['NotificationService:notification:' + JSON.stringify(notification)]);
      $timeout(function(){
        $rootScope.loadingOff();
        $state.go(state, params || {});
      }, 300);
    }


    function fn_track(event){
      if (!notification.foreground) $rootScope.trackEvent(event);   // the app is closed
      //else $rootScope.alert(notification.title || 'Notification', notification.message);  // is app opened
    }
  }
}


