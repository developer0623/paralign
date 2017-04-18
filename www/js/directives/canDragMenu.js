ParalignAppDirectives

.directive('canDragMenu', ['$timeout', '$ionicGesture', '$ionicSideMenuDelegate', function ($timeout, $ionicGesture, $ionicSideMenuDelegate) {
  return {
    restrict: 'A',
    require: '^ionSideMenus',
    scope: true,
    link: function($scope, $element, $attr, sideMenuCtrl) {
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
    }
  }
}]);