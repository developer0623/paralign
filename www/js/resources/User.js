ParalignAppResources
  .factory('User', ['$resource', 'ServerUrl', 'CacheFactory', '$q', '$http', UserResource]);



function UserResource ($resource, ServerUrl, CacheFactory, $q, $http) {
  var loggedUserCache = undefined;

  if (!CacheFactory.get('LoggedUser')) CacheFactory.createCache('LoggedUser', {});
  loggedUserCache = CacheFactory.get('LoggedUser');


  var User = $resource(
    ServerUrl + '/user',
    {
      id      : "@id",
      email   : "@email",
      password: '@password'
    },
    {
      update: {
        url: ServerUrl + '/user/updateProperties',
        method:'POST',
        isArray: false
      },
      query: {
        url: ServerUrl + '/user',
        method:'GET',
        isArray: true
      },
      findOne: {
        url: ServerUrl + '/user/findOne/:id',
        method:'GET',
        isArray: false
      },
      getThoughts: {
        url: ServerUrl + '/user/getThoughts/:id',
        method:'GET',
        isArray: true
      },
      getUsersChats: {
        url: ServerUrl + '/user/getUsersChats/:id',
        method:'GET',
        isArray: true
      },

      login: {
        url: ServerUrl + '/auth/login',
        method:'POST',
        isArray: false
      },
      loginEmail: {
        url: ServerUrl + '/auth/loginEmail',
        method:'GET',
        isArray: false
      },
      loginAnonymous: {
        url: ServerUrl + '/auth/loginAnonymous',
        method:'POST',
        isArray: false
      },
      loginFacebook: {
        url: ServerUrl + '/auth/loginFb',
        method:'POST',
        isArray: false
      },
      loginGoogle: {
        url: ServerUrl + '/auth/loginGoogle',
        method:'POST',
        isArray: false
      },
      logout: {
        url: ServerUrl + '/auth/logout',
        method:'GET',
        isArray: false
      },
      resetPassword: {
        url: ServerUrl + '/auth/resetPassword',
        method:'GET',
        isArray: false
      },
      updatePassword: {
        url: ServerUrl + '/user/updatePassword',
        method:'GET',
        isArray: false
      },
      addDeviceUUID: {
        url: ServerUrl + '/user/addDeviceUUID',
        method:'GET',
        isArray: false
      },
      addDeviceToken: {
        url: ServerUrl + '/user/addDeviceToken',
        method:'GET',
        isArray: false
      },
      get_loggedUser: {
        url: ServerUrl + '/user/get_loggedUser',
        method:'POST',
        isArray: false
      },

      generateRandomNickname: {
        url: ServerUrl + '/user/generateRandomNickname',
        method:'GET',
        isArray: false
      },
      getSimilarMinds: {
        url: ServerUrl + '/user/getSimilarMinds/:id',
        method:'GET',
        isArray: true
      },
      removeSimilarMinds: {
        url: ServerUrl + '/user/removeSimilarMinds/:id',
        method:'GET',
        isArray: true
      }
    }
  );



  var methods = {
    refreshSimilarMinds     : refreshSimilarMinds,
    putSimilarMindsToCache  : putSimilarMindsToCache,
    getSimilarMindsFromCache: getSimilarMindsFromCache,
    clearCache              : clearCache
  };




  function refreshSimilarMinds(userID, cb){
    var isCallback = typeof(cb) === 'function';
    var requestData = {
      method: 'GET',
      url: ServerUrl + '/user/getSimilarMinds/' + userID
    };

    $http(requestData)
      .then(function(resp){
        putSimilarMindsToCache(resp.data);
        if (isCallback) return cb(null, resp.data);
        else return undefined;
      })
      .catch(function(err){
        if (isCallback) return cb(err);
        else return error('UserService :: refreshSimilarMinds :: getSimilarMinds.', err);
      });
  }




  function putSimilarMindsToCache(similarMinds){
    return loggedUserCache.put('SimilarMinds', similarMinds);
  }



  function getSimilarMindsFromCache(userID){
    var deferred     = $q.defer();
    var similarMinds = loggedUserCache.get('SimilarMinds');

    if (!similarMinds) {
      if (!userID) return deferred.resolve([]);
      refreshSimilarMinds(userID, function(err, similarMinds){
        deferred.resolve(similarMinds);
      });
    } else {
      deferred.resolve(similarMinds);
    }
    return deferred.promise;
  }


  function clearCache(){
    return loggedUserCache.removeAll();
  }



  angular.extend(User.prototype, methods);

  return new User();
}