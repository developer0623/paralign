ParalignAppServices.service('ChatService', ['$rootScope', '$sails', '$state', '$stateParams', '$q', '$timeout', 'Chat', 'User', 'Report', 'CacheFactory', '$serverConsole', ChatService]);


function ChatService ($rootScope, $sails, $state, $stateParams, $q, $timeout, Chat, User, Report, CacheFactory, $serverConsole) {
  "use strict";
  var self = this;

  this.Cache           = CacheFactory.createCache('Chats', {});
  this.CacheMessages   = CacheFactory.createCache('Messages', {});
  this.putToCache      = putToCache;
  this.getFromCache    = getFromCache;
  this.removeFromCache = removeFromCache;
  this.clearCache      = clearCache;
  this.getAllFromCache = getAllFromCache;

  this.putToCacheMessages      = putToCacheMessages;
  this.getFromCacheMessages    = getFromCacheMessages;
  this.updateCacheMessages     = updateCacheMessages;
  this.removeFromCacheMessages = removeFromCacheMessages;

  this.fetchNewMessages = fetchNewMessages;


  this.get_userChats       = get_userChats;
  this.update_userChats    = update_userChats;
  this.get_userNickname    = get_userNickname;

  this.chatCache           = chatCache;
  this.chatCreate          = chatCreate;
  this.chatConnect         = chatConnect;
  this.findAndConnectChats = findAndConnectChats;

  this.chatSubscribe       = chatSubscribe;
  this.chatUnsubscribe     = chatUnsubscribe;
  this.chatSetUnread       = chatSetUnread;
  this.chatReport          = chatReport;

  this.chatLeave           = chatLeave;
  this.chatLock            = chatLock;
  this.chatUnlock          = chatUnlock;
  this.chatLockToggle      = chatLockToggle;

  this.isUserExists        = isUserExists;
  this.isPrivateChat       = isPrivateChat;

  this.cache_chatMessages  = cache_chatMessages;
  this.get_chatMessages    = get_chatMessages;
  this.pull_chatMessages   = pull_chatMessages;
  this.send_message        = send_message;
  this.add_messageToChat   = add_messageToChat;
  this.update_chatMessages = update_chatMessages;
  this.isThisRepeatedMessage = isThisRepeatedMessage;
  this.replaceMessageInCacheIfInfo = replaceMessageInCacheIfInfo;

  this.emit = emit;









  function putToCache(id, value){
    if (!id) {
      error('ChatService :: putToCache. Chat ID is not defined');
      return undefined;
    }
    if (value.messages) {
      self.updateCacheMessages(id, value.messages);
      delete value.messages;
    }
    return self.Cache.put(id, value);
  }



  function getFromCache(id){
    if (!id) {
      error('ChatService :: getFromCache. Chat ID is not defined');
      return undefined;
    }
    return self.Cache.get(id);
  }



  function removeFromCache(id){
    if (!id) {
      error('ChatService :: removeFromCache. Chat ID is not defined');
      return undefined;
    }
    self.removeFromCacheMessages(id);
    return self.Cache.remove(id);
  }



  function clearCache(){
    self.CacheMessages.removeAll();
    return self.Cache.removeAll();
  }



  function getAllFromCache(){
    return self.Cache.values();
  }



  function putToCacheMessages(chatID, messages){
    if (!chatID) return error('ChatService :: putToCacheMessages. Chat ID is not defined');
    return self.CacheMessages.put(chatID, messages);
  }



  function getFromCacheMessages(chatID){
    if (!chatID) return error('ChatService :: getFromCacheMessages. Chat ID is not defined');
    return self.CacheMessages.get(chatID);
  }





  function updateCacheMessages(chatID, newMessages){
    if (!Array.isArray(newMessages) || !newMessages.length) return undefined;
    if (!chatID) return error('ChatService :: updateCacheMessages. Chat ID is not defined');
    var cachedMessages = undefined;
    var lastCachedMsg  = undefined;
    var lastNewMsg     = undefined;
    var cachedMsgTime  = undefined;
    var newMsgTime     = undefined;
    var resultMessages = undefined;

    cachedMessages = self.getFromCacheMessages(chatID);

    if (!Array.isArray(cachedMessages) || !cachedMessages.length) {
      self.putToCacheMessages(chatID, newMessages);
      return newMessages;
    }

    lastCachedMsg = getLastMessageFromArray(cachedMessages);
    if (!lastCachedMsg) return newMessages;

    lastNewMsg    = _.last(newMessages);
    cachedMsgTime = new Date(lastCachedMsg.createdAt).getTime();
    newMsgTime    = new Date(lastNewMsg.createdAt).getTime();

    if (newMsgTime > cachedMsgTime) {
      resultMessages = mergeMessages(cachedMessages, newMessages);
      self.putToCacheMessages(chatID, resultMessages);
      return resultMessages;
    } else {
      return cachedMessages;
    }


    function mergeMessages(_cachedMessages, _newMessages){
      var _deltaArray = _newMessages.splice(getLengthOfCachedMessages(_cachedMessages));
      return _cachedMessages.concat(_deltaArray);
    }

    function getLastMessageFromArray(_messages){
      for (var i=_messages.length -1; i>=0; i--){
        if (!!_messages[i] && _messages[i].type !== 'info' && !!_messages[i].createdAt) {
          return _messages[i];
        }
      }
      return undefined;
    }

    function getLengthOfCachedMessages(_messages){
      var length = 0;
      for (var i=_messages.length -1; i>-1; i--){
        if (_messages[i] && _messages[i].type !== 'info') length++;
      }
      return length;
    }
  }



  function removeFromCacheMessages(chatID){
    if (!chatID) return error('ChatService :: removeFromCacheMessages. Chat ID is not defined');
    return self.CacheMessages.remove(chatID);
  }





  function fetchNewMessages(chatID, cb){
    var isCallback = typeof(cb) === 'function';
    if (!chatID) {
      if (isCallback) return cb('Chat ID is not defined');
      else return error('ChatService :: fetchNewMessages. Chat ID is not defined');
    }
    var cachedMessages = self.getFromCacheMessages(chatID) || [];
    var lastMessage    = getLastMessageFromArray(cachedMessages);
    var query = {};

    if (lastMessage) {
      query = {
        chat: chatID,
        createdAt: {
          '>': lastMessage.createdAt
        }
      };
    } else {
      query = {
        chat: chatID
      };
    }

    new Chat
      .$queryMessages({
        where: query,
        sort: 'createdAt asc'
      })
      .then(function(newMessages){
        if (!Array.isArray(newMessages) || !newMessages.length) {
          if (isCallback) return cb();
          else return undefined;
        }
        var resultMessages = cachedMessages.concat(newMessages);
        self.putToCacheMessages(chatID, resultMessages);
        if (isCallback) return cb(null, resultMessages, newMessages);
        else return undefined;
      })
      .catch(function(err){
        if (isCallback) return cb(err);
        else return error('ChatService :: fetchNewMessages.', err);
      });



    function getLastMessageFromArray(_messages){
      if (!_messages) return undefined;
      for (var i=_messages.length -1; i>=0; i--){
        if (!!_messages[i] && _messages[i].type !== 'info' && !!_messages[i].createdAt) {
          return _messages[i];
        }
      }
      return undefined;
    }
  }






  function get_userChats(user, cb){
    if (!user) return cb('ChatService :: get_userChats. User is not defined.', [], []);
    new User
      .$getUsersChats({
        id: user.id
      })
      .then(function(chats){
        return cb(null, chats, _.pluck(chats, 'id'));
      })
      .catch(function(err){
        $serverConsole.error('ChatService :: get_userChats. Find failed.', err);
        return cb(err);
      });
    return undefined;
  }





  function update_userChats(user, cb){
    var isCallback = typeof(cb) === 'function';
    if (!user && isCallback) return cb('User is not defined', []);

    self.get_userChats(user, function(err, chats){
      if (err && isCallback) return cb(err, []);

      if (chats && chats.length) {
        var cachedChats    = self.getAllFromCache();
        var cachedChatsIDs = _.pluck(cachedChats, 'id');
        var newChatsIDs    = _.pluck(chats, 'id');
        var differences    = _.difference(cachedChatsIDs, newChatsIDs);

        for (var d=0; d < differences.length; d++){
          var diffConnection = differences[d];
          if (diffConnection) self.removeFromCache(diffConnection);
        }

        var length = chats.length;
        for (var c=0; c < length; c++){
          var chat = chats[c];
          if (chat && chat.id) {
            self.chatSubscribe(chat.id);
            self.putToCache(chat.id, chat);
          }
          if (c >= (length -1) && isCallback) return cb(null, chats);
        }
      }
      else if (isCallback) {
        return cb(null, []);
      }
    });
    return undefined;
  }








  function get_userNickname(chatID, userID, cb){
    if (!chatID) return cb('Chat ID is undefined');
    if (!userID) return cb('User ID is undefined');

    var chat = self.getFromCache(chatID);
    if (!chat) {
      self.chatCache(chatID, function(err){
        var cachedChat = self.getFromCache(chatID);
        if (err || cachedChat) {
          error('ChatService :: get_userNickname. Failed cache chat.', err);
          return cb(null, 'Unknown user');
        }
        return getNickname(cachedChat, cb);
      });
    } else {
      return getNickname(chat, cb);
    }

    function getNickname(populatedChat, _cb){
      if (populatedChat && populatedChat['usersNicknames'] && populatedChat['usersNicknames'][userID]){
        return _cb(null, populatedChat['usersNicknames'][userID]);
      }
      else {
        // TODO: need replace this. it is not true
        new User
          .$generateRandomNickname()
          .then(function(res){
            _cb(null, res.nickname);
          })
          .catch(function(err){
            $serverConsole.error('ChatService :: get_userNickname. Failed generate user nickname.', err);
            return _cb(null, 'Unknown user');
          });
      }
    }
  }









  function chatCache(chats, cb){
    var isCallback = typeof(cb) === 'function';
    var promises   = [];
    if (!chats) {
      if (isCallback) return cb();
      else return undefined;
    }
    if (!Array.isArray(chats)) chats = [chats];

    for (var i=0; i < chats.length; i++){
      var chat = chats[i];
      if (!chat) {
        error('ChatService :: chatCache. ForEach chat is not defined. Chats', chats);
      }
      else if (typeof(chat) === 'object' && chat && chat.id) {
        self.putToCache(chat.id, chat);
      }
      else if (typeof(chat) === 'string') {
        if ($rootScope.user && $rootScope.user.id) promises.push(new Chat.$findById({id: chat}));
        else console.info('ChatService :: chatCache. User is not authenticated');
      }
      else {
        error('ChatService :: chatCache. Chat id is not defined. Chat: ', chat);
      }
    }


    if (promises.length){
      return $q
        .all(promises).then(function () {
          for (var p=0; p < promises.length; p++){
            var promise = promises[p];
            promise.then(function(promChat){
              if (promChat && promChat.id) {
                if (promChat.messages) self.updateCacheMessages(promChat.id, promChat.messages);
                if (promChat.id) self.putToCache(promChat.id, promChat);
              }
            });
          }
        })
        .then(function() {
          if (isCallback) return cb();
          else return undefined;
        });
    }
    else {
      if (isCallback) return cb();
      else return undefined;
    }
  }










  function chatCreate(data, cb){
    var users = Array.isArray(data.users) ? data.users : undefined;
    if (!users || !users.length) return cb('ChatService :: chatCreate. Users is not defined.');

    new Chat
      .$save(data)
      .then(function(savedChat){
        if (!savedChat || !savedChat.id) {
          error('ChatService :: chatCreate. Failed save new Chat.');
          return cb('Failed save new Chat');
        }
        self.chatCache(savedChat.id, function(){
          return cb(null, savedChat);
        });
        return undefined;
      })
      .catch(function(err){
        $serverConsole.error('ChatService :: chatCreate. Failed save new Chat. ', err);
        $rootScope.alertError(1, 'Failed save new Chat', 'Please try again later');
        return cb('Failed save new Chat');
      });
    return undefined;
  }








  function chatLeave(chatID, cb){
    var isCallback = typeof(cb) === 'function';
    if (!chatID) {
      if (isCallback) return cb('Chat ID is not defined.');
      else return undefined;
    }


    new Chat
      .$leave({id: chatID})
      .then(function(res){
          if(res.err){
            return cb("Server error:", res.err);
          }
          self.chatUnsubscribe(chatID);
          self.removeFromCache(chatID);
      })
      .catch(function(err){
        $serverConsole.error('ChatService :: chatLeave. Could not leave the Chat. Chat ID: ' + chatID, err);
        $rootScope.alertError(0, 'Could not leave the Chat', 'Please try again later');
        if (isCallback) return cb('Could not leave the Chat.');
        else return undefined;
      });
    return undefined;
  }





  function chatLock(chatID, cb){
    var isCallback = typeof(cb) === 'function';
    if (!chatID) {
      if (isCallback) return cb('Chat ID is not defined.');
      else return undefined;
    }

    if (!$rootScope.user || !$rootScope.user.id) {
      error('ChatService :: chatLock. User is undefined');
      if (isCallback) return cb();
      else return undefined;
    }

    new Chat
      .$lock({chatID: chatID, userID: $rootScope.user.id})
      .then(function(chat){
        self.chatCache(chat, cb);
      })
      .catch(function(err){
        $serverConsole.error('ChatService :: chatLock. Could not lock the Chat. Chat ID: ' + chatID, err);
        $rootScope.alertError(0, 'Could not lock the Chat', 'Please try again later');
        if (isCallback) return cb('Could not lock the Chat.');
        else return undefined;
      });
    return undefined;
  }





  function chatUnlock(chatID, cb){
    var isCallback = typeof(cb) === 'function';
    if (!chatID) {
      if (isCallback) return cb('Chat ID is not defined.');
      else return undefined;
    }

    if (!$rootScope.user || !$rootScope.user.id) {
      error('ChatService :: chatUnlock. User is undefined');
      if (isCallback) return cb();
      else return undefined;
    }

    new Chat
      .$unlock({chatID: chatID, userID: $rootScope.user.id})
      .then(function(chat){
        self.chatCache(chat, cb);
      })
      .catch(function(err){
        $serverConsole.error('ChatService :: chatUnlock. Could not unlock the Chat. Chat ID: ' + chatID, err);
        $rootScope.alertError(0, 'Could not unlock the Chat', 'Please try again later');
        if (isCallback) return cb('Could not unlock the Chat.');
        else return undefined;
      });
    return undefined;
  }





  function chatLockToggle(chatID, cb){
    var isCallback = typeof(cb) === 'function';
    if (!chatID) {
      if (isCallback) return cb('Chat ID is not defined.');
      else return undefined;
    }

    if (!$rootScope.user || !$rootScope.user.id) {
      error('ChatService :: chatLockToggle. User is undefined');
      if (isCallback) return cb();
      else return undefined;
    }

    var chat = self.getFromCache(chatID);
    var user = $rootScope.user;
    if (!chat) {
      error('ChatService :: chatLockToggle. Chat is not cached.');
      if (isCallback) return cb('Chat is not cached');
      else return undefined;
    }
    if (chat.usersLocks && chat.usersLocks.length && chat.usersLocks.indexOf(user.id) > -1) self.chatUnlock(chatID, cb);
    else self.chatLock(chatID, cb);
    return undefined;
  }












  function findAndConnectChats(query, aboutThought, privateProp, cb){
    var isCallback = typeof(cb) === 'function';

    $sails
      .get('/chat/findAndConnectChats/', {
        query      : query,
        thought    : aboutThought.id,
        thoughtID  : aboutThought.id,
        privateProp: privateProp,
        userID     : $rootScope.user.id
      })
      .then(function(res){
        var chat = res.data;
        if (isCallback) return cb(null, chat);
        else return undefined;
      })
      .catch(function(err){
        if (isCallback) return cb(err.error);
        else return undefined;
      });
  }








  function chatSubscribe(chatsIDs, cb){
    var isCallback = typeof(cb) === 'function';
    if (!chatsIDs) {
      error('ChatService :: chatSubscribe. Could not subscribe chat.', arguments);
      if (isCallback) return cb('ChatService :: chatSubscribe. Could not subscribe chat.');
      else return undefined;
    }
    if (chatsIDs && !Array.isArray(chatsIDs)) chatsIDs = [chatsIDs];
    if (!chatsIDs.length) {
      if (isCallback) return cb();
      else return undefined;
    }

    if (!$rootScope.user || !$rootScope.user.id) {
      error('ChatService :: chatSubscribe. User is undefined');
      if (isCallback) return cb();
      else return undefined;
    }

    $sails
      .get('/chat/subscribeChats/', {chatsIDs: chatsIDs, userID: $rootScope.user.id})
      .then(function(){
        if (isCallback) return cb();
        else return undefined;
      })
      .catch(function(err){
        $serverConsole.error('ChatService :: chatSubscribe. Could not subscribe chats. chatsIDs: ', chatsIDs, '\nError: ', err);
        if (isCallback) return cb('ChatService :: chatSubscribe. Could not subscribe chats.');
        else return undefined;
      });
    return undefined;
  }







  function chatUnsubscribe(chatsIDs, cb){
    var isCallback = typeof(cb) === 'function';
    if (!chatsIDs) {
      error('ChatService :: chatUnsubscribe. Could not unsubscribe chat.', arguments);
      if (isCallback) return cb('ChatService :: chatUnsubscribe. Could not unsubscribe chat.');
      else return undefined;
    }
    if (chatsIDs && !Array.isArray(chatsIDs)) chatsIDs = [chatsIDs];
    if (!chatsIDs.length) {
      if (isCallback) return cb();
      else return undefined;
    }

    if (!$rootScope.user || !$rootScope.user.id) {
      error('ChatService :: chatUnsubscribe. User is undefined');
      if (isCallback) return cb();
      else return undefined;
    }

    $sails
      .get('/chat/unsubscribeChats/', {chatsIDs: chatsIDs, userID: $rootScope.user.id})
      .then(function(){
        if (isCallback) return cb();
        else return undefined;
      })
      .catch(function(err){
        $serverConsole.error('ChatService :: chatUnsubscribe. Could not unsubscribe chats. chatsIDs: ', chatsIDs, '\nError: ', err);
        if (isCallback) return cb('ChatService :: chatUnsubscribe. Could not unsubscribe chats.');
        else return undefined;
      });
    return undefined;
  }






  function chatConnect(chatsIDs, cb){
    var isCallback = typeof(cb) === 'function';
    if (!chatsIDs) {
      error('ChatService :: chatConnect. Could not connect to chat.', arguments);
      if (isCallback) return cb('ChatService :: chatConnect. Could not connect to chat.');
      else return undefined;
    }
    if (chatsIDs && !Array.isArray(chatsIDs)) chatsIDs = [chatsIDs];
    if (!chatsIDs.length) {
      if (isCallback) return cb();
      else return undefined;
    }
    if (!$rootScope.user || !$rootScope.user.id) {
      error('ChatService :: chatConnect. User is undefined');
      if (isCallback) return cb();
      else return undefined;
    }

    $sails
      .get('/chat/connectToChats/', {chatsIDs: chatsIDs, userID: $rootScope.user.id})
      .then(function(){
        if (isCallback) return cb();
        else return undefined;
      })
      .catch(function(err){
        $serverConsole.error('ChatService :: chatConnect. Could not connect to chats. chatsIDs: ', chatsIDs, 'Error: ', err);
        if (isCallback) return cb('ChatService :: chatConnect. Could not connect to chats.');
        else return undefined;
      });
  }






  function isUserExists(chat, cb){
    var isCallback = typeof(cb) === 'function';
    var existsUser = false;
    if (!chat || !chat.id) {
      if (isCallback) return cb(null, existsUser);
      else return existsUser;
    }
    if (!chat['users'] || !chat['users'].length) return existsUser;
    if (!$rootScope.user || !$rootScope.user.id) {
      error('ChatService :: isUserExists. User is undefined');
      if (isCallback) return cb();
      else return undefined;
    }
    for (var i=0; i < chat['users'].length; i++){
      if (chat['users'][i] && chat['users'][i].id == $rootScope.user.id) {
        existsUser = true;
        break;
      }
    }
    if (isCallback) return cb(null, existsUser);
    else return existsUser;
  }




  function isPrivateChat(chat){
    if (!chat) return undefined;
    var currentChat = undefined;
    if (typeof(chat) === 'string') currentChat = self.getFromCache(chat);
    else if (typeof(chat) === 'object') currentChat = chat;
    else return undefined;
    return currentChat.private === true;
  }




  function cache_chatMessages(chatID, message){
    if (!chatID) return error('ChatService :: cache_chatMessages. Could not cache message because Chat ID is undefined. Message: ', message);
    var messages = self.getFromCacheMessages(chatID);
    if (self.isThisRepeatedMessage(chatID, message)) return undefined;
    if (self.replaceMessageInCacheIfInfo(chatID, message)) return undefined;
    if (!Array.isArray(messages)) messages = [];

    messages.push(message);
    self.putToCacheMessages(chatID, messages);
    return undefined;
  }





  function isThisRepeatedMessage(chat, message){
    if (!message) return false;
    if (!chat) {
      error('ChatService :: isThisRepeatedMessage. Chat is undefined');
      return false;
    }
    var chatID   = typeof(chat) === 'string' ? chat : chat.id;
    var messages = self.getFromCacheMessages(chatID);

    if (!Array.isArray(messages) || !messages.length) return false;

    var lastMessage = _.last(messages);
    if (!lastMessage) return false;
    if (lastMessage && lastMessage.id && !!message.id && lastMessage.id === message.id) return true;
    if (lastMessage.type === 'info' && message.type === 'info' && message.content == lastMessage.content) return true;
    return false;
  }




  /*
  * @return true if message was replaced
  * */
  function replaceMessageInCacheIfInfo(chat, message){
    if (!message) return undefined;
    if (!chat) {
      error('ChatService :: replaceIfInfoMessage. Chat is undefined');
      return undefined;
    }
    var chatID   = typeof(chat) === 'string' ? chat : chat.id;
    var messages = self.getFromCacheMessages(chatID);

    if (!Array.isArray(messages) || !messages.length) return undefined;

    var lastMessage = _.last(messages);
    if (!lastMessage) return undefined;
    if (lastMessage && lastMessage.id && !!message.id && lastMessage.id === message.id) return undefined;
    if (lastMessage.type === 'info' && message.type === 'info') {
      if (message.type_event === 'user_joined' || message.type_event === 'user_left') {
        messages[messages.length -1] = message;
        self.putToCacheMessages(chatID, messages);
        return true;
      }
    }
    return undefined;
  }





  function get_chatMessages(chatId, cb){
    if (!chatId) return cb('Chat ID is undefined');
    var chat = self.getFromCache(chatId);
    if (!chat) {
      return self.chatCache(chatId, function(err){
        var cachedChat = self.getFromCache(chatId);
        if (err || !cachedChat) error('ChatService :: get_chatMessages. Could not cache chat ' + chatId);
        return cb(err, cachedChat.messages);
      });
    } else {
      if (!Array.isArray(chat.messages)) chat.messages = [];
      return cb(null, chat.messages);
    }
  }



  function pull_chatMessages(chatId, query, cb){
    if (!chatId) return cb('Chat ID is undefined');
    if (!query) return cb('Query is undefined');
    Chat
      .$pullChatMessages({id: chatId, query: JSON.stringify(query)})
      .then(function(res){
        return cb(null, res.messages, res.query);
      })
      .catch(function(err){
        return cb(err);
      });
  }




  function update_chatMessages(chatId, newMessages, cb){
    if (!newMessages) return cb();
    if (!chatId) return cb('Chat ID is undefined');
    var chat = self.getFromCache(chatId);

    if (chat) {
      return self.chatCache(chatId, function(err){
        if (err) return cb(err);
        else return self.get_chatMessages(chatId, cb);
      });
    }

    return self.get_chatMessages(chatId, function(err, cachedMessages){
      if (err) return cb(err);
      var lastCachedMsg = getLastMessageFromArray(cachedMessages);
      var lastNewMsg    = newMessages[newMessages.length -1];

      if (!lastCachedMsg) return cb(null, newMessages);

      var cachedMsgTime = new Date(lastCachedMsg.createdAt).getTime();
      var newMsgTime    = new Date(lastNewMsg.createdAt).getTime();

      if (newMessages.length > cachedMessages.length || newMsgTime > cachedMsgTime) {
        var resultMessages = mergeMessages(cachedMessages, newMessages);
        return cb(null, angular.copy(resultMessages));
      } else {
        return cb(null, angular.copy(cachedMessages));
      }


      function mergeMessages(_cachedMessages, _newMessages){
        var _deltaArray     = _newMessages.splice(getLengthOfCachedMessages(_cachedMessages));
        var _resultMessages = _cachedMessages.concat(_deltaArray);
        return _resultMessages;
      }

      function getLastMessageFromArray(_messages){
        for (var i=_messages.length -1; i>=0; i--){
          if (!!_messages[i] && _messages[i].type !== 'info' && !!_messages[i].createdAt) {
            return _messages[i];
          }
        }
        return undefined;
      }

      function getLengthOfCachedMessages(_messages){
        var length = 0;
        for (var i=_messages.length -1; i>-1; i--){
          if (_messages[i] && _messages[i].type !== 'info') length++;
        }
        return length;
      }
    });
  }






  function send_message(chatId, messageContent, cb){
    var isCallback = typeof(cb) === 'function';
    if (!chatId) {
      error('ChatService :: send_message. Chat id is not defined.');
      if (isCallback) return cb('Chat id is not defined');
      else return undefined;
    }
    if (!messageContent) {
      error('ChatService :: send_message. Content is empty.');
      if (isCallback) return cb('Content is empty');
      else return undefined;
    }
    if (!$rootScope.user || !$rootScope.user.id) {
      error('ChatService :: send_message. User is undefined');
      if (isCallback) return cb();
      else return undefined;
    }
    self.emit('stop_typing', {
      user: $rootScope.user.id,
      chat: chatId
    });

    new Chat
      .$addMessage({
        content: messageContent,
        user   : $rootScope.user.id,
        chat   : chatId
      })
      .then(function(message){
        if (isCallback) return cb(null, message);
        else return undefined;
      })
      .catch(function(err){
        $serverConsole.error('ChatService :: send_message. Could not add message to chat. chatID: ' + chatId, '\nError: ', err);
        if (isCallback) return cb('Could not add message to chat.');
        else return undefined;
      });
    return undefined;
  }






  function add_messageToChat(chatId, messageObj, type){
    if (!chatId || !messageObj) return error('ChatService :: add_messageToChat. Could not add message to chat.', arguments);
    var chat = self.getFromCache(chatId);
    if (!chat) {
      return self.chatCache(chatId, function(){
        return addMessage(chatId, messageObj, type);
      });
    } else {
      return addMessage(chatId, messageObj, type);
    }


    function addMessage(id, message, type_m){
      if (!id) return undefined;
      var userID       = message.user;
      var userNickname = '';
      var _chat        = self.getFromCache(id);

      if (!_chat) return undefined;
      if (message.nickname) userNickname = message.nickname;
      else {
        var userNicknames = _chat['usersNicknames'];
        userNickname      = userNicknames && userNicknames[userID] ? userNicknames[userID] : '';
      }

      if (type_m) message.type = type_m;
      if (type_m === 'info' && message.type_event === 'user_joined') {
        message.content = 'User ' + userNickname + ' joined';
      }
      if (type_m === 'info' && message.type_event === 'user_left') {
        message.content = 'User ' + userNickname + ' left';
      }

      if (type_m !== 'info') {
        var state    = $state.current;
        var stateId  = $stateParams.id;
        var isReaded = state.name === 'chat' && stateId == id;
        if (_chat) _chat.isEmpty = false;
        self.chatSetUnread(id, !isReaded);
      }
      message.chatId = id;

      if (self.isThisRepeatedMessage(id, message)) return undefined;
      else {
        if (message.content) self.cache_chatMessages(id, message);
        $rootScope.$broadcast('chat:'+id+':message', message);
      }
      return undefined;
    }
  }







  function chatSetUnread(chat, value){
    var chatId = undefined;
    if (chat && typeof(chat) === 'object' && chat.id) chatId = chat.id;
    else if (chat && typeof(chat) === 'string') chatId = chat;
    else return error('ChatService :: chatSetUnread. Could not set unread property of incorrect chat. Chat: ', chat);
    var _chat = self.getFromCache(chatId);
    if (!_chat) return error('ChatService :: chatSetUnread. Could not find cached chat. Chat: ', chat);
    _chat.hasUnread = value;
    $rootScope.$broadcast('chat:unread', {chatId: chatId, value: value});
    return self.putToCache(chatId, _chat);
  }






  function chatReport(chat, cb){
    var chatId     = undefined;
    var timeStart  = +new Date();
    var isCallback = typeof(cb) === 'function';
    if (chat && typeof(chat) === 'object' && chat.id) chatId = chat.id;
    else if (chat && typeof(chat) === 'string') chatId = chat;
    else {
      error('ChatService :: chatReport. Could not report about chat. Chat: ', chat);
      if (isCallback) return cb('ChatService :: chatReport. Could not report about chat.');
      else return undefined;
    }

    if (!$rootScope.user || !$rootScope.user.id) {
      error('ChatService :: chatReport. User is undefined');
      if (isCallback) return cb();
      else return undefined;
    }

    new Report
      .$save({
        user: $rootScope.user.id,
        type: 'chat',
        chat: chatId
      })
      .catch(function(err){
        error('ChatService :: chatReport. Could not save new report.', err);
        $rootScope.alertError(0, 'Unable to send report', 'Please try again later');
        if (isCallback) return cb(err);
        else return undefined;
      })
      .finally(function(){
        var timeEnd = +new Date();
        if ((timeEnd - timeStart) < 400) return $timeout(_callback, 400);
        else return _callback();
      });

    function _callback(){
      $rootScope.alert('Reported', 'This chat has been reported and will be reviewed by our moderators.');
      if (isCallback) return cb();
      else return undefined;
    }

    return undefined;
  }





  function emit(type, data){
    return $timeout(function(){
      if (!$sails || !$sails._raw || !$sails._raw.emit) return error('ChatService :: emit. $sails is not defined.', $sails, arguments);
      else return $sails._raw.emit(type, data);
    }, 50);
  }




  return this;
}