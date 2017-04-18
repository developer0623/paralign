ParalignAppControllers.controller('WonderingMindsCtrl', ['$rootScope', '$scope', '$state', '$timeout', 'Chat', 'ChatService', 'ThoughtService', 'TDCardDelegate', 'Thought', '$serverConsole', '$localStorage', WonderingMindsCtrl]);


function WonderingMindsCtrl($rootScope, $scope, $state, $timeout, Chat, ChatService, ThoughtService, TDCardDelegate, Thought, $serverConsole, $localStorage) {
  $scope.isFirstLoading   = true;
  $scope.lockMoveCard     = false;
  $scope.charactersLimit  = 210;
  $scope.cards            = [];
  $scope.viewedCards      = [];
  $scope.isShowMessageFirstCard = false;
  $scope.fetchDefaultQuery      = undefined;

  $scope.isFetching             = false;
  $scope.fetch_partSize         = 30;
  $scope.fetch_nextSkipCount    = 0;
  $scope.fetch_first_part_size  = 5;
  $scope.fetch_second_part_size = 20;
  $scope.fetch_if_number_cards_is_left = 2;


  $scope.init                 = init;
  $scope.connect              = connect;
  $scope.reportModal          = reportModal;
  $scope.report               = report;
  $scope.setNotAlone          = setNotAlone;
  $scope.isNotAlone           = isNotAlone;
  $scope.getNotAloneValue     = getNotAloneValue;
  $scope.nextCard             = nextCard;
  $scope.prevCard             = prevCard;
  $scope.cardSwiped           = cardSwiped;
  $scope.fetchNextPartCards   = fetchNextPartCards;
  $scope.fetchCards           = fetchCards;
  $scope.isOnPage             = isOnPage;

  $scope.setLastViewedThought  = setLastViewedThought;
  $scope.getLastViewedThought  = getLastViewedThought;
  $scope.goToLastViewedThought = goToLastViewedThought;




  var watcherViewEnter = $scope.$on('$ionicView.enter', $scope.init);
  $scope.$on('$destroy', watcherViewEnter);
  return this;










  function init() {
    $rootScope.loadingOn();
    var viewedThoughtCreatedAt = undefined;

    /*
    * If a user came not from the Home page then here will be applied a query
    * which will continue fetching from the last thought which was viewed.
    * */
    if ($rootScope.$backState && $rootScope.$backState.name === 'home'){
      $scope.setLastViewedThought('');
    }
    else {
      viewedThoughtCreatedAt = $scope.getLastViewedThought();
      if (viewedThoughtCreatedAt) {
        $scope.fetchDefaultQuery = {
          createdAt: {
            '<=': viewedThoughtCreatedAt
          }
        };
      }
    }


    $scope.fetchCards(0, $scope.fetch_first_part_size, $scope.fetchDefaultQuery, function(){
      $scope.isFirstLoading = false;
      $rootScope.loadingOff();

      $scope.fetchCards(
        $scope.fetch_first_part_size,
        $scope.fetch_second_part_size,
        $scope.fetchDefaultQuery,
        function () {
          $rootScope.loadingOff();
        }
      );
    });
  }





  function connect(thought) {
    $rootScope.loadingOn();

    var privateProp = false;
    var query = {
      owner: undefined,
      aboutThought: thought.id
    };

    ChatService.findAndConnectChats(query, thought, privateProp, function(err, chat){
      if (err || !chat || !chat.id) {
        var chatId = chat && chat.id ? chat.id : chat;
        $serverConsole.error('WonderingMindsCtrl :: connect. Could not find Chat. Chat: ' + chatId, err);
        return $rootScope.alertError(3, 'Could not connect to Chat', 'Please try again later');
      }
      return $state.go('chat', {id: chat.id});
    });
  }





  function setLastViewedThought(value){
    $localStorage.set('wondering_last_viewed_thought_createdAt', value);
  }


  function getLastViewedThought(){
    return $localStorage.get('wondering_last_viewed_thought_createdAt');
  }



  function goToLastViewedThought(id, callback){
    if (!id) return callback();
    if (!$scope.cards || !$scope.cards.length) return callback();
    var length = $scope.cards.length;
    var indexOfViewedThought = undefined;

    for (var i=0; i < length; i++){
      var thought = $scope.cards[i];
      if (thought && thought.id == id) {
        indexOfViewedThought = i;
        break;
      }
    }

    if (typeof(indexOfViewedThought) != 'undefined') $scope.cards.splice(0, indexOfViewedThought +1);
    return callback();
  }






  function nextCard(index) {
    var thought       = $scope.cards[index];
    var thoughtViewed = $scope.cards[index +1];
    $scope.viewedCards.push(thought);
    $scope.setLastViewedThought(thoughtViewed ? thoughtViewed.createdAt : undefined);
    $scope.cards.splice(index, 1);

    if ($scope.cards.length <= $scope.fetch_if_number_cards_is_left) $scope.fetchNextPartCards();
    if (!$scope.cards.length && $scope.isFetching) $rootScope.loadingOn();
  }







  function prevCard() {
    var lastCard = $scope.viewedCards[$scope.viewedCards.length -1];
    if (lastCard) {
      $scope.cards.unshift(lastCard);
      $scope.viewedCards.splice($scope.viewedCards.length -1, 1);
    }
    else {
      var cards = $scope.cards;
      $scope.cards = [];
      $scope.viewedCards  = [];
      $timeout(function(){
        $scope.cards = cards;
      }, 500);
    }
  }







  function cardSwiped(direction) {
    $rootScope.trackEvent('wonderswipe' + direction);
    if ($scope.isFlipped) $scope.flipCard();
  }









  function getNotAloneValue(thought){
    if (!thought || !Array.isArray(thought.notAlones)) return '0';
    return thought.notAlones.length;
  }






  function isNotAlone(thought) {
    if (!thought) return undefined;
    if (!thought.notAlones || !thought.notAlones.length) return false;
    if (!$rootScope.user || !$rootScope.user.id) {
      $serverConsole.error('WonderingMindsCtr :: isNotAlone. User is not defined');
      return false;
    }
    var notAloneArr = thought.notAlones;
    for (var i=0; i < notAloneArr.length; i++){
      if (notAloneArr[i] && notAloneArr[i].author && notAloneArr[i].author == $rootScope.user.id) {
        return true;
      }
    }
    return false;
  }






  function setNotAlone(thought) {
    if (!thought || !thought.id || !thought.user) return undefined;
    if ($scope.isNotAlone(thought)) return undefined;
    if (!thought.notAlones) thought.notAlones = [];

    if (!$rootScope.user || !$rootScope.user.id) {
      $serverConsole.error('WonderingMindsCtr :: setNotAlone. Could not set \'Not Alone\'. User is not defined');
      return $rootScope.alertError(1, 'Could not set \'Not Alone\'', 'User is not defined');
    }

    var data = {
      author   : $rootScope.user.id,
      thought  : thought.id,
      recipient: typeof(thought.user) == 'string' ? thought.user : thought.user.id,
      createdAt: moment().utc().format()
    };

    thought.notAlones.push(data);
    ThoughtService.set_notAlone(data);
    // Code that controls YANA Popover
    $rootScope.openPopover('not-alone', 1500);
    return undefined;
  }






  function fetchNextPartCards(){
    $scope.fetchCards(
      $scope.fetch_nextSkipCount,
      $scope.fetch_partSize,
      $scope.fetchDefaultQuery,
      function(err, isBusy){
        if (err) error('fetchNextPartCards', err);
        if (!isBusy) $rootScope.loadingOff();
      }
    );
  }






  function fetchCards(skip, limit, query, callback){
    if ($scope.isFetching) return callback(null, true);
    $scope.isFetching = true;
    $scope.fetch_nextSkipCount = skip + limit;

    ThoughtService.fetchWonderingMinds(query, skip, limit, function (err, thoughts){
      if (err) return callback(err);
      var length = thoughts.length;

      for (var i=0; i < length; i++){
        var thought = thoughts[i];
        $scope.cards.push(thought);
        if (i >= length-1) {
          $scope.isFetching = false;
          return callback();
        }
      }
    });
  }










  function isOnPage(){
    return $state.is('wonderingMinds');
  }







  function report(card){
    $rootScope.closeModal();

    if (!card) return undefined;
    $rootScope.loadingOn();

    $timeout(function(){
      ThoughtService.reportThought(card, function(err){
        if (err) {
          $serverConsole.error(
            'WonderingMindsCtrl :: report. Could not report about this thought. Thought: ',
            card,
            '\nError: ',
            err
          );
          return $rootScope.alertError(
            1,
            'Could not report about this thought.',
            'Please try again later'
          );
        }
        $rootScope.loadingOff();
        $rootScope.trackEvent('wonderreport');
        TDCardDelegate.$getByHandle('cards').getFirstCard().swipe('left');
        return undefined;
      });
    }, 400);
    return undefined;
  }







  function reportModal() {
    $rootScope.openModal('report', $scope);
  }
}
