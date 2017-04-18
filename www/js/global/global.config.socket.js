/*
* This is a fix for sockets in sails.js
* It should be included before sails.io.js (or socket.io.js)
* */

var socketHost = ENV_SERVER_URL;

(function setSocketUrl(_url){
  var io;
  Object.defineProperty(window, 'io', {
    get: function (){
      return io;
    },
    set: function (value){
      var sails;
      io = value;
      Object.defineProperty(io, 'sails', {
        get: function (){
          return sails;
        },
        set: function (value){
          sails     = value;
          sails.url = _url;
          sails.useCORSRouteToGetCookie = false;
          sails.autoConnect = false;
          sails.transports  = ['websocket'];
        }
      });
    }
  });
})(socketHost);