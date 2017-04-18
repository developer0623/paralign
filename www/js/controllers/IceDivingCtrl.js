ParalignAppControllers.controller('IceDivingCtrl', ['$rootScope', '$scope', '$state', 'Guide', '$serverConsole', IceDivingCtrl]);



function IceDivingCtrl($rootScope, $scope, $state, Guide, $serverConsole) {
  $scope.guide = {
    title: "Ice Diving",
    type : 'icediving',
    user : $rootScope.user.id
  };

  $scope.openModalInfo = function (){
    $rootScope.openModal('guide-info-ice-diving', $scope);
  };


  $scope.sendGuideResults = function(){
    $rootScope.loadingOn();

    new Guide
      .$save($scope.guide, function(){
        $rootScope.refreshUser();
        $rootScope.loadingOff();
        return $state.go('companion');
      })
      .catch(function(err){
        $serverConsole.error('IceDivingCtrl :: sendGuideResults. Failed save new Guide. ', err);
        return $rootScope.alertError(1, 'Failed save new Guide', 'Please try again later');
      });
  };
}