ParalignAppDirectives.directive('fadein', ['$timeout', fadein]);

function fadein($timeout) {
  return {
    link: function(scope, element, attrs) {
      var el = angular.element( element );
      var display = el.css('display');
      var delay   = attrs.fadein;
      el.css('display', 'none');
      el.addClass('fadein');
      $timeout(function(){
        el.css('display', display);
      }, delay);
    }
  };
};