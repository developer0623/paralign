ParalignAppControllers
  .controller('TutorialCtrl', ['$rootScope', '$scope', '$state', '$timeout', '$localStorage', TutorialCtrl]);


function TutorialCtrl($rootScope, $scope, $state, $timeout, $localStorage) {
  $scope.isPageLoaded     = false;
  $scope.activeSlideIndex = 0;
  $scope.pagerColorClass  = 'active-slide-1';

  $scope.init             = init;
  $scope.changePagerColor = changePagerColor;
  $scope.finish           = finish;
  $scope.leavePage        = leavePage;

  $scope.init();
  return this;








  function init(){
    var watcherBeforeEnter = $scope.$on('$ionicView.beforeEnter', function() {
      $rootScope.setStyleHeaderBar('transparent');
    });

    var watcherEnter = $scope.$on('$ionicView.afterEnter', function() {
      $scope.isPageLoaded = true;
    });

    $scope.$on('$destroy', function() {
      watcherBeforeEnter();
      watcherEnter();
    });
  }






  function changePagerColor(i){
    $scope.pagerColorClass = 'active-slide-' + (i + 1);
    $scope.activeSlideIndex = i;
  }




  function finish(complete){
    if (complete) $rootScope.trackEvent('tutorialcomplete');
    else $rootScope.trackEvent('tutorialleave');
    return $scope.leavePage();
  }




  function leavePage() {
    $rootScope.setStyleHeaderBar('');
    var trained = $localStorage.get('trained');
    $timeout(function () {
      if (trained) return $state.go('home');
      else return $state.go('newThought');
    }, 10);
    return $localStorage.set('trained', true);
  }


}
