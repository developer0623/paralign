ParalignAppControllers.controller('ConnectionsCtrl', ['$rootScope', '$scope', '$state', '$ionicListDelegate', 'ChatService', '$timeout', ConnectionsCtrl]);



function ConnectionsCtrl($rootScope, $scope, $state, $ionicListDelegate, ChatService, $timeout) {
  var watcherChatUnread = undefined;

  $scope.connections = [];
  $scope.isLoading   = true;

  $scope.init              = init;
  $scope.loaderShow        = loaderShow;
  $scope.loaderHide        = loaderHide;
  $scope.removeConnection  = removeConnection;
  $scope.getIndexOfChat    = getIndexOfChat;
  $scope.lockConnection    = lockConnection;
  $scope.unlockConnection  = unlockConnection;
  $scope.isHidden          = isHidden;
  $scope.isLocked          = isLocked;
  $scope.getNumberOfVisibleChats = getNumberOfVisibleChats;
  $scope.setConnectionUnread     = setConnectionUnread;
  $scope.mergeWithNewConnections = mergeWithNewConnections;


  var watcherViewEnter = $scope.$on('$ionicView.enter', $scope.init);
  $scope.$on('$destroy', watcherViewEnter);
  return this;






  function init(){
    if (!$rootScope.user || !$rootScope.user.id) return error('User is undefined');

    $scope.loaderShow();
    $scope.connections = ChatService.getAllFromCache();

    ChatService.update_userChats({id: $rootScope.user.id}, function(err, chats){
      if (err) {
        console.error('ConnectionCtrl :: init :: updateUserChats. Could not get user\'s chats.', err);
        $scope.loaderHide();
        return $state.go('home');
      }
      return $scope.mergeWithNewConnections(chats, $scope.loaderHide);
    });


    watcherChatUnread = $scope.$on('chat:unread', function(e, data) {
      $scope.setConnectionUnread($scope.connections, data['chatId'], data['value'])
    });

    $scope.$on('$destroy', function() {
      watcherChatUnread();
    });
  }






  function removeConnection(chatId){
    $ionicListDelegate.closeOptionButtons();
    var index = $scope.getIndexOfChat(chatId);
    var keepChat = null;
    if (index >= 0) {
      keepChat = $scope.connections[index];
      $scope.connections.splice(index, 1);
    }
    ChatService.chatLeave(chatId, function(err){
      $scope.connections.splice(index, 0, keepChat);
      console.log("Chat removing error! :", err);
    });
    return undefined;
  }







  function getIndexOfChat(chatId){
    for (var i=0; i < $scope.connections.length; i++) {
      if ($scope.connections[i] && $scope.connections[i].id === chatId) return i;
    }
    return -1;
  }





  function lockConnection(chatId){
    $ionicListDelegate.closeOptionButtons();
    ChatService.chatLockToggle(chatId);
    if (!$rootScope.user || !$rootScope.user.id) {
      error('ConnectionsCtr :: lockConnection. User is not defined');
      return undefined;
    }
    var index = $scope.getIndexOfChat(chatId);
    if ($scope.connections[index]) {
      if (!$scope.connections[index].usersLocks) $scope.connections[index].usersLocks = [];
      $scope.connections[index].usersLocks.push($rootScope.user.id);
    }
    return undefined;
  }







  function unlockConnection(chatId){
    $ionicListDelegate.closeOptionButtons();
    ChatService.chatLockToggle(chatId);
    if (!$rootScope.user || !$rootScope.user.id) {
      error('ConnectionsCtr :: unlockConnection. User is not defined');
      return undefined;
    }
    var index = $scope.getIndexOfChat(chatId);
    if ($scope.connections[index]) {
      if (!$scope.connections[index].usersLocks) $scope.connections[index].usersLocks = [];
      var user_index = $scope.connections[index].usersLocks.indexOf($rootScope.user.id);
      $scope.connections[index].usersLocks.splice(user_index, 1);
    }
    return undefined;
  }





  function isHidden(chat){
    if (!chat) return true;
    var chatOwner = chat.owner && chat.owner.id ? chat.owner.id : chat.owner;
    if ($rootScope.user && $rootScope.user.id === chatOwner) return false;
    if (chat && chat.id && !chat.isEmpty) return false;
    return true;
  }







  function getNumberOfVisibleChats(chats){
    if (!Array.isArray(chats)) return 0;
    if (!chats.length) return 0;
    var _result_length = 0;

    var i=0;
    var length = chats.length;
    for (; i < length; i++){
      var chat = chats[i];
      if (chat && chat.id && !chat.isEmpty) _result_length++;
    }

    return _result_length;
  }






  function setConnectionUnread(chats, chatID, value){
    if (typeof(chats) !== 'object') return 0;
    var keys = Object.keys(chats);
    var _result_chat = undefined;

    for (var i=0; i < keys.length; i++){
      var chat = chats[keys[i]];
      if (chat && chat.id == chatID) _result_chat = chat;
    }
    if (_result_chat) _result_chat.hasUnread = value;
    return undefined;
  }






  function isLocked(connection){
    if (!connection || !Array.isArray(connection.usersLocks)) return false;
    if (!$rootScope.user || !$rootScope.user.id) {
      error('ConnectionsCtr :: isLocked. User is not defined');
      return false;
    }
    return connection.usersLocks.indexOf($rootScope.user.id) > -1;
  }





  function mergeWithNewConnections(newConnections, callback){
    var connectionsIDs    = _.pluck($scope.connections, 'id');
    var newConnectionsIDs = _.pluck(newConnections, 'id');
    var differences       = _.difference(connectionsIDs, newConnectionsIDs);

    for (var n=0; n < newConnections.length; n++){
      var connection = newConnections[n];
      if (connection.id && connectionsIDs.indexOf(connection.id) === -1) {
        $timeout(function () {
          $scope.connections.push(connection);
        });
      }
    }

    for (var d=0; d < differences.length; d++){
      var diffConnection = differences[d];
      var index = connectionsIDs.indexOf(diffConnection);
      if (index > -1) {
        $scope.connections.splice(index, 1);
        ChatService.removeFromCache(diffConnection);
      }
    }

    return callback();
  }








  function loaderShow(){
    $scope.isLoading = true;
  }

  function loaderHide(){
    $timeout(function(){
      $scope.isLoading = false;
    }, 1000);
  }



}