ParalignAppDirectives.directive('newThoughtPen', ['$timeout', newThoughtPen]);

function newThoughtPen($timeout) {
  return {
    link: function(scope, element, attrs) {
      var el = angular.element( element );
      $timeout(function(){
        el.addClass('flip');
        $timeout(function(){
          el.removeClass('flip');
          el.addClass('zoomOutUp');
        }, 900);
      }, 300);
    }
  };
}
