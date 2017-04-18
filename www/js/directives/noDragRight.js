ParalignAppDirectives.directive('noDragRight', ['$ionicGesture', noDragRight]);


function noDragRight($ionicGesture) {
  return {
    restrict: 'A',
    link: function($scope, $element) {
      $ionicGesture.on('dragright', function(e) {
        e.gesture.srcEvent.preventDefault();
      }, $element);
    }
  }
};