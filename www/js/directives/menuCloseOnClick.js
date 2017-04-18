ParalignAppDirectives
.directive('menuCloseOnClick', ['$ionicSideMenuDelegate', function($ionicSideMenuDelegate) {
  return {
    restrict: 'AC',
    link: function($scope, $element) {
      $element.bind('click', function() {
        $ionicSideMenuDelegate.$getByHandle('mainSideMenu').toggleRight(true);
      });
    }
  };
}]);