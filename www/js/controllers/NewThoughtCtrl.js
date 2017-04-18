ParalignAppControllers.controller('NewThoughtCtrl', ['$rootScope', '$scope', '$state', 'ThoughtService', NewThoughtCtrl]);



function NewThoughtCtrl($rootScope, $scope, $state, ThoughtService) {
  $scope.thought = {
    user     : $rootScope.user.id,
    content  : ThoughtService.get_cachedThought(),
    mood     : '',
    intensity: 0
  };

  $scope.shareTemplate     = undefined;
  $scope.shareTemplateName = undefined;
  $scope.shareTemplatesArr = {
    none       : '',
    mindText   : 'pages/templates/newThought/tmplt-share-mindText.html',
    // moodType   : 'pages/templates/newThought/tmplt-share-moodType.html',
    // moodIntense: 'pages/templates/newThought/tmplt-share-moodIntense.html',
    mood       : 'pages/templates/newThought/tmplt-share-mood.html'
  };


  $scope.set_shareTemplate = function(templateName){
    $scope.shareTemplateName = templateName;
    $scope.shareTemplate     = $scope.shareTemplatesArr[templateName];
  };


  $scope.setMoodType = function (type) {
    $scope.thought.mood = type;
    $scope.intensity = {};
    $scope.moods = {};
    $scope.moods[type] = "activated1"
    
  };

  $scope.setMoodIntense = function (intense) {
    $scope.thought.intensity = intense || 0;
    $scope.intensity = {};
    $scope.intensity[intense] = $scope.thought.mood;

  };


  $scope.nextStep = function () {
    switch ($scope.shareTemplateName) {
      case 'mindText'    :
        // $scope.set_shareTemplate('moodType');
        $scope.set_shareTemplate('mood');
        $rootScope.trackEvent('mood');
        break;
//      case 'moodType'    :
//        $scope.set_shareTemplate('moodIntense');
//        $rootScope.trackEvent('intensity');
//        break;
//      case 'moodIntense' :
      case 'mood' :
        $scope.shareThought();
        break;
      default            :
        return undefined;
    }
    return undefined;
  };





  $scope.goAwayFromThisPage = function () {
    var thoughtToString = '';
    try {
      thoughtToString = JSON.stringify($scope.thought);
    } catch (e){
      error('Could not parse created thought');
    }
    $rootScope.loadingOff();
    $state.go('myMinds', {processingThought: thoughtToString});
  };




  $scope.shareThought = function () {
    $rootScope.loadingOn();
    $scope.set_shareTemplate('none');
    ThoughtService.cacheThought('');
    $rootScope.refreshUser();
    $scope.goAwayFromThisPage();



    ThoughtService.createThought($scope.thought, function(err){
      if (err) {
        console.error('Failed save new thought. ', err);
        return $rootScope.alertError(3, 'Failed save new thought', 'Please try again later');
      }
      $scope.thought = undefined;
      return undefined;
    });
  };


  $scope.set_shareTemplate('mindText');

  $scope.$on('$destroy', function(){
    $scope.thought = undefined;
  });
}
