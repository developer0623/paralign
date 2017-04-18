ParalignAppDirectives

.directive('menuFader', ['$timeout', '$ionicGesture', '$ionicSideMenuDelegate', function ($timeout, $ionicGesture, $ionicSideMenuDelegate) {
  return {
    restrict: 'E',
    require: '^ionSideMenus',
    scope: true,
    link: function($scope, $element, $attr, sideMenuCtrl) {
      $ionicGesture.on('tap', function(e) {
        $ionicSideMenuDelegate.toggleRight(true);
      }, $element);
      $ionicGesture.on('dragleft', function(e) {
        sideMenuCtrl._handleDrag(e);
        e.gesture.srcEvent.preventDefault();
      }, $element);
      $ionicGesture.on('dragright', function(e) {
        sideMenuCtrl._handleDrag(e);
        e.gesture.srcEvent.preventDefault();
      }, $element);
      $ionicGesture.on('release', function(e) {
        sideMenuCtrl._endDrag(e);
      }, $element);
      $scope.sideMenuDelegate = $ionicSideMenuDelegate;
      $scope.$watch('sideMenuDelegate.getOpenRatio()', function(ratio) {
        if (Math.abs(ratio)<1) {
          $element[0].style.zIndex = "1";
          $element[0].style.opacity = 0.7 - Math.abs(ratio);
        } else {
          $element[0].style.zIndex = "-1";
        }
      });
    }
  }
}]);

