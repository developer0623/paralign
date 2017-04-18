ParalignAppServices.service('SessionService', ['$rootScope', '$state', '$http', 'ServerUrl', SessionService]);



function SessionService($rootScope, $state, $http, ServerUrl) {
  "use strict";
  var self = this;
  this.checkAccess   = checkAccess;
  this.getLoggedUser = getLoggedUser;
  this.refreshUser   = refreshUser;
  this.isAdmin       = isAdmin;



  return this;






  function checkAccess(event, toState, toParams, fromState, fromParams) {
    if (toState && toState.data && !!toState.data.noLogin) {
      /* do nothing */
    }
    else {
      if (!$rootScope.user) {
        event.preventDefault();
        $rootScope.getLoggedUser(function(user){
          if (user && user.id) {
            $rootScope.user = user;
            $rootScope.setLoggedUserDetails(user);
            return $state.go(toState.name, toParams);
          }
          else {
            return $state.go(fromState.name || 'login', fromParams);
          }
        });
      }
    }
    return undefined;
  }




  function getLoggedUser(cb){
    $http.get(ServerUrl + '/auth/loggedUser')
      .success(function(res){
        if (res && res.user && res.user.id) return cb(res.user);
        else return cb();
      })
      .error(function(res){
        console.error('Error get logged user. ', res);
        return cb(null);
      });
  }




  function refreshUser(cb){
    var isCallback = typeof(cb) === 'function';
    self.getLoggedUser(function(user){
      $rootScope.user = user;
      if (isCallback) return cb(null, user);
      else return undefined;
    });
  }



  function isAdmin(){
    return $rootScope.user && $rootScope.user.id && $rootScope.user.role === 'admin';
  }

}