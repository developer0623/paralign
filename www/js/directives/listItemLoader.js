
// <list-item-loader is-show="true" duration="500"></list-item-loader>

ParalignAppDirectives.directive('listItemLoader', ['$interval', listItemLoader]);

function listItemLoader($interval) {
  return {
    restrict: 'E',
    template: '' +
      '<ion-item class="item-loader">' +
        '<ion-spinner icon="spiral"></ion-spinner>' +
      '</ion-item>',
    scope: {
      isHide  : '=',
      duration: '=',
      delay   : '='
    },
    controller: function ($scope, $element) {
      var el = angular.element($element).find('ion-item');
      var duration = $scope.duration || 1000;
      var delay    = $scope.delay || 5;


      $scope.init      = init;
      $scope.appear    = appear;
      $scope.disappear = disappear;

      angular.element(document).ready(function () {
        init(el, duration, delay);
      });


      return this;





      function init(_el, _duration, _delay){
        var height = _el[0].offsetHeight;

        var watcherIsHide = $scope.$watch('isHide', function(val){
          if (val == true) disappear(_el, height, _duration, _delay);
          //else appear(_el, height, _duration, _delay);
        });

        $scope.$on('$destroy', function() {
          watcherIsHide();
        });
      }







      function animate(opts) {
        var start = new Date;

        var id = $interval(function() {
          var timePassed = new Date - start;
          var progress = timePassed / opts.duration;
          if (progress > 1) progress = 1;

          var delta = opts.delta(progress);
          opts.step(delta);

          if (progress == 1) {
            $interval.cancel(id)
          }
        }, opts.delay || 10)
      }


      function effect_bounce(progress) {
        for(var a = 0, b = 1; 1; a += b, b /= 2) {
          if (progress >= (7 - 4 * a) / 11) {
            return -Math.pow((11 - 6 * a - 11 * progress) / 4, 2) + Math.pow(b, 2);
          }
        }
      }



      function effect_makeEaseOut(delta) {
        return function(progress) {
          return 1 - delta(1 - progress);
        }
      }




      function appear(_el, _height, _duration, _delay){
        error('directive "listItemLoader" has no method "appear" yet');
      }




      function disappear(_el, _height, _duration, _delay){
        var bounceEaseOut = effect_makeEaseOut(effect_bounce);

        animate({
          delay: _delay || 5,
          duration: _duration || 1000, // 1 sec by default
          delta: bounceEaseOut,
          step: function(delta) {
            _el.css('height', (_height - (_height * delta)) + 'px');
          }
        });
      }

    }
  };
}