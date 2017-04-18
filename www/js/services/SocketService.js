ParalignAppServices.service('SocketService', ['$rootScope', '$sails', 'User', 'ChatService', SocketService]);


function SocketService ($rootScope, $sails, User, ChatService) {
  "use strict";
  var self = this;
  var socketLogsOn = false;
  if (socketLogsOn) log('Socket logs: ON');
  $rootScope.isSocketConnected = false;

  this.refreshConnection     = refreshConnection;
  this.user_subscribeSelf    = user_subscribeSelf;
  this.restoreAllConnections = restoreAllConnections;
  this.logout                = logout;
  this.init                  = init;


  this.init();
  return this;





  function init(){
    $sails.on('connect', function() {
      log('SocketService: connected');
      $rootScope.isSocketConnected = true;

      self.refreshConnection();

      $sails.on('message'         , message);
      $sails.on('user'            , user);
      $sails.on('user_lock_chat'  , user_lock_chat);
      $sails.on('user_unlock_chat', user_unlock_chat);
      $sails.on('user_leave_chat' , user_leave_chat);
      $sails.on('user_joined'     , user_joined);
      $sails.on('user_left'       , user_left);

      $sails.on('typing'          , typing);
      $sails.on('stop_typing'     , stop_typing);

      $sails.on('connect'         , reconnect);
      $sails.on('disconnect'      , disconnect);
      $sails.on('server_error'    , server_error);
    });
  }









  function refreshConnection(){
    return ChatService.emit('refresh_connection', {
      user: $rootScope.user ? $rootScope.user.id : undefined
    });
  }



  function restoreAllConnections(){
    self.refreshConnection();
    if (!$rootScope.user) {
      return error('SocketService :: restoreAllConnections. Could not get user from the $rootScope');
    }
    self.user_subscribeSelf();
    ChatService.get_userChats($rootScope.user, function(err, chats, chatsIDs){
      ChatService.chatConnect(chatsIDs);
      ChatService.chatCache(chats);
    });
    return undefined;
  }





  function user_joined(obj){
    if (socketLogsOn) log('SocketService: user_joined', obj);

    if ($rootScope.user && $rootScope.user.id !== obj.user){
      var message = {
        user        : obj.user,
        nickname    : obj.nickname,
        type_event  : 'user_joined',
        countOfUsers: obj.countOfUsers
      };
      ChatService.add_messageToChat(obj.chat, message, 'info');
    } else {
      ChatService.add_messageToChat(obj.chat, {countOfUsers: obj.countOfUsers}, 'info');
    }
  }




  function user_left(obj){
    if (socketLogsOn) log('SocketService: user_left', obj);

    if ($rootScope.user && $rootScope.user.id !== obj.user){
      var message = {
        user        : obj.user,
        nickname    : obj.nickname,
        type_event  : 'user_left',
        countOfUsers: obj.countOfUsers
      };
      ChatService.add_messageToChat(obj.chat, message, 'info');
    } else {
      ChatService.add_messageToChat(obj.chat, {countOfUsers: obj.countOfUsers}, 'info');
    }
  }




  function message(obj){
    if (socketLogsOn) log('SocketService: message', obj);
    if ($rootScope.user && obj.message.user === $rootScope.user.id) return undefined;
    if (obj.countOfUsers) obj.message.countOfUsers = obj.countOfUsers;
    ChatService.add_messageToChat(obj.chat, obj.message);
  }



  function user_lock_chat(obj){
    if (socketLogsOn) log('SocketService: user_lock_chat', obj);

    if (ChatService.isPrivateChat(obj.chat) && $rootScope.user && obj.user != $rootScope.user.id) {
      ChatService.get_userNickname(obj.chat.id, obj.user, function(err, nick){
        ChatService.chatCache(obj.chat, function(){
          var message = {
            content   : 'Oops! The user ' + nick + ' has blocked chat with you',
            user      : obj.user,
            type_event: 'user_lock_chat'
          };
          ChatService.add_messageToChat(obj.chat, message, 'info');
        });
      });
    }
  }





  function user_unlock_chat(obj){
    if (socketLogsOn) log('SocketService: user_unlock_chat', obj);

    if (ChatService.isPrivateChat(obj.chat) && $rootScope.user && obj.user != $rootScope.user.id) {
      ChatService.get_userNickname(obj.chat.id, obj.user, function(err, nick){
        ChatService.chatCache(obj.chat, function(){
          var message = {
            content   : 'Wow! The user ' + nick + ' unlocked chat with you',
            user      : obj.user,
            type_event: 'user_unlock_chat'
          };
          ChatService.add_messageToChat(obj.chat, message, 'info');
        });
      });
    }
  }



  function user_leave_chat(obj){
    if (socketLogsOn) log('SocketService: user_leave_chat', obj);

    if (ChatService.isPrivateChat(obj.chat) && $rootScope.user && obj.user != $rootScope.user.id) {
      ChatService.get_userNickname(obj.chat.id, obj.user, function(err, nick){
        ChatService.chatCache(obj.chat, function(){
          var message = {
            content     : 'Oops! The user ' + nick + ' does not want to talk and left the chat',
            user        : obj.user,
            type_event  : 'user_leave_chat',
            countOfUsers: obj.countOfUsers
          };
          ChatService.add_messageToChat(obj.chat, message, 'info');
        });
      });
    }
  }






  function user(obj){
    if (socketLogsOn) log('SocketService: user', obj.data ? obj.data.type_event : obj.data, obj);
    return undefined;
  }


  function typing(data){
    $rootScope.$broadcast('chat:'+data.chat+':typing', data);
  }


  function stop_typing(data){
    $rootScope.$broadcast('chat:'+data.chat+':stop_typing', data);
  }


  function reconnect(){
    if (socketLogsOn) log('SocketService: reconnected');
    $rootScope.isSocketConnected = true;
    self.restoreAllConnections();
  }


  function disconnect(){
    if (socketLogsOn) error('SocketService: disconnected');
    $rootScope.isSocketConnected = false;
  }


  function server_error(data){
    if (socketLogsOn) error('SocketService: server_error');
    error('SocketService :: server_error', data);
  }




  function user_subscribeSelf(cb){
    var isCallback = typeof(cb) === 'function';
    if (!$rootScope.user) {
      if (isCallback) return cb();
      else return undefined;
    }

    if (!$rootScope.user || !$rootScope.user.id) {
      error('SocketService :: user_subscribeSelf. User is undefined');
      if (isCallback) return cb();
      else return undefined;
    }

    $sails
      .get('/user/subscribeSelf/' + $rootScope.user.id)
      .then(function(res){
        if (isCallback) return cb(null, res);
        else return undefined;
      })
      .catch(function(err){
        error('SocketService :: subscribeSelf.', err);
        $rootScope.alertError(0, 'Could not connect', 'We have received a report with the details. We\'re trying to resolve this problem. Please restart the app', null, function(){ ionic.Platform.exitApp() });
        if (isCallback) return cb(err);
        else return undefined;
      });
    return undefined;
  }





  function logout(userId, cb){
    var isCallback = typeof(cb) === 'function';
    if (!userId) {
      if (isCallback) return cb('User is not defined');
      else return undefined;
    }

    $sails
      .get('/auth/logoutSocket/' + userId)
      .then(function(res){
        if (isCallback) return cb(null, res);
        else return undefined;
      })
      .catch(function(err){
        error('SocketService :: logout.', err);
        if (isCallback) return cb(err);
        else return undefined;
      });
    return undefined;
  }
}