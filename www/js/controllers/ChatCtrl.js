ParalignAppControllers.controller('ChatCtrl', ChatCtrl);

ChatCtrl.$inject = ['$rootScope', '$scope', '$state', '$timeout', '$ionicScrollDelegate', 'Chat', 'ChatService', 'CurrentChat', 'ChatMessages', '$serverConsole', '$ionicNavBarDelegate'];

function ChatCtrl($rootScope, $scope, $state, $timeout, $ionicScrollDelegate, Chat, ChatService, CurrentChat, ChatMessages, $serverConsole, $ionicNavBarDelegate) {
  $rootScope.loadingOff();

  if (!CurrentChat || !CurrentChat.id) {
    $state.go('connections');
    $serverConsole.error('ChatCtrl. Could not find chat');
    return $rootScope.alertError(3, 'Could not find chat', 'Please try again later.');
  }

  log('Chat ID: ' + CurrentChat.id);

  var inputChangedPromise = undefined;
  var watcherMessages     = undefined;
  var watcherTyping       = undefined;
  var watcherStopTyping   = undefined;

  $scope.CurrentChat       = CurrentChat;
  $scope.chatPrivate       = !!CurrentChat.private;
  $scope.pageScroll        = $ionicScrollDelegate.$getByHandle('chatPageHandle');
  $scope.nickname          = '';
  $scope.countUsers        = {};
  $scope.countUsers.value  = $scope.CurrentChat.countOfUsers || 1;
  $scope.messages          = ChatMessages || [];
  $scope.typingUsers       = [];
  $scope.message           = '';
  $scope.isPullingMessages = false;

  $scope.init                = init;
  $scope.init_watchers       = init_watchers;
  $scope.sendMessage         = sendMessage;
  $scope.isSameAuthorMessage = isSameAuthorMessage;
  $scope.isMyMessage         = isMyMessage;
  $scope.getUserNickname     = getUserNickname;
  $scope.updateTyping        = updateTyping;
  $scope.report              = report;
  $scope.reportModal         = reportModal;
  $scope.pageScrollBottom    = pageScrollBottom;
  $scope.getChatUser         = getChatUser;
  $scope.pullMessages        = pullMessages;
  $scope.checkExistsChat     = checkExistsChat;


  var watcherViewEnter = $scope.$on('$ionicView.enter', $scope.init);
  $scope.$on('$destroy', watcherViewEnter);
  return this;


  function init() {
    $ionicNavBarDelegate.showBar(true); // it is a fix for the disappearing of the navbar
    $scope.init_watchers();
    $scope.chatUser = $scope.getChatUser();
    var userId      = $rootScope.user ? $rootScope.user.id : undefined;
    ChatService.get_userNickname($scope.CurrentChat.id, userId, function (err, nick) {
      if (err) {
        $serverConsole.error('ChatCtrl :: init. Could not get nickname.', err);
        return $rootScope.alertError(1, 'Could not get your nickname', 'Please reboot the chat.');
      }
      $scope.nickname = nick;
    });
    $scope.checkExistsChat();
    $scope.pullMessages();
    ChatService.chatSetUnread($scope.CurrentChat.id, false);
    $timeout($scope.pageScrollBottom, 300);
  }


  function sendMessage() {
    if (!$scope.message) return undefined;
    ChatService.send_message($scope.CurrentChat.id, $scope.message, function (err, message) {
      if (err) {
        $serverConsole.error('ChatCtrl :: sendMessage. Could not send the message', err);
        return $rootScope.alertError(1, 'Could not send the message', 'Please try again.');
      }
      ChatService.add_messageToChat($scope.CurrentChat.id, message);
    });
    $scope.message = '';
    return undefined;
  }


  function isSameAuthorMessage(currentMessage, indexMessage) {
    var author = currentMessage.user;
    var mess   = $scope.messages[indexMessage];
    if (!mess || !author) return false;
    if (mess.type === 'info') return false;
    return author === mess.user;
  }


  function isMyMessage(message) {
    return !!message && $rootScope.user && (message.user === $rootScope.user.id);
  }


  function getUserNickname(user) {
    var userId = undefined;
    if (typeof(user) === 'object' && user.id) userId = user.id;
    else if (typeof(user) === 'string') userId = user;
    if (!$scope.CurrentChat.usersNicknames || !$scope.CurrentChat.usersNicknames[userId]) {
      return 'Anonymous';
    }
    else {
      return $scope.CurrentChat.usersNicknames[userId];
    }
  }


  function updateTyping() {
    var data = {
      user    : $rootScope.user.id,
      nickname: $scope.nickname,
      chat    : $scope.CurrentChat.id
    };
    ChatService.emit('typing', data);
    if (inputChangedPromise) $timeout.cancel(inputChangedPromise);
    inputChangedPromise = $timeout(function () {
      ChatService.emit('stop_typing', data);
    }, 1000);
  }


  function report() {
    $rootScope.closeModal();
    $rootScope.loadingOn();

    $timeout(function () {
      ChatService.chatReport($scope.CurrentChat.id, function (err) {
        if (err) {
          $serverConsole.error('ChatCtrl :: report. Could not report about this chat.', err);
          return $rootScope.alertError(2, 'Could not report about this chat.', 'Please try again later');
        }
        $rootScope.loadingOff();
        $rootScope.trackEvent('chatreport');
        return undefined;
      });
    }, 700);
  }


  function reportModal() {
    $rootScope.openModal('chat-report', $scope);
  }


  function pageScrollBottom() {
    $scope.pageScroll.resize();
    $scope.pageScroll.scrollBottom(true);
    $scope.pageScroll.resize();
    return undefined;
  }


  function getChatUser() {
    if (!$rootScope.user) return {};
    var chatUser       = {};
    var listProperties = [
      'id',
      'firstname',
      'lastname',
      'email',
      'gender',
      'social_type',
      'social_username'
    ];
    for (var i = 0; i < listProperties.length; i++) {
      chatUser[listProperties[i]] = $rootScope.user[listProperties[i]];
    }
    return chatUser;
  }


  function init_watchers() {
    watcherMessages = $scope.$on('chat:' + $scope.CurrentChat.id + ':message', function (e, message) {
      if (message.countOfUsers) $scope.countUsers.value = message.countOfUsers || 0;
      if (!message.content) return undefined;
      if (message.type_event === 'user_joined' || message.type_event === 'user_left') {
        var lastMessage = _.last($scope.messages);
        if (lastMessage.type === 'info') return $scope.messages[$scope.messages.length - 1] = message;
      }
      $scope.messages.push(message);
      $scope.pageScroll.resize();
      if (message.type !== 'info' && message.chat === $scope.CurrentChat.id) $scope.pageScrollBottom();
      return undefined;
    });


    watcherTyping = $scope.$on('chat:' + $scope.CurrentChat.id + ':typing', function (e, data) {
      if (!data) return undefined;
      var nick  = data.nickname || $scope.getUserNickname(data.user);
      var index = $scope.typingUsers.indexOf(nick);
      if (index == -1) $scope.typingUsers.push(nick);
      return undefined;
    });


    watcherStopTyping = $scope.$on('chat:' + $scope.CurrentChat.id + ':stop_typing', function (e, data) {
      if (!data) return undefined;
      var nick  = data.nickname || $scope.getUserNickname(data.user);
      var index = $scope.typingUsers.indexOf(nick);
      if (index > -1) $scope.typingUsers.splice(index, 1);
      return undefined;
    });

    $scope.$on('$destroy', function () {
      watcherMessages();
      watcherTyping();
      watcherStopTyping();
    });
  }


  function pullMessages() {
    $scope.isPullingMessages = true;
    ChatService.fetchNewMessages($scope.CurrentChat.id, function (err, messages, newMessages) {
      if (err) {
        $scope.isPullingMessages = false;
        $serverConsole.error('ChatCtrl :: pullMessages. Could not fetch messages.', err);
        return $rootScope.alertError(3, 'Could not fetch messages.', 'Please reboot the chat.');
      }
      if (!newMessages) return $scope.isPullingMessages = false;
      $scope.isPullingMessages = false;

      for (var i = 0; i < newMessages.length; i++) {
        $scope.messages.push(newMessages[i]);
      }
      $timeout($scope.pageScrollBottom, 0);
    });
  }


  function checkExistsChat() {
    new Chat
      .$findById({id: $scope.CurrentChat.id})
      .then(function (chat) {
        if (!chat || !chat.id) {
          $serverConsole.error(
            'ChatCtrl :: checkExistsChat. The chat was removed ' +
            'but it is still in cache. It will be removed. ' +
            'Chat ID: ' + $scope.CurrentChat.id
          );
          return $rootScope.alertError(
            3,
            'Oops!',
            'This chat was removed but it is still in your cache. It will be removed.',
            undefined,
            function () {
              ChatService.removeFromCache($scope.CurrentChat.id);
              return $state.go('home');
            });
        }
      })
      .catch(function (err) {
        $serverConsole.error('ChatCtrl :: checkExistsChat.', err);
      });
  }
}
