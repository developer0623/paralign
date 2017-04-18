ParalignAppResources
  .factory('Chat', ['$resource', 'ServerUrl', ChatResource]);



function ChatResource ($resource, ServerUrl) {

  var Chat = $resource(
    ServerUrl + '/chat/:id',
    null,
    {
      update: { method: 'PUT' },
      query: {
        url: ServerUrl + '/chat',
        method: 'GET',
        isArray: true
      },
      findById: {
        url: ServerUrl + '/chat/findById/:id',
        method: 'GET',
        isArray: false
      },
      findOrCreate: {
        url: ServerUrl + '/chat/findOrCreate',
        method: 'POST',
        isArray: false
      },
      queryMessages: {
        url: ServerUrl + '/chat/queryMessages',
        method: 'GET',
        isArray: true
      },
      addMessage: {
        url: ServerUrl + '/message/addMessage',
        method: 'POST',
        isArray: false
      },
      leave: {
        url: ServerUrl + '/chat/leave/:id',
        method: 'GET',
        isArray: false
      },
      lock: {
        url: ServerUrl + '/chat/lock/:chatID/:userID',
        method: 'GET',
        isArray: false
      },
      unlock: {
        url: ServerUrl + '/chat/unlock/:chatID/:userID',
        method: 'GET',
        isArray: false
      }
    }
  );

  return new Chat();
};