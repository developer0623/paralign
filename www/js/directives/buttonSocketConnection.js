ParalignAppDirectives.directive('buttonSocketConnection', ['$rootScope', '$timeout', buttonSocketConnection]);

function buttonSocketConnection($rootScope, $timeout) {
  return {
    restrict: 'E',
    replace: true,
    transclude: true,
    template: '' +
      '<button class="button button-icon button-socket-connection button-clear hidden">' +
        '<i ng-if="!isSocketConnected"' +
           'class="fadein button-icon icon button button-clear">Bad connection</i>' +
      '</button>',
    link: function(scope, element) {
      var el = angular.element( element );
      $timeout(function(){
        el.removeClass('hidden');
      }, 1000);
    }
  }
}

