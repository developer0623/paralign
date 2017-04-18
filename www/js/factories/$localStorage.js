ParalignAppFactories
  .factory('$localStorage', ['$window', $localStorage]);


function $localStorage ($window) {
  var localStorageDataPrefix = "prlgn_";

  return {
    set: function(key, value) {
      $window.localStorage[localStorageDataPrefix + key] = value;
    },

    get: function(key) {
      var value = $window.localStorage[localStorageDataPrefix + key];
      if (value === 'true') return true;
      if (value === 'false') return false;
      else return value;
    },

    setObject: function(key, value) {
      $window.localStorage[localStorageDataPrefix + key] = JSON.stringify(value);
    },

    getObject: function(key) {
      return JSON.parse($window.localStorage[localStorageDataPrefix + key] || '{}');
    }
  }
};