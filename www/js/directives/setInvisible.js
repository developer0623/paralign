ParalignAppDirectives.directive('setInvisible', ['$timeout', setInvisible]);


function setInvisible($timeout) {
  return {
    restrict: 'A',
    scope: {
      setInvisible: '='
    },
    link: function($scope, $element) {
      var el = angular.element( $element );

      init();
      return this;



      function init(){
        var watcher = $scope.$watch('setInvisible', function(val){
          return setValue(val);
        });

        $scope.$on('$destroy', function() {
          watcher();
        });
      }



      function setValue(val){
        var value = val == true ? 'hidden' : 'visible';
        $timeout(function () {
          el.css('visibility', value);
        }, 0);
      }

    }
  }
}