ParalignAppControllers.controller('LakeCtrl', ['$rootScope', '$scope', '$timeout', '$interval', '$state', 'Thought', 'Guide', 'ThoughtService', 'StoreService', '$serverConsole', 'Report', LakeCtrl]);



function LakeCtrl($rootScope, $scope, $timeout, $interval, $state, Thought, Guide, ThoughtService, StoreService, $serverConsole, Report) {
  $scope.meditationTimer  = undefined;
  $scope.timerCurrent     = 0;
  $scope.timerDuration    = 0;
  $scope.timerFinished    = false;
  $scope.timerString      = '00:00';
  $scope.showMessage      = true;
  $scope.isPlay           = false;
  $scope.isAudioWasLoaded = false;
  $scope.isLoading        = false;
  $rootScope.lakeAudio    = undefined;
  $scope.audioSrc         = "https://s3-us-west-1.amazonaws.com/paralign-guides/MeditationLake.mp3";
  $scope.thought          = {
    user     : $rootScope.user.id,
    content  : '',
    mood     : '',
    intensity: 0
  };
  $scope.guide = {
    title           : "Lake",
    type            : 'calmlake',
    productId       : "paralign_product_guide_calm_lake",
    user            : $rootScope.user.id,
    thought         : undefined,
    pre_mood        : undefined,
    pre_intensity   : undefined,
    meditation_start: undefined,
    meditation_end  : undefined,
    post_mood       : undefined,
    post_intensity  : undefined
  };
  $scope.product = StoreService.get_product($scope.guide.productId) || {};

  $scope.lakeTemplate     = undefined;
  $scope.lakeTemplateName = undefined;
  $scope.lakeTemplatesArr = {
    none             : '',
    mindText         : 'tmplt-lake-mindText',
    moodType_pre     : 'tmplt-lake-moodType',
    moodIntense_pre  : 'tmplt-lake-moodIntense',
    meditation       : 'tmplt-lake-meditation',
    moodType_post    : 'tmplt-lake-moodType',
    moodIntense_post : 'tmplt-lake-moodIntense',
    endOfGuide       : 'tmplt-lake-endOfGuide'
  };


  $scope.init             = init;
  $scope.set_lakeTemplate = set_lakeTemplate;
  $scope.isFreeGuide      = isFreeGuide;
  $scope.isPaidProduct    = $scope.isFreeGuide() ? true : StoreService.isPaidProduct($scope.guide.productId);
  $scope.isGuidePaid      = isGuidePaid;
  $scope.setMoodType      = setMoodType;
  $scope.setMoodIntense   = setMoodIntense;
  $scope.nextStep         = nextStep;
  $scope.loadAudio        = loadAudio;
  $scope.playAudio        = playAudio;
  $scope.pauseAudio       = pauseAudio;
  $scope.timerToggle      = timerToggle;
  $scope.runAudioLoop     = runAudioLoop;
  $scope.stopTimer        = stopTimer;
  $scope.finishTimer      = finishTimer;
  $scope.getTimeString    = getTimeString;
  $scope.saveGuideThought = saveGuideThought;
  $scope.sendGuideResults = sendGuideResults;
  $scope.infoAlertLocked  = infoAlertLocked;
  $scope.doPayment        = doPayment;
  $scope.openModalInfo    = openModalInfo;



  var watcherViewEnter = $scope.$on('$ionicView.loaded', $scope.init);
  $scope.$on('$destroy', watcherViewEnter);
  return this;




  function init(){
    $rootScope.setStyleHeaderBar('sunshine');
    $scope.set_lakeTemplate('mindText');
    $scope.loadAudio($scope.audioSrc);

    //leave
    var watcherLeave = $scope.$on('$stateChangeStart', function(e, toState, toParams, fromState) {
      if (fromState.name == 'lake') $scope.stopTimer();
    });

    $scope.$on('$destroy', function() {
      watcherLeave();
      $scope.stopTimer();
    });
  }





  function set_lakeTemplate(templateName){
    $scope.lakeTemplateName = templateName;
    $scope.lakeTemplate     = $scope.lakeTemplatesArr[templateName];
  }

  function isFreeGuide(){
    return $rootScope.isSettingsAllow('isFreeGuide', 'calmlake');
  }

  function isGuidePaid () {
    return $scope.isPaidProduct;
  }


  
  
  function setMoodType (type) {
    var str  = $scope.lakeTemplateName.split(/_/);
    var when = str[str.length -1];
    if (!type || (when !== 'pre' && when !== 'post')) {
      return $serverConsole.error(
        'LakeCtrl :: setMoodType. Wrong arguments.',
        type,
        when,
        $scope.lakeTemplateName
      );
    }
    return $scope.guide[when + '_mood'] = type;
  }
    
  
  

  function setMoodIntense (intense) {
    var str  = $scope.lakeTemplateName.split(/_/);
    var when = str[str.length -1];
    if (when !== 'pre' && when !== 'post') {
      return $serverConsole.error(
        'LakeCtrl :: setMoodIntense. Wrong arguments. ',
        intense,
        when,
        $scope.lakeTemplateName
      );
    }
    return $scope.guide[when + '_intensity'] = intense;
  }




  function nextStep() {
    switch ($scope.lakeTemplateName) {
      case 'mindText'        :
        $scope.set_lakeTemplate('moodType_pre');
        $rootScope.trackEvent('calmlakemood');
        break;
      case 'moodType_pre'    :
        $scope.set_lakeTemplate('moodIntense_pre');
        $rootScope.trackEvent('calmlakeintensity');
        break;
      case 'moodIntense_pre' :
        $scope.saveGuideThought();
        $scope.set_lakeTemplate('meditation');
        break;
      case 'meditation'      :
        $scope.set_lakeTemplate('moodType_post');
        $rootScope.trackEvent('calmlakepostmood');
        break;
      case 'moodType_post'   :
        $scope.set_lakeTemplate('moodIntense_post');
        $rootScope.trackEvent('calmlakepostintensity');
        break;
      case 'moodIntense_post':
        $scope.set_lakeTemplate('endOfGuide');
        $rootScope.trackEvent('calmlakecomplete');
        break;
      case 'endOfGuide'      :
        $scope.sendGuideResults();
        break;
      default                :
        return undefined;
    }
    return undefined;
  }
  
  
  


  function loadAudio (src) {
    if (!window.Media) return error('LakeCtrl :: loadAudio. Media is not defined');
    if ($rootScope.lakeAudio) return undefined;

    $rootScope.lakeAudio = new Media(
      src,
      function(){},
      function(err) {
        error('LakeCtrl :: loadAudio. Media error', err);
      }
    );
    $rootScope.lakeAudio.loop = false;
    $scope.runAudioLoop();
    return undefined;
  }



  

  function playAudio () {
    if ($scope.showMessage) $scope.showMessage = false;
    if (!$scope.guide.meditation_start) $scope.guide.meditation_start = Date.now();

    if ($rootScope.lakeAudio) {
      $rootScope.lakeAudio.play();
      $scope.isPlay = true;
      if (!$scope.isAudioWasLoaded) $scope.isLoading = true;
    }
    else {
      $scope.loadAudio($scope.audioSrc);
    }
  }
  




  function pauseAudio () {
    if ($rootScope.lakeAudio) {
      $rootScope.lakeAudio.pause();
      $scope.isPlay = false;
    }
  }




  
  function timerToggle () {
    if ($scope.isPlay) return $scope.pauseAudio();
    else return $scope.playAudio();
  }


  
  
  


  function runAudioLoop () {
    $scope.meditationTimer = $interval(function () {
      $rootScope.lakeAudio.getCurrentPosition(
        function (position) {
          if (position > 0) {
            if (!$scope.isAudioWasLoaded) $scope.isAudioWasLoaded = true;
            if ($scope.isLoading) $scope.isLoading = false;
            $scope.timerDuration = Math.floor($rootScope.lakeAudio.getDuration()) * 1000;
            $scope.timerCurrent  = Math.floor(position) * 1000;
            $scope.timerString   = $scope.getTimeString($scope.timerCurrent);
            if (($scope.timerCurrent + 2000) >= ($scope.timerDuration + 1000)) {
              return $scope.finishTimer();
            }
          }
        },
        function (e) {
          console.error("Error getting pos=" + e);
        }
      );
    }, 1000);
  }




  
  function stopTimer () {
    $scope.pauseAudio();
    if ($scope.meditationTimer) {
      $interval.cancel($scope.meditationTimer);
      $scope.meditationTimer = undefined;
    }
    return false;
  }


  
  
  
  function finishTimer () {
    $timeout(function () {
      $scope.guide.meditation_end = Date.now();
      $scope.stopTimer();
      $scope.timerFinished = true;
      $scope.timerString   = "OK";
      $timeout($scope.nextStep, 500);
    }, 1000);
  }




  function getTimeString (ms) {
    if (ms < 0) ms = 0;
    var min, sec;
    min = Math.floor(ms / (1000 * 60));
    sec = (ms % (1000 * 60)) / 1000;
    min = min < 10 ? '0' + min : min;
    sec = sec < 10 ? '0' + sec : sec;
    return min + ':' + sec;
  }





  function saveGuideThought (){
    $scope.thought.mood      = $scope.guide.pre_mood;
    $scope.thought.intensity = $scope.guide.pre_intensity;

    ThoughtService.createThought($scope.thought, function(err, savedThought){
      if (err) {
        $serverConsole.error('LakeCtrl :: saveGuideThought :: createThought. Failed save new thought.', err);
        return $rootScope.alertError(3, 'Failed save new thought', 'Please try again later');
      }
      $scope.guide.thought = savedThought.id;
      return undefined;
    });
    return undefined;
  }






  function sendGuideResults () {
    $rootScope.loadingOn();
    $scope.thought.mood      = $scope.guide.pre_mood;
    $scope.thought.intensity = $scope.guide.pre_intensity;

    new Guide
      .$save($scope.guide, function(savedGuide){

        new Thought
          .$update({
            id   : $scope.guide.thought,
            guide: savedGuide.id
          })
          .then(function(){
            $rootScope.refreshUser();
            $rootScope.loadingOff();
            return $state.go('companion');
          })
          .catch(function(err){
            $serverConsole.error('LakeCtrl :: sendGuideResults. Failed update Thought. ', err);
            return $rootScope.alertError(1, 'Failed update Thought', 'Please try again later');
          });
      })
      .catch(function(err){
        $serverConsole.error('LakeCtrl :: sendGuideResults. Failed save new Guide. ', err);
        return $rootScope.alertError(1, 'Failed save new Guide', 'Please try again later');
      });
    return undefined;
  }




  function infoAlertLocked (){
    return $rootScope.confirm(
      'Info',
      'The app can not get information from the Google Play Store. We have received a ' +
      'report with the details. We\'re trying to resolve this problem. \nYou can try to fix it ' +
      'by yourself. For that you need to refresh data of the Google Play Store. Go to Settings of ' +
      'your phone -> Apps -> Google Play Store -> Clear Data button. And then restart the Paralign app.',
      'It doesn\'t help',
      function(){
        new Report
          .$save({
            user: $rootScope.user.id,
            type: 'error',
            description: 'The user can not buy the product ' + $scope.guide.productId
          });
        return $rootScope.alertError(2, 'Info', 'We\'re trying to resolve this problem. Sorry for the inconvenience.');
      }
    );
  }







  function doPayment (){
    if (!$scope.product.price) {
      return $rootScope.alertError(
        2, 
        'Could not get price', 
        'We have received a report with the details. We\'re trying to resolve this problem. Please try again later'
      );
    }

    $rootScope.loadingOn();
    StoreService.buy_product($scope.guide.productId, function(err, product, event){
      $rootScope.loadingOff();
      if (err) {
        var userID = $rootScope.user ? $rootScope.user.id : undefined;
        $serverConsole.error('LakeCtrl :: doPayment :: payment. Could not buy guide.', err, 'UserID: ' + userID);
        return $rootScope.alertError(
          2, 
          'Could not to buy this guide', 
          'We have received a report with the details. We\'re trying to resolve this problem. Please try again later'
        );
      }
      else if (event === 'owned') {
        $scope.isPaidProduct = true;
        $scope.product = product;
      }
      return undefined;
    });
    return undefined;
  }


  
  
  
  
  function openModalInfo (){
    return $rootScope.openModal('guide-info-calm-lake', $scope);
  }

}
