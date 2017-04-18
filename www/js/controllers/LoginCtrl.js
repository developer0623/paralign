ParalignAppControllers
  .controller('LoginCtrl', ['$rootScope', '$scope', '$state', '$stateParams', '$timeout', 'AuthService', '$localStorage', 'User', LoginCtrl]);



function LoginCtrl($rootScope, $scope, $state, $stateParams, $timeout, AuthService, $localStorage, User) {
  $scope.authUser        = {};
  $scope.resetToken      = undefined;
  $scope.loginTemplate   = undefined;
  $scope.currentTemplate = undefined;
  $scope.templates       = {
    index          : 'tmplt-login-index',
    login_email    : 'tmplt-login-email',
    login_warning  : 'tmplt-login-warning',
    forgot_password: 'tmplt-forgot-password',
    new_password   : 'tmplt-new-password'
  };


  $scope.init                   = init;
  $scope.login                  = login;
  $scope.resetPassword          = resetPassword;
  $scope.goToLoginWarningOrHome = goToLoginWarningOrHome;
  $scope.goToUpdatePassword     = goToUpdatePassword;
  $scope.updatePassword         = updatePassword;
  $scope.switchModeTo           = switchModeTo;


  var watcherViewEnter = $scope.$on('$ionicView.loaded', $scope.init);
  $scope.$on('$destroy', watcherViewEnter);
  return this;







  function init(){
    $scope.switchModeTo('index');
  }






  function login(provider) {
    if (!provider) return error('Login provider is undefined');
    $rootScope.loadingOn('Login by ' + provider, true);

    var LoginFunction = AuthService['login_' + provider];
    if (!LoginFunction) {
      error('LoginCtrl :: login. Login function is undefined. Provider: ' + provider);
      return $rootScope.loadingOff();
    }

    if ($stateParams.mode === 'identificationAnonymous') {
      $scope.authUser.identificationAnonymous = true;
    }

    LoginFunction($scope.authUser, function(err, user, token_for_reset_password){
      $rootScope.loadingOff();
      if (err && typeof(err) === 'object') return $rootScope.alert('Login failed', err.message);
      if (err && typeof(err) === 'string') {
        switch (err){
          case 'User was authenticated by Facebook.': {
            $rootScope.alert(
              'Hi There :)',
              'Looks like you used Facebook login with this email, ' +
              'you can go back select Facebook Sign in',
              null,
              function(){
                $timeout(function(){
                  $scope.switchModeTo('index')
                }, 300);
              });
            break;
          }
          case 'User was authenticated by Google.': {
            $rootScope.alert('Hi There :)',
              'Looks like you used Google login with this email, ' +
              'you can go back select Google Sign in',
              null,
              function(){
                $timeout(function(){
                  $scope.switchModeTo('index')
                }, 300);
              });
            break;
          }
          default: $rootScope.alert('Hi There :)', err + ' Please try again.'); break;
        }
        return undefined;
      }
      if (!user) return undefined;
      if (user && user.id) $rootScope.setLoggedUserDetails(user);
      if (token_for_reset_password) return $scope.goToUpdatePassword(token_for_reset_password);

      $timeout(function(){
        $scope.authUser        = {};
        $scope.loginTemplate   = undefined;
        $scope.currentTemplate = undefined;
        if ($localStorage.get('trained')) return $state.go('home');
        else return $state.go('tutorial');
      }, 400);
      return undefined;
    });
  }








  function resetPassword(email) {
    if (!email) return $rootScope.alert('Error', 'Email is empty');
    $rootScope.loadingOn();

    new User
      .$resetPassword({email: email})
      .then(function(res){
        $rootScope.loadingOff();
        if (res['err']) {
          console.error('Error reset Password. ', res);
          return $rootScope.alertError(2, 'Error reset password', 'Please try again later.');
        }
        $rootScope.alert(
          'Email Sent',
          'An email has been sent with a link to reset your password.',
          null,
          function(){
            $timeout(function(){
              $scope.switchModeTo('login_email')
            }, 300);
          }
        );
        return undefined;
      })
      .catch(function(err){
        if (err && err.code === 204) {
          return $rootScope.alert(
            'Error reset password',
            'A user with this email was not found. Please try again.'
          );
        }
        console.error('Error reset Password. ', err);
        return $rootScope.alertError(2, 'Error reset password', 'Please try again later.');
      });
    return undefined;
  }








  function goToLoginWarningOrHome(){
    if ($stateParams.mode && $stateParams.mode === 'identificationAnonymous') return $state.go('home');
    else return $scope.switchModeTo('login_warning');
  }






  function goToUpdatePassword(token){
    if (!token) return $rootScope.alertError(2, 'Error update password', 'Please try again later.');
    $scope.resetToken = token;
    $scope.authUser.password = undefined;
    $scope.switchModeTo('new_password');
    return undefined;
  }






  function updatePassword(newPassword){
    if (!newPassword) return $rootScope.alertError(2, 'Error', 'New password is undefined.');
    if (!$rootScope.user || !$rootScope.user.id) {
      return $rootScope.alertError(2, 'Error', 'User is undefined. Please try again.');
    }
    if (!$scope.resetToken) {
      return $rootScope.alertError(2, 'Error', 'Secret token is undefined. Please try again.');
    }

    new User
      .$updatePassword({
        userID: $rootScope.user.id,
        newPassword: newPassword,
        token_for_reset_password: $scope.resetToken
      })
      .then(function(res){
        $rootScope.loadingOff();
        if (res['err']) {
          console.error('Error update password. ', res);
          return $rootScope.alertError(2, 'Error update password', 'Please try again.');
        }

        $rootScope.alert(
          'Password Updated',
          'Your password has been successfully updated!',
          'START ALIGNING',
          function(){
            $scope.authUser        = {};
            $scope.resetToken      = undefined;
            $scope.loginTemplate   = undefined;
            $scope.currentTemplate = undefined;
            $timeout(function(){
              $state.go('newThought');
            }, 300);
          }
        );
        return undefined;
      })
      .catch(function(err){
        console.error('Error update password. ', err);
        return $rootScope.alertError(2, 'Error update password', 'Please try again.');
      });
  }







  function switchModeTo(mode){
    $scope.currentTemplate = mode;
    $scope.loginTemplate = $scope.templates[mode];
  }


}