ParalignAppDirectives.directive('focusMe', ['$rootScope', '$timeout', focusMe]);

function focusMe($rootScope, $timeout) {
  return {
    link: function(scope, element, attrs) {
      var timeout = $rootScope.isAndroid ? 500 : 650;
      var delay   = attrs.focusMe || timeout;
      $timeout(function() {
        element[0].focus();
      }, delay);
    }
  };
};