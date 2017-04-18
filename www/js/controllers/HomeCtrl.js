ParalignAppControllers.controller('HomeCtrl', ['$rootScope', '$scope', HomeCtrl]);



function HomeCtrl($rootScope, $scope) {
  $scope.isImagesCached = false;

  var watcherBeforeEnter = $scope.$on('$ionicView.beforeEnter', function() {
    $rootScope.setStyleHeaderBar('');
  });

  var watcherEnter = $scope.$on('$ionicView.enter', function() {
    $scope.isImagesCached = true;
  });

  $scope.$on('$destroy', function() {
    watcherBeforeEnter();
    watcherEnter();
  });
}