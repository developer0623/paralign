ParalignAppServices.factory('$serverConsole', ['$rootScope', '$http', 'ServerUrl', $serverConsole]);


function $serverConsole ($rootScope, $http, ServerUrl) {
  "use strict";

  function getInfoOfDevice(){
    if (!$rootScope.platform || !$rootScope.deviceOSVersion) return undefined;
    return $rootScope.platform + ': ' + $rootScope.deviceOSVersion;
  }


  function sendMess(args){
    return $http({
      method: 'POST',
      url   : ServerUrl + '/log',
      data  : {
        message: args
      }
    });
  }


  return {
    log: function(){
      if (!$rootScope.serverLoggingOn) return undefined;
      console.log.apply(console, arguments);
      var args = [];
      angular.forEach(arguments, function(arg){
        args.push(arg);
      });
      return sendMess(args);
    },

    error: function(){
      if (!$rootScope.serverLoggingOn) return undefined;
      console.error.apply(console, arguments);
      var args = ['::ERROR'];
      var info = getInfoOfDevice();
      if (info) args.push(info);
      angular.forEach(arguments, function(arg){
        args.push(arg);
      });
      return sendMess(args);
    }
  };
}