ParalignAppDirectives.directive('noDragLeft', ['$ionicGesture', noDragLeft]);


function noDragLeft($ionicGesture) {
  return {
    restrict: 'A',
    link: function($scope, $element) {
      $ionicGesture.on('dragleft', function(e) {
        e.gesture.srcEvent.preventDefault();
      }, $element);
    }
  }
};