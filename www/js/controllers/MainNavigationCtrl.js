ParalignAppControllers.controller('MainNavigationCtrl',
  ['$rootScope', '$ionicHistory', '$state', '$stateParams', '$scope', 'User', '$timeout', '$window', 'MixpanelService', 'GoogleAnalytics', '$ionicConfig', '$ionicPlatform', '$ionicSideMenuDelegate', 'SocketService', 'SessionService', 'ListEvents', MainNavigationCtrl]);


function MainNavigationCtrl($rootScope, $ionicHistory, $state, $stateParams, $scope, User, $timeout, $window, MixpanelService, GoogleAnalytics, $ionicConfig, $ionicPlatform, $ionicSideMenuDelegate, SocketService, SessionService, ListEvents) {
  var settingNotification    = $rootScope.user ? $rootScope.user['notificationsEnabled'] : undefined;
  var usersAge               = $rootScope.user ? $rootScope.user['age'] : undefined;
  $rootScope.mainMenu        = $ionicSideMenuDelegate;
  $scope.isShowMenu          = false;
  $scope.isShowFader         = false;
  $scope.toggleNotifications = typeof(settingNotification) != 'undefined' ? !!settingNotification : true;
  $scope.sliderDetail        = {};
  $scope.sliderDetail.age    = usersAge || 18;
  $scope.slider = {
    options: {
      floor: 7,
      ceil: 102,
      step: 1,
      showSelectionBar: true,
      onStart: function () {
        $scope.slider.started = true;
        $scope.slider.ended   = false;
      },
      onEnd: function (el, value) {
        $scope.slider.started = false;
        $scope.slider.ended   = true;
        $scope.updateUserAge(value);
      }
    },
    started: false,
    ended: true
  };


  /* init() calls from sideMenu.html */
  $scope.init                       = init;
  $rootScope.ageSliderPlus          = ageSliderPlus;
  $rootScope.ageSliderMinus         = ageSliderMinus;
  $rootScope.getPreviousTitle       = getPreviousTitle;
  $rootScope.setStyleHeaderBar      = setStyleHeaderBar;
  $rootScope.toggleLeft             = toggleLeft;
  $rootScope.openMenu               = openMenu;
  $rootScope.closeMenu              = closeMenu;
  $rootScope.isMenuOpen             = isMenuOpen;
  $rootScope.goBack                 = goBack;
  $scope.getScreenWidth             = getScreenWidth;
  $scope.updateUserAge              = _.debounce(updateUserAge, 1000);
  $scope.changeGender               = _.throttle(changeGender, 1000);
  $scope.updateSettingsNotification = _.debounce(updateSettingsNotification, 1000);

  $scope.setHandlerDeviceResume = setHandlerDeviceResume;
  $scope.setTrackingOfSideMenu  = setTrackingOfSideMenu;
  $scope.setTrackingOfPages     = setTrackingOfPages;
  $scope.fixInitOfSideMenu      = fixInitOfSideMenu;
  $scope.setAndroidHardwareBack = setAndroidHardwareBack;


  return this;







  function init(){
    $scope.setHandlerDeviceResume();
    $scope.fixInitOfSideMenu();
    $scope.setTrackingOfSideMenu();
    $scope.setAndroidHardwareBack();
    $scope.setTrackingOfPages();
  }







  function getScreenWidth() {
    return $window.innerWidth;
  }






  function ageSliderPlus() {
    $timeout(function(){
      $scope.sliderDetail.age++;
      $scope.updateUserAge($scope.sliderDetail.age);
    }, 0);
  }



  function ageSliderMinus() {
    $timeout(function(){
      $scope.sliderDetail.age--;
      $scope.updateUserAge($scope.sliderDetail.age);
    }, 0);
  }






  function getPreviousTitle() {
    return $rootScope.mainMenu.$getByHandle('mainNavBar').getPreviousTitle();
  }


  function openMenu() {
    return $timeout(function () {
      return $rootScope.mainMenu.$getByHandle('mainSideMenu').toggleRight();
    }, 0);
  }


  function closeMenu() {
    return $timeout(function () {
      return $rootScope.mainMenu.$getByHandle('mainSideMenu').toggleRight(true);
    }, 0);

  }


  function toggleLeft() {
    return $timeout(function () {
      return $rootScope.mainMenu.$getByHandle('mainSideMenu').toggleLeft();
    }, 0);
  }


  function isMenuOpen() {
    return !$rootScope.mainMenu.isOpen();
  }


  function goBack() {
    if (!$ionicHistory.backView()) return $state.go('home');
    else return $ionicHistory.goBack();
  }




  function updateSettingsNotification(value){
    if (!$rootScope.user || !$rootScope.user.id) {
      error('Could not change age. User is not defined');
      return $rootScope.toggleLeft();
    }

    $rootScope.user['notificationsEnabled'] = value;

    var _user = {};
    _user.id  = $rootScope.user.id;
    _user['notificationsEnabled'] = value;

    new User
      .$update(_user)
      .then(function(updatedUser){
        if (updatedUser && updatedUser.id) $rootScope.user = updatedUser;
      }, function(err){
        console.error('Could not update the User.', err);
        return $rootScope.toggleLeft();
      });
  }








  function setStyleHeaderBar(color) {
    $rootScope.navBarColor = color || 'default';
  }







  function updateUserAge(value) {
    if (!$rootScope.user || !$rootScope.user.id) {
      error('Could not change age. User is not defined');
      return $rootScope.toggleLeft();
    }

    $rootScope.user['age'] = value;

    var _user = {};
    _user.id  = $rootScope.user.id;
    _user['age'] = value;

    new User
      .$update(_user)
      .then(function(updatedUser){
        if (updatedUser && updatedUser.id) $rootScope.user = updatedUser;
      }, function(err){
        console.error('Could not update the User.', err);
        return $rootScope.toggleLeft();
      });
  }







  function changeGender(value) {
    if (!$rootScope.user || !$rootScope.user.id) {
      error('Could not change gender. User is not defined');
      return $rootScope.toggleLeft();
    }

    $rootScope.user['gender'] = value;

    var _user = {};
    _user.id  = $rootScope.user.id;
    _user['gender'] = value;

    new User
      .$update(_user)
      .then(function(updatedUser){
        if (updatedUser && updatedUser.id) $rootScope.user = updatedUser;
      }, function(err){
        console.error('Could not update the User.', err);
        return $rootScope.toggleLeft();
      });
  }






  function setHandlerDeviceResume(){
    var watcherResume = $ionicPlatform.on('resume', function () {
      $timeout(function(){
        SocketService.restoreAllConnections();
        $state.go($state.current['name'], $stateParams, {reload: true});
      }, 50);
    });
    $scope.$on('$destroy', watcherResume);
  }


  function fixInitOfSideMenu(){
    $timeout(function () {
      $rootScope.mainMenu.$getByHandle('mainSideMenu').toggleRight(true);
      $scope.isShowMenu = true;

      $timeout(function () {
        $scope.isShowFader = true;
      }, 50);
    }, 0);
  }





  function setTrackingOfSideMenu(){
    $rootScope.$watch('mainMenu.isOpen()', function(isOpen) {
      MixpanelService.track('sidemenu');
      GoogleAnalytics.trackView('sidemenu');
      //return $ionicConfig.views.transition(isOpen ? 'none' : 'platform');  /* change page transition type according side menu state */
    }, false);
  }







  function setAndroidHardwareBack(){
    $ionicPlatform.registerBackButtonAction(function (e) {
      e.preventDefault();
      if ($rootScope.modal || $rootScope.popup || $rootScope.popover) {
        $rootScope.closeModal();
        $rootScope.closePopup();
        $rootScope.closePopover();
        return undefined;
      }

      if ($rootScope.isMenuOpen()) {
        return $rootScope.closeMenu();
      } else {
        return $rootScope.goBack();
      }
    }, 1000);
  }






  function setTrackingOfPages(){
    $rootScope.$on('$stateChangeStart', function(e, toState, toParams, fromState, fromParams) {
      var listPages = {
        login         : 'login',
        home          : 'home',
        tutorial      : 'tutorial',
        companion     : 'companion',
        connections   : 'connection',
        chat          : 'chat',
        myMinds       : 'mymind:mode',
        myMindsFilters: 'mymind',
        similarMinds  : 'similarmind',
        wonderingMinds: 'wondermind',
        newThought    : 'newthought',
        icedivingintro: 'icediving',
        sunshineintro : 'sunshinehill',
        lakeintro     : 'calmlake'
      };

      var eventTitle = listPages[toState['name']];
      if (eventTitle === 'mymind:mode') {
        if (toParams['mode'] === 'clusters') eventTitle = 'mymindcluster';
        else eventTitle = 'myminddate';
      }

      if (listPages[toState['name']]) {
        var eventName = ListEvents[eventTitle] || eventTitle;
        MixpanelService.track(eventName);
        GoogleAnalytics.trackView(eventTitle);
      }
    });


    $rootScope.$on('$stateChangeStart', function(e, toState, toParams, fromState, fromParams) {
      if ($rootScope.isMenuOpen()) return $rootScope.closeMenu();
      SessionService.checkAccess(e, toState, toParams, fromState, fromParams);
      $rootScope.$backState = {
        name  : fromState['name'],
        params: fromParams
      };
    });
  }
}
