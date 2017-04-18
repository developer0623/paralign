ParalignAppControllers.controller('SunshineCtrl', ['$rootScope', '$scope', '$timeout', '$interval', '$state', 'Thought', 'Guide', 'ThoughtService', '$serverConsole', SunshineCtrl]);




function SunshineCtrl($rootScope, $scope, $timeout, $interval, $state, Thought, Guide, ThoughtService, $serverConsole) {
  $scope.meditationTimer  = undefined;
  $scope.timerCurrent     = 0;
  $scope.timerDuration    = 0;
  $scope.timerFinished    = false;
  $scope.timerString      = '00:00';
  $scope.showMessage      = true;
  $scope.isPlay           = false;
  $scope.isAudioWasLoaded = false;
  $scope.isLoading        = false;
  $rootScope.sunshineAudio= undefined;
  $scope.audioSrc         = "https://s3-us-west-1.amazonaws.com/paralign-guides/MeditationSunshine.mp3";
  $scope.thought          = {
    user     : $rootScope.user.id,
    content  : '',
    mood     : '',
    intensity: 0
  };
  $scope.guide = {
    title           : "Sunshine",
    type            : 'sunshine',
    user            : $rootScope.user.id,
    thought         : undefined,
    pre_mood        : undefined,
    pre_intensity   : undefined,
    meditation_start: undefined,
    meditation_end  : undefined,
    post_mood       : undefined,
    post_intensity  : undefined
  };

  $scope.sunshineTemplate     = undefined;
  $scope.sunshineTemplateName = undefined;
  $scope.sunshineTemplatesArr = {
    none             : '',
    mindText         : 'tmplt-sunshine-mindText',
    mood_pre         : 'tmplt-sunshine-mood',
//    moodType_pre     : 'tmplt-sunshine-moodType',
//    moodIntense_pre  : 'tmplt-sunshine-moodIntense',
    meditation       : 'tmplt-sunshine-meditation',
    mood_post        : 'tmplt-sunshine-mood-post',
//    moodType_post    : 'tmplt-sunshine-moodType',
//    moodIntense_post : 'tmplt-sunshine-moodIntense',
    endOfGuide       : 'tmplt-sunshine-endOfGuide'
  };


  $scope.init                 = init;
  $scope.set_sunshineTemplate = set_sunshineTemplate;
  $scope.setMoodType          = setMoodType;
  $scope.setMoodIntense       = setMoodIntense;
  $scope.nextStep             = nextStep;
  $scope.loadAudio            = loadAudio;
  $scope.playAudio            = playAudio;
  $scope.pauseAudio           = pauseAudio;
  $scope.timerToggle          = timerToggle;
  $scope.runAudioLoop         = runAudioLoop;
  $scope.stopTimer            = stopTimer;
  $scope.finishTimer          = finishTimer;
  $scope.getTimeString        = getTimeString;
  $scope.saveGuideThought     = saveGuideThought;
  $scope.sendGuideResults     = sendGuideResults;
  $scope.openModalInfo        = openModalInfo;



  var watcherViewEnter = $scope.$on('$ionicView.loaded', $scope.init);
  $scope.$on('$destroy', watcherViewEnter);
  return this;








  function init(){
    $rootScope.setStyleHeaderBar('sunshine');
    $scope.set_sunshineTemplate('mindText');
    $scope.loadAudio($scope.audioSrc);

    //leave
    var watcherLeave = $scope.$on('$stateChangeStart', function(e, toState, toParams, fromState) {
      if (fromState.name == 'sunshine') $scope.stopTimer();
    });

    $scope.$on('$destroy', function() {
      watcherLeave();
      $scope.stopTimer();
    });
  }





  function set_sunshineTemplate(templateName){
    $scope.sunshineTemplateName = templateName;
    $scope.sunshineTemplate     = $scope.sunshineTemplatesArr[templateName];
  }



  function setMoodType (type) {
    var str  = $scope.sunshineTemplateName.split(/_/);
    var when = str[str.length -1];
    if (!type || (when !== 'pre' && when !== 'post')) {
      return $serverConsole.error(
        'SunshineCtrl :: setMoodType :: wrong arguments. ',
        type,
        when,
        $scope.sunshineTemplateName
      );
    }
    $scope.guidemood = type;
    $scope.moods = {};
    $scope.intensity = {};
    $scope.moods[type] = "activated1";
    return $scope.guide[when + '_mood'] = type;
  }



  function setMoodIntense (intense) {
    var str  = $scope.sunshineTemplateName.split(/_/);
    var when = str[str.length -1];
    if (when !== 'pre' && when !== 'post') {
      return $serverConsole.error(
        'SunshineCtrl :: setMoodIntense :: wrong arguments. ',
        intense,
        when,
        $scope.sunshineTemplateName
      );
    }
    $scope.intensity = {};
    $scope.intensity[intense] = $scope.guide[when + '_mood'];
    return $scope.guide[when + '_intensity'] = intense;
  }




  function nextStep() {
    switch ($scope.sunshineTemplateName) {
      case 'mindText'        :
//        $scope.set_sunshineTemplate('moodType_pre');
        $scope.set_sunshineTemplate('mood_pre');
        $rootScope.trackEvent('sunshinemood');
        break;
//      case 'moodType_pre'    :
//        $scope.set_sunshineTemplate('moodIntense_pre');
//        $rootScope.trackEvent('sunshineintensity');
//        break;
//      case 'moodIntense_pre' :
//        $scope.saveGuideThought();
//        $scope.set_sunshineTemplate('meditation');
//        break;
      case 'mood_pre' :
        $scope.saveGuideThought();
        $scope.set_sunshineTemplate('meditation');
        break;
      case 'meditation'      :
//        $scope.set_sunshineTemplate('moodType_post');
        $scope.set_sunshineTemplate('mood_post');
        $rootScope.trackEvent('sunshinepostmood');
        break;
//      case 'moodType_post'   :
//        $scope.set_sunshineTemplate('moodIntense_post');
//        $rootScope.trackEvent('sunshinepostintensity');
//        break;
//      case 'moodIntense_post':
//        $scope.set_sunshineTemplate('endOfGuide');
//        $rootScope.trackEvent('sunshinecomplete');
//        break;
      case 'mood_post':
        $scope.set_sunshineTemplate('endOfGuide');
        $rootScope.trackEvent('sunshinecomplete');
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
    if (!window.Media) return error('SunshineCtrl :: loadAudio. Media is not defined');
    if ($rootScope.sunshineAudio) return undefined;

    $rootScope.sunshineAudio = new Media(
      src,
      function(){},
      function(err) {
        error('SunshineCtrl :: loadAudio. Media error', err);
      }
    );

    $rootScope.sunshineAudio.loop = false;
    $scope.runAudioLoop();
    return undefined;
  }




  function playAudio () {
    if ($scope.showMessage) $scope.showMessage = false;
    if (!$scope.guide.meditation_start) $scope.guide.meditation_start = Date.now();

    if ($rootScope.sunshineAudio) {
      $rootScope.sunshineAudio.play();
      $scope.isPlay = true;
      if (!$scope.isAudioWasLoaded) $scope.isLoading = true;
    }
    else {
      $scope.loadAudio($scope.audioSrc);
    }
  }




  function pauseAudio () {
    if ($rootScope.sunshineAudio) {
      $rootScope.sunshineAudio.pause();
      $scope.isPlay = false;
    }
  }



  function timerToggle () {
    if ($scope.isPlay) return $scope.pauseAudio();
    else return $scope.playAudio();
  }



  function runAudioLoop () {
    $scope.meditationTimer = $interval(function () {
      $rootScope.sunshineAudio.getCurrentPosition(
        function (position) {
          if (position > 0) {
            if (!$scope.isAudioWasLoaded) $scope.isAudioWasLoaded = true;
            if ($scope.isLoading) $scope.isLoading = false;
            $scope.timerDuration = Math.floor($rootScope.sunshineAudio.getDuration()) * 1000;
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
        $serverConsole.error('SunshineCtrl :: saveGuideThought. Failed save new thought. ', err);
        return $rootScope.alertError(3, 'Failed save new thought', 'Please try again later');
      }
      $scope.guide.thought = savedThought.id;
      return undefined;
    });
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
            $serverConsole.error('SunshineCtrl :: sendGuideResults. Failed update Thought. ', err);
            return $rootScope.alertError(1, 'Failed update Thought', 'Please try again later');
          });
      })
      .catch(function(err){
        $serverConsole.error('SunshineCtrl :: sendGuideResults. Failed save new Guide. ', err);
        return $rootScope.alertError(1, 'Failed save new Guide', 'Please try again later');
      });
  }




  function openModalInfo (){
    $rootScope.openModal('guide-info-sunshine-hill', $scope);
  }


}
