ParalignAppDirectives
  .directive('attachBottomIfKeyboardOpen', attachBottomIfKeyboardOpen);

/*
* This directive attaches an element to the keyboard when
* it is opened. Or you can specify a distance between the
* element and keyboard when the keyboard is opened or closed.
*
* Example:
* <ion-footer-bar attach-bottom-if-keyboard-open
*                 attach-when-opened="0"
*                 attach-when-closed="50">
* </ion-footer-bar>
* */

attachBottomIfKeyboardOpen.$inject = ['$window', '$ionicScrollDelegate'];

function attachBottomIfKeyboardOpen($window, $ionicScrollDelegate) {
  return {
    restrict: 'A',
    link: function (scope, element, attrs) {
      var openedHeight           = attrs.attachWhenOpened || '0';
      var closedHeight           = attrs.attachWhenClosed || '0';
      var keyboardTopPanelHeight = 0;


      angular.element($window).on('native.keyboardshow', keyboardshow);
      function keyboardshow (el) {
        var keyboardHeight = el.keyboardHeight;
        element[0].style.bottom = (Number(openedHeight) + keyboardHeight - keyboardTopPanelHeight) + 'px';
        $ionicScrollDelegate.resize();
        $ionicScrollDelegate.scrollBottom(true);
      }


      angular.element($window).on('native.keyboardhide', keyboardhide);
      function keyboardhide() {
        element[0].style.bottom = closedHeight + 'px';
        $ionicScrollDelegate.resize();
        $ionicScrollDelegate.scrollBottom(true);
      }


      scope.$on('$destroy', function() {
        angular.element($window).unbind('native.keyboardshow', keyboardshow);
        angular.element($window).unbind('native.keyboardhide', keyboardhide);
      });
    }
  };
}