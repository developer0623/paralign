ParalignAppServices.service('NotificationService', ['$rootScope', '$state', '$timeout', 'User', '$serverConsole', '$localStorage', 'GOOGLE_ID', '$cordovaDevice', NotificationService]);


function NotificationService ($rootScope, $state, $timeout, User, $serverConsole, $localStorage, GOOGLE_ID, $cordovaDevice) {
  "use strict";
  var self = this;
  var Push = undefined;
  var pluginInitialized = false;

  if (!window.Ionic) console.error('NotificationService. Ionic platform web client was not loaded');



  this.init               = init;
  this.register           = register;
  this.unregister         = unregister;
  this.saveDeviceToken    = saveDeviceToken;
  this._waitForPushPlugin = _waitForPushPlugin;
  this.getDeviceUUID      = getDeviceUUID;


  $rootScope.$on('NotificationService:tokenReceived', tokenReceivedHandler);

  $rootScope.$on('NotificationService:notification', pushNotificationHandler);

  $rootScope.$on('NotificationService:error', function(event, data) {
    return error('NotificationService :: $on NotificationService:error.', data);
  });


  return this;







  function init(cb){
    var isCallback = typeof(cb) === 'function';
    if (!$rootScope.notificationsOn) return undefined;
    if (pluginInitialized) return undefined;

    if (!window.PushNotification) {
      return self._waitForPushPlugin(function(){
        return self.init(cb);
      });
    }

    Push = PushNotification.init({
      android: {
        senderID : GOOGLE_ID,
        iconColor: '#FF6A6A',
        icon     : 'icon_push',
        sound    : true,
        vibrate  : true,
        forceShow: true /* show notifications when the app is opened */
      },
      ios: {
        alert: true,
        badge: false,
        sound: true
      }
    });

    Push.on('registration', function(data) {
      $rootScope.$broadcast('NotificationService:tokenReceived', data.registrationId);
    });

    Push.on('notification', function(data) {
      $rootScope.$broadcast('NotificationService:notification', data);
      if (Push.finish) return Push.finish(function() {});
    });

    Push.on('error', function(err) {
      $rootScope.$broadcast('NotificationService:error', err);
    });

    pluginInitialized = true;
    if (isCallback) return cb();
    else return undefined;
  }




  var waitPluginCounter = 0;
  function _waitForPushPlugin(cb) {
    function _waitPlugin() {
      if (!window.PushNotification) return setTimeout(function () {
        _waitForPushPlugin(cb);
      }, 250);
      else {
        waitPluginCounter = 0;
        return cb();
      }
    }

    waitPluginCounter++;
    if (waitPluginCounter < 5) return _waitPlugin();
    else if (waitPluginCounter === 5) return $serverConsole.error('NotificationService :: _waitForPushPlugin. Push plugin is not defined. Platform: ' + $rootScope.platform);
  }






  function register(user, cb){
    if (!$rootScope.notificationsOn) return undefined;
    var isCallback = typeof(cb) === 'function';
    if (!pluginInitialized) {
      return self.init(function(){
        self.register(user, cb);
      });
    }
    if (!user || !user.id) {
      console.error('NotificationService :: register. User is not defined');
      if (isCallback) return cb('User is not defined');
      else return undefined;
    }

    var device_token = $localStorage.get('device_token');
    if (device_token) self.saveDeviceToken(device_token);
    if (isCallback) return cb(null, user);
  }








  function getDeviceUUID(){
    if(!$cordovaDevice) return undefined;
    return $cordovaDevice.getDevice().uuid;
  }








  function saveDeviceToken(token){
    if (!token) return console.error('NotificationService :: saveDeviceToken. Token is not defined.');
    $localStorage.set('device_token', token);

    var uuid   = self.getDeviceUUID();
    var userId = $rootScope.user && $rootScope.user.id ? $rootScope.user.id : undefined;

    if (!userId) return undefined;
    if (!$rootScope.platform) return console.error('NotificationService :: saveDeviceToken. Platform is not defined.');
    if (!uuid) return console.error('NotificationService :: saveDeviceToken. UUID is not defined.');

    var data = {
      uuid    : uuid,
      token   : token,
      userID  : userId,
      platform: $rootScope.platform
    };

    new User
      .$addDeviceToken(data)
      .then(function(updatedUser){
        if (updatedUser && updatedUser.id) $rootScope.user = updatedUser;
      }, function(err){
        console.error('NotificationService :: tokenReceivedHandler. Could not update the User.', err);
      });
    return undefined;
  }







  function unregister(){
    if (!$rootScope.notificationsOn) return undefined;
    if (!pluginInitialized) return console.error('NotificationService :: unregister. Plugin is not Initialized');
    return Push.unregister(function(){}, function(){});
  }





  function tokenReceivedHandler (event, token){
    log('NotificationService:tokenReceived. ' + $rootScope.platform + ' (' + getDeviceUUID() + '): ' + token);
    if (!token) return console.error('NotificationService :: tokenReceivedHandler. Token is not defined.');
    self.saveDeviceToken(token);
    return undefined;
  }





  function pushNotificationHandler (event, notification){
    log('NotificationService:notification', notification);
  }
}
