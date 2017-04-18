
ParalignApp
  .config(['$httpProvider', '$ionicConfigProvider', '$sailsProvider', 'ServerUrl', '$mixpanelProvider', 'CacheFactoryProvider', 'MIXPANEL_APP_TOKEN', configMethod]);


function configMethod($httpProvider, $ionicConfigProvider, $sailsProvider, ServerUrl, $mixpanelProvider, CacheFactoryProvider, MIXPANEL_APP_TOKEN) {
  var ionicUrlReg = new RegExp('ionic\.io', 'gi');

  $sailsProvider.url = ServerUrl;
  $mixpanelProvider.apiKey(MIXPANEL_APP_TOKEN);

  angular.extend(CacheFactoryProvider.defaults, {
    maxAge: 24 * 60 * 60 * 1000,  // 24 hours
    storageMode: 'localStorage',
    storagePrefix: 'prlgn_'
  });

  if(ionic.Platform.isAndroid()) $ionicConfigProvider.scrolling.jsScrolling(false);

  $ionicConfigProvider.navBar.alignTitle('center');
  $ionicConfigProvider.backButton.text('').icon('ion-ios7-arrow-left');
  $ionicConfigProvider.backButton.previousTitleText(false);
  $ionicConfigProvider.views.swipeBackEnabled(false);

  $httpProvider.defaults.withCredentials = true;
  $httpProvider.defaults.headers.post['Content-Type'] = 'application/json';
  $httpProvider.defaults.headers.put['Content-Type']  = 'application/json';

  $httpProvider.interceptors.push(function() {
    return {
      request: function(request) {
        if (ionicUrlReg.test(request.url)) request.withCredentials = false;
        return request;
      },

      responseError: function(response) {
        if(response.status === 0) {
          error('Bad server connection. The app may not work correctly.');
          //fn_alert('Alert', 'Bad server connection. The app may not work correctly.');
        }
        return response;
      }
    };
  });


  $sailsProvider.interceptors.push(function() {
    return {
      response: function(response) {
        if (response && response.headers && response.headers['Connection-Socket-Status'] === 'need_to_update'){
          if (ionic.SocketService && ionic.SocketService.refreshConnection) ionic.SocketService.refreshConnection();
        }
        return response;
      }
    };
  });
}