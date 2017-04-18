ParalignAppControllers
    .controller('MainCtrl', ['$rootScope', '$scope', '$state', 'ThoughtService', '$ionicModal', '$ionicPopover', '$ionicPopup', '$timeout', 'MixpanelService', 'GoogleAnalytics', 'ListEvents', '$cordovaInAppBrowser', MainCtrl]);


function MainCtrl($rootScope, $scope, $state, ThoughtService, $ionicModal, $ionicPopover, $ionicPopup, $timeout, MixpanelService, GoogleAnalytics, ListEvents, $cordovaInAppBrowser) {
  var inputThoughtChangedTimeout = undefined;
  $rootScope.thoughtMaxLength    = 300;
  $rootScope.modal       = undefined;
  $rootScope.popover     = undefined;
  $rootScope.navBarColor = 'default';


  $rootScope.inputPatterns = {
    name : ".{3,40}",
    email: "^([\.\\w-]{3,}(?:\\.[\\w-]+)*)@((?:[\\w-]+\\.)*\\w[\\w-]{0,66})\\.([a-z]{2,6}(?:\\.[a-z]{2})?)$",
    password: ".{6,20}"
  };


  $rootScope.trackEvent = function(event){
    var eventName = ListEvents[event] || event;
    if (!eventName) return undefined;

    if (!!$rootScope.mixpanelTrackOn) {
      MixpanelService.track(eventName, {}, function(){}, function(err){
        console.error('MainCtrl :: trackEvent. Could not track event ', eventName);
        console.error('Error: ', err);
      });
    }

    if (!!$rootScope.GAnalyticsOn) GoogleAnalytics.trackEvent(eventName);
    return undefined;
  };



  $rootScope.on_change_chacheThoughtLocalStorage = function(thought){
    if(inputThoughtChangedTimeout) $timeout.cancel(inputThoughtChangedTimeout);
    inputThoughtChangedTimeout = $timeout(function(){
      ThoughtService.cacheThought(thought);
    }, 1000);
  };







  $rootScope.showTermsAndPrivacy = function (){
    var privacyUrl = 'http://paralign.me/privacy';
    var tabOptions = {
      location: 'no',
      clearcache: 'no',
      clearsessioncache: 'no',
      toolbar: 'yes',
      hardwareback: 'no' // only for android. 'yes' - hardware back button to navigate backwards history. If there is 'no' - previous page will close.
    };
    $cordovaInAppBrowser.open(privacyUrl, '_blank', tabOptions);
  };





  /**********************
   *  Popover methods
   **********************/
  $rootScope.openPopover = function(templateName, duration) {
    if (!templateName) return undefined;

    $rootScope.closePopover();
    $ionicPopover
      .fromTemplateUrl("pages/templates/popover-" + templateName + ".html", {
        scope: $scope,
        cssClass: ''
      }).then(function(popover) {
        $rootScope.popover = popover;
        popover.show();
        $timeout(function(){
          popover.remove();
        } , duration || 3000);
      });
    return undefined;
  };


  $rootScope.closePopover = function() {
    if ($rootScope.popover) {
      $rootScope.popover.remove();
      $rootScope.popover = null;
    }
    return undefined;
  };
  /**********************
   * End Popover methods
   **********************/



  /**********************
   * Modal methods
   **********************/
  $rootScope.openModal = function(templateName, scope) {
    if (!templateName) return undefined;

    $rootScope.closeModal();
    $ionicModal
      .fromTemplateUrl("pages/templates/modal-" + templateName + ".html", {
        scope: scope || $scope,
        animation: 'slide-in-down',
        backdropClickToClose: true
      })
      .then(function(modal) {
        $rootScope.modal = modal;
        modal.show();
      });
    return undefined;
  };


  $rootScope.closeModal = function(e) {
    if (e){
      e.stopImmediatePropagation();
      e.stopPropagation();
      e.preventDefault();
    }
    if ($rootScope.modal) {
      $rootScope.modal.hide();
      var modal = $rootScope.modal;
      $rootScope.modal = null;
      $timeout(function () {
        modal.remove();
      }, 300);
    }
    return undefined;
  };
  /**********************
   * End Modal methods
   **********************/



  /**********************
   * Popup methods
   **********************/
  $rootScope.closePopup = function() {
    if ($rootScope.popup) {
      $rootScope.popup.close();
      $rootScope.popup = undefined;
    }
    return undefined;
  };


  $rootScope.popupAlert = function(title, content, buttonTitle, callback) {
    var isCallback = typeof(callback) === 'function';
    $rootScope.loadingOff();
    $rootScope.closePopup();
    $ionicPopup.confirm({
      title: title || 'Alert',
      cssClass: '',
      template: content,
      buttons: [{
        text: buttonTitle || 'OK',
        type: '',
        onTap: isCallback ? callback : function(){}
      }]
    });
  };


  $rootScope.popupConfirm = function(title, content, buttonTitle, callback) {
    var isCallback = typeof(callback) === 'function';
    $rootScope.loadingOff();
    $rootScope.closePopup();
    $ionicPopup.confirm({
      title: title || 'Confirm',
      cssClass: '',
      template: content,
      buttons: [
        {
          text: 'Cancel',
          type: '',
          onTap: $rootScope.closePopup
        },
        {
          text: buttonTitle || 'OK',
          type: '',
          onTap: isCallback ? callback : function(){}
        }
      ]
    });
  };
  /**********************
   * End Popup methods
   **********************/




  /**********************
   * Alerts
   **********************/
  $rootScope.alert = function(title, content, buttonTitle, callback) {
    $rootScope.loadingOff();
    var isCallback = typeof(callback) === 'function';
    if (navigator && navigator.notification && navigator.notification.alert){
      navigator.notification.alert(
        content,
        isCallback ? callback : function(){},
        title,
        buttonTitle || 'Okay'
      );
    }
    else {
      $rootScope.popupAlert(title, content, buttonTitle, callback);
    }
    return undefined;
  };



  $rootScope.alertError = function(level, title, content, buttonTitle, callback) {
    $rootScope.loadingOff();

    switch (level) {
      case 2: {
        $rootScope.alert(title, content, buttonTitle, callback);
        break;
      }
      case 3: {
        $state.go('home');
        if (typeof(callback) === 'function') callback();
        break;
      }
    }

    return undefined;
  };




  $rootScope.confirm = function(title, content, buttonTitle, callback) {
    $rootScope.loadingOff();
    var isCallback = typeof(callback) === 'function';
    if (!isCallback) return undefined;
    if (navigator && navigator.notification && navigator.notification.confirm){
      navigator.notification.confirm(
        content,
        function(buttonIndex){
          if (buttonIndex === 2) return callback();
          else return undefined;
        },
        title,
        ['Cancel', buttonTitle || 'Okay']
      );
    }
    else {
      $rootScope.popupConfirm(title, content, buttonTitle, callback);
    }
    return undefined;
  };


  $rootScope.alertWorkOn = function() {
    return $rootScope.alert(
      'Sorry :-(',
      'It will be added soon.',
      'Okay'
    );
  };
  /**********************
   * End Alerts
   **********************/





  $rootScope.isCorrectMood = function(mood) {
    var correctMoods = [
      'happy',
      'mad',
      'nervous',
      'neutral',
      'peaceful',
      'sad'
    ];
    return !!mood && correctMoods.indexOf(mood) > -1;
  };


  $rootScope.isEmptyObject = function(obj) {
    return obj && typeof(obj) === 'object' ? !Object.keys(obj).length : true;
  };


  $rootScope.isArray = function(obj) {
    return Array.isArray(obj);
  };



  $rootScope.JSONstringify = function(obj) {
    return obj ? JSON.stringify(obj) : '';
  };


  $rootScope.shuffleArray = function (o) {
    for(var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
    return o;
  };


  $rootScope.capitalizeFirstLetter = function(string){
    if (!string) return '';
    else return string.charAt(0).toUpperCase() + string.slice(1);
  };


}
