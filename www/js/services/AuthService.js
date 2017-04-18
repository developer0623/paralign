ParalignAppServices.service('AuthService', ['$rootScope', '$cordovaOauth', 'ThoughtService', 'User', 'ChatService', 'SocketService', 'GOOGLE_AUTH_ID', '$serverConsole', AuthService]);


function AuthService ($rootScope, $cordovaOauth, ThoughtService, User, ChatService, SocketService, GOOGLE_AUTH_ID, $serverConsole) {
  "use strict";

  var self = this;

  this.login_anonymous    = login_anonymous;
  this.login_email        = login_email;
  this.login_facebook     = login_facebook;
  this.login_google       = login_google;
  this.fb_getLastStatus   = fb_getLastStatus;
  this.updateUserPassword = updateUserPassword;
  this.logout             = logout;






  function login_anonymous(_user, cb){
    ChatService.clearCache();

    new User
      .$loginAnonymous()
      .then(function(res) {
        if (res['err'] || !res.user){
          $serverConsole.error('AuthService :: login_anonymous.', res);
          return cb('Failed create anonymous user.');
        }
        res.user.login_provider = 'anonymous';
        $rootScope.user = res.user;
        return cb(null, res.user);
      }, function(err){
        $serverConsole.error('AuthService :: login_anonymous.', err);
        return cb('Failed create anonymous user.');
      });
  }




  function login_email(_user, cb){
    ChatService.clearCache();

    new User
      .$loginEmail(_user)
      .then(function(res) {
        if (res['err'] || !res.user){
          console.error('AuthService :: login_email.', res);
          return cb(res['err']);
        }
        res.user.login_provider = 'email';
        $rootScope.user = res.user;
        return cb(null, res.user, res.token);
      }, function(res){
        console.error('AuthService :: login_email.', res);
        return cb('Failed create user.');
      });
  }






  function login_facebook(_user, cb) {
    ChatService.clearCache();

    try {
      if (!facebookConnectPlugin) return cb('Facebook plugin is not defined. Please choose another method of authentication.');
    } catch (e){
      return cb('Facebook plugin is not defined. Please choose another method of authentication.');
    }

    facebookConnectPlugin.login(
      ['email', 'public_profile', 'user_about_me', 'user_status'],
      function(response){
        if (!response || !response['authResponse'] || !response['authResponse'].accessToken) {
          console.error("AuthService :: login_facebook. Bad response.", response);
          return cb('Failed connect with Facebook.');
        }

        new User
          .$loginFacebook({
            accessToken: response['authResponse'].accessToken
          })
          .then(function(res) {
            if (res['err']) {
              console.error("AuthService :: login_facebook. Failed login.", res['err']);
              return cb('Error of authentication.');
            }
            else if (!res.user) {
              return cb('User is not defined.');
            }
            res.user.login_provider = 'facebook';
            $rootScope.user = res.user;

            self.fb_getLastStatus(function(err, lastStatus){
              if (lastStatus) ThoughtService.cacheThought(lastStatus);
              return cb(null, res.user);
            });
            return undefined;
          }, function(err){
            if (err && err['errorMessage'] !== "User cancelled dialog") {
              $serverConsole.error("AuthService :: login_facebook.", err);
              $rootScope.alertError(2, 'Authentication error', err['errorMessage']);
            }
            return cb('Error of authentication.');
          });
        return undefined;
      },
      function(err){
        error("AuthService :: login_facebook. Or Error or cancel Facebook login.", err);
        return cb();
      }
    );
    return undefined;
  }






  function fb_getLastStatus(cb){
    try {
      if (!facebookConnectPlugin) return cb('Facebook plugin is not defined. Please choose another method of authentication.');
    } catch (e){
      return cb('Facebook plugin is not defined. Please choose another method of authentication.');
    }

    facebookConnectPlugin.api('/me/feed', [], function(res){
      if (!res || !res.data || !res.data.length) return cb();
      var lastStatus = getLastStatus(res.data);
      return cb(null, lastStatus);
    }, function(err){
      $serverConsole.error("AuthService :: fb_getLoginStatus.", err);
      return cb(err);
    });

    function getLastStatus(array){
      if (!Array.isArray(array)) return undefined;
      var result = undefined;
      for (var j=0; j<array.length; j++){
        if (array[j] && array[j].message) {
          result = array[j].message;
          break;
        }
      }
      return result;
    }
    return undefined;
  }





  function login_google(_user, cb){
    ChatService.clearCache();

    try {
      if (!$cordovaOauth || !$cordovaOauth.google) return cb('Google+ plugin is not defined. Please choose another method of authentication.');
    } catch (e){
      return cb('Google+ plugin is not defined. Please choose another method of authentication.');
    }

    $cordovaOauth.google(GOOGLE_AUTH_ID, ["email"]).then(function(result) {
      if (!result.access_token) return cb('Could not get access. Please try again later.');

      new User
        .$loginGoogle({accessToken: result.access_token})
        .then(function(res) {
          if (res['err']) {
            $serverConsole.error("AuthService :: login_google :: $loginGoogle. Failed login. ", res['err']);
            return cb('Error of authentication.');
          }
          else if (!res.user) {
            return cb('User is not defined.');
          }
          res.user.login_provider = 'google';
          $rootScope.user = res.user;
          return cb(null, res.user);
        })
        .catch(function(err){
          $serverConsole.error("AuthService :: login_google :: $loginGoogle.", err);
          return cb('Error of authentication.');
        });

    }, function(err) {
      if (err === 'The sign in flow was canceled') return cb();
      $serverConsole.error("AuthService :: login_google.", err);
      return cb('Error of authentication.');
    });
    return undefined;
  }







  function logout(userId, login_provider, isAnonymous, cb) {
    var isCallback = typeof(cb) === 'function';

    if (!userId) {
      $serverConsole.error('AuthService :: logout. User is undefined');
      if (isCallback) return cb();
      return undefined;
    }

    switch (login_provider) {
      case 'anonymous' : logout_anonymous(); break;
      case 'email'     : logout_email(); break;
      case 'facebook'  : logout_facebook(); break;
      case 'google'    : logout_google(); break;
      default: logout_anonymous(); break;
    }



    function logoutCallback(){
      $rootScope.user = null;

      try {
        ChatService.clearCache();
        User.clearCache();
        ThoughtService.cacheThought('');
        ThoughtService.clearCache('Thoughts');
        ThoughtService.clearCache('Clusters');
      } catch (e){
        $serverConsole.error('AuthService :: logout :: logoutCallback.', e);
      }

      new User
        .$logout()
        .catch(function(err){
          $serverConsole.error('AuthService :: logout. GET logout', err);
          if (isCallback) return cb(err);
          return undefined;
        })
        .finally(function(){
          if (isCallback) return cb();
          return undefined;
        });

      SocketService.logout(userId, function(error){
        if (error) $serverConsole.error('AuthService :: logout. Socket logout', error);
      });
    }



    function logout_anonymous(){
      return logoutCallback();
    }



    function logout_email(){
      return logoutCallback();
    }



    function logout_facebook(){
      try {
        if (facebookConnectPlugin) {
          facebookConnectPlugin.logout(
            function(){
              return logoutCallback();
            },
            function(err){
              $serverConsole.error("AuthService :: logout :: logout_facebook. Error facebook logout", err);
              return logoutCallback(err);
            });
        } else {
          $serverConsole.error("AuthService :: logout :: logout_facebook. Error facebook logout. Plugin is not defined. ");
          $rootScope.alertError(1, 'Logout failed', 'Facebook plugin is not defined. Please restart the app');
          return logoutCallback();
        }
      } catch (e){
        $serverConsole.error("AuthService :: logout :: logout_facebook. Error facebook logout. ", e);
        return logoutCallback(e);
      }
    }



    function logout_google(){
      logoutCallback();
    }

    return undefined;
  }





  function updateUserPassword(email, newPassword, token, cb){
    if (!email) return cb('Email is undefined');
    if (!newPassword) return cb('New password is undefined');
    if (!token) return cb('Token is undefined');
    return undefined;
  }





  return this;
}