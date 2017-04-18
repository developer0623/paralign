ParalignAppControllers
  .controller('SimilarMindsCtrl', ['$rootScope', '$scope', '$state', '$timeout', 'Chat', 'ThoughtService', 'ChatService', 'TDCardDelegate', 'User', '$serverConsole', '$q', '$cordovaSocialSharing', '$cordovaScreenshot','$cordovaFile', SimilarMindsCtrl]);



function SimilarMindsCtrl($rootScope, $scope, $state, $timeout, Chat, ThoughtService, ChatService, TDCardDelegate, User, $serverConsole, $q, $cordovaSocialSharing, $cordovaScreenshot,$cordovaFile) {
  var watcherLeave         = undefined;
  $scope.isFirstLoading    = true;
  $scope.$timeout          = $timeout;
  $scope.similarMinds      = undefined;
  $scope.cards             = [];
  $scope.lockMoveCard      = false;
  $scope.charactersLimit   = 210;
  $scope.arrayRemovedCards = []; // it's array of minds which will be removed after leaving the page

  $scope.isFlipped       = false;
  $scope.showFlipArrow   = false;
  $scope.fistFlipMessage = true;
  $scope.showFlipMessage = true;
  $scope.lockFlipMessage = false;

  $scope.init             = init;
  $scope.init_watchers    = init_watchers;
  $scope.connect          = connect;
  $scope.hideFlipMessage  = hideFlipMessage;
  $scope.cardDestroyed    = cardDestroyed;
  $scope.cardSwipedLeft   = cardSwipedLeft;
  $scope.cardSwipedRight  = cardSwipedRight;
  $scope.flipCard         = flipCard;
  $scope.getNotAloneValue = getNotAloneValue;
  $scope.isNotAlone       = isNotAlone;
  $scope.setNotAlone      = setNotAlone;
  $scope.report           = report;
  $scope.reportModal      = reportModal;
  $scope.getSimilarMinds  = getSimilarMinds;
  $scope.checkNewMindsAndRefresh = checkNewMindsAndRefresh;
  $scope.updateUsersSimilarMinds = updateUsersSimilarMinds;

  $scope.simTitle                    = simTitle;
  $scope.ucfirst                     = ucfirst;




  var watcherViewEnter = $scope.$on('$ionicView.enter', function () {
    $scope.init();
  });
  $scope.$on('$destroy', watcherViewEnter);
  return this;










  function init(_similarMinds){
    $rootScope.loadingOn();

    if (_similarMinds){
      _setSimilarMinds(_similarMinds);
    } else {
      $scope.init_watchers();
      var minds = $scope.getSimilarMinds();

      $q
        .all([
          minds.then(function (value){ return value; })
        ])
        .then(function(values){
          _setSimilarMinds(values[0]);
        });
    }


    function _setSimilarMinds(SimilarMinds){
      $scope.similarMinds   = angular.copy(SimilarMinds);
      $scope.cards          = SimilarMinds;
      if ($scope.isFirstLoading) $scope.checkNewMindsAndRefresh(SimilarMinds);
      $scope.isFirstLoading = false;
      $rootScope.loadingOff();
      
      // initiate the names and card titles 
      $scope.simTitle()
    }

  }






  function init_watchers(){
    if (!watcherLeave) {
      watcherLeave = $scope.$on('$ionicView.beforeLeave', function(){
        return $scope.updateUsersSimilarMinds($scope.arrayRemovedCards);
      });
    }

    $scope.$on('$destroy', function() {
      if (watcherLeave) watcherLeave();
    });
  }





  function hideFlipMessage(){
    $timeout(function(){
      $scope.showFlipMessage = false;
      $timeout(function(){
        $scope.showFlipArrow   = true;
        $scope.lockFlipMessage = true;
      }, 500);
    }, 1000)
  }







  function connect(card) {
    if (!card || !card.thought) return undefined;
    $rootScope.loadingOn();

    var authorId = card.thought.user ? card.thought.user.id : null;
    if (!authorId) {
      $serverConsole.error(
        'SimilarMindsCtr :: connect. Failed connect. Author ID is not defined. Thought: ' + card.id
      );
      return $rootScope.alertError(3, 'Failed connect.', 'Please try again later');
    }
    if (!$rootScope.user || !$rootScope.user.id) {
      $serverConsole.error('SimilarMindsCtr :: connect. User is not defined');
      return $rootScope.alertError(3, 'Could not start new Chat', 'User is undefined');
    }
    if ($rootScope.user.id == authorId) {
      return $rootScope.alertError(
        0,
        'Could not start new Chat',
        'You can not start a chat only with itself'
      );
    }

    var privateProp = true;
    var query = {
      owner: $rootScope.user.id,
      aboutThought: card.thought.id,
      aboutSimilarThought: card.sim_thought.id
    };

    ChatService.findAndConnectChats(query, card.thought, privateProp, function(err, chat){
      if (err || !chat || !chat.id) {
        var chatId = chat && chat.id ? chat.id : chat;
        $serverConsole.error('SimilarMindsCtr :: connect. Could not find Chat. Chat: ' + chatId, err);
        return $rootScope.alertError(3, 'Could not connect to Chat', 'Please try again later');
      }
      return $state.go('chat', {id: chat.id});
    });
  }








  function checkNewMindsAndRefresh(currentMinds){
    new User
      .refreshSimilarMinds($rootScope.user.id, function (err, newMinds) {
        if (err) return console.error('SimilarMindsCtrl :: checkNewMinds', err);
        if (!newMinds || !currentMinds) return undefined;

        var property       = 'createdAt';
        var currendIDs     = _.pluck(currentMinds, property);
        var newIDs         = _.pluck(newMinds, property);
        var differencesNew = _.difference(newIDs, currendIDs);
        var differencesCur = _.difference(currendIDs, newIDs);

        if (!!differencesNew.length || !!differencesCur.length) {
          $scope.init(newMinds);
        }
      });
  }





  function cardDestroyed(index) {
    $scope.arrayRemovedCards.push($scope.cards[index]);
    $scope.updateUsersSimilarMinds([$scope.cards[index]]);
    $scope.cards.splice(index, 1);

    for (var key in $rootScope.adj_user_sim_tit) {
      if (key > index){
        var new_idx = key - 1
        $rootScope.adj_user_sim_tit[new_idx] = $rootScope.adj_user_sim_tit[key];
      }
    }
    return undefined;
  }



  function cardSwipedLeft() {
    $rootScope.trackEvent('similarswipeleft');
    if ($scope.isFlipped) $scope.flipCard();
  }



  function cardSwipedRight() {
    $rootScope.trackEvent('similarswiperight');
    if ($scope.isFlipped) $scope.flipCard();
  }



  function flipCard() {
    $scope.isFlipped = !$scope.isFlipped;
  }



  function getNotAloneValue(thought){
    if (!thought || !Array.isArray(thought.notAlones)) return '0';
    return thought.notAlones.length;
  }



  function isNotAlone(card) {
    if (!card || !card.thought) return undefined;
    if (!card.thought.notAlones || !card.thought.notAlones.length) return false;
    if (!$rootScope.user || !$rootScope.user.id) {
      $serverConsole.error('SimilarMindsCtr :: isNotAlone. User is not defined');
      return false;
    }
    var notAloneArr = card.thought.notAlones;
    for (var i=0; i < notAloneArr.length; i++){
      if (notAloneArr[i] &&
        notAloneArr[i].author &&
        $rootScope.user &&
        notAloneArr[i].author == $rootScope.user.id) {
        return true;
      }
    }
    return false;
  }






  function setNotAlone(card) {
    if (!card || !card.thought) return undefined;
    if (!card.thought.id || !card.thought.user) return undefined;
    if ($scope.isNotAlone(card.thought)) return undefined;
    if (!card.thought.notAlones) card.thought.notAlones = [];

    if (!$rootScope.user || !$rootScope.user.id) {
      $serverConsole.error('SimilarMindsCtr :: setNotAlone. User is not defined');
      return $rootScope.alertError(1, 'Could not set \'Not Alone\'', 'User is not defined');
    }

    var data = {
      author   : $rootScope.user.id,
      thought  : card.thought.id,
      recipient: card.thought.user.id,
      createdAt: moment().utc().format()
    };
    card.thought.notAlones.push(data);
    ThoughtService.set_notAlone(data);
    $rootScope.openPopover('not-alone', 1500);
    return undefined;
  }






  function report(card){
    $rootScope.closeModal();

    if (!card || !card.thought) return undefined;
    $rootScope.loadingOn();

    $timeout(function(){
      ThoughtService.reportThought(card.thought, function(err){
        if (err) {
          $serverConsole.error(
            'SimilarMindsCtr :: report :: reportThought. Could not report this thought. Thought: ',
            card.thought,
            '\nError: ',
            err
          );
          return $rootScope.alertError(
            1,
            'Could not report this thought.',
            'Please try again later'
          );
        }
        $rootScope.loadingOff();
        $rootScope.trackEvent('similarreport');
        TDCardDelegate.$getByHandle('cards').getFirstCard().swipe('left');
        return undefined;
      });
    }, 400);
    return undefined;
  }






  function reportModal() {
    $rootScope.openModal('report', $scope);
  }






  function getSimilarMinds() {
    if (!$rootScope.user || !$rootScope.user.id) return [];
    var userID = $rootScope.user.id;
    return new User.getSimilarMindsFromCache(userID);
  }






  function updateUsersSimilarMinds (removedCards){
    if (!$rootScope.user || !$rootScope.user.id) {
      $serverConsole.error('SimilarMindsCtr :: updateUsersSimilarMinds. User is not defined');
      return $rootScope.alertError(1, 'Could not update Similar Minds', 'User is not defined');
    }

    if (!Array.isArray(removedCards) || !removedCards.length) return undefined;

    new User.putSimilarMindsToCache($scope.cards);

    var removedMinds = removedCards.map(function (card) {
      if (!card) return undefined;
      return {
        createdAt  : card.createdAt,
        thought    : card.thought.id,
        sim_thought: card.sim_thought.id
      };
    });

    new User
      .$removeSimilarMinds({
        id: $rootScope.user.id,
        removedMinds: removedMinds
      })
      .then(function(newSimilarMinds){
        new User.putSimilarMindsToCache(newSimilarMinds)
      }, function(err){
        $serverConsole.error(
          'SimilarMindsCtrl :: updateUsersSimilarMinds :: $update. Could not update the User.',
          err
        );
      });
  }


  function simTitle(){
      $rootScope.adj_user_sim_tit = {}
      var titles  = ['I have been there before!', 'I hear you my friend!', 'Yo! I am with you!', 
      'I am Aligned! now sky is the limit!', 'Nice! You got similar thoughts!'];
      var names   = ['Dog', 'Cat', 'Giraffe', 'Fox', 'Monkey', 'Rabbit'];
      var adjs    = [ "Intuitive", "Frank", "Courageous", "Affectionate", "Meditative", "Compassionate", "Mindful",
        "Resourceful", "Sensible", "Sincere", "Sympathetic", "Unassuming", "Witty", "Adaptable", "Adventurous",
        "Ambitious", "Amiable", "Compassionate", "Affectionate", "Considerate", "Courteous", "Diligent", "Empathetic", 
        "Generous", "Overwhelming", "Heartfelt", "Nobel", "Selfless", "Merciful", "Holy", "Deep", "Genuine", "Boundless",
        "Sweet", "Gentle", "Warm"];
      for (i=0; i< $scope.cards.length; i++){
        titles = shuffle(titles);
        names  = shuffle(names);
        adjs   = shuffle(adjs);
        
        tit         = titles[0];
        username    = names[0];
        simname     = names[1];
        adj = adjs[0];

        $rootScope.adj_user_sim_tit[i] = {"adjective": adj, "user":username, "sim":simname, "title":tit};
      }
  };
  
  function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

  function ucfirst(text)
  {
    if (text){
      return text.charAt(0).toUpperCase() + text.substr(1);
    } else{
      return "Neutral";
    }
    
  } 




}
