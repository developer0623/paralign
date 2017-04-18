ParalignAppDirectives

  .directive("screenShot", ['$rootScope', '$cordovaSocialSharing',
    function ($rootScope, $cordovaSocialSharing) {

      return {
        restrict: "A",
        scope   : {
          myid: '@'
        },
        link    : function (scope, element, attr) {
          //
          //$(document).ready(function () {
          //  element.bind('click', onClick);
          //});
          //
          //function onClick(e) {
          //  var elemId = e.target.getAttribute("index");
          //  document.getElementById("waterMark" + elemId).style.display = "inline";
          //  $rootScope.trackEvent('similarshare');
          //
          //  // TODO: move it to a service
          //  html2canvas(document.getElementById("widget" + elemId), {
          //    useCORS   : true,
          //    allowTaint: false,
          //    onrendered: function (canvas) {
          //      var ctx                         = canvas.getContext('2d');
          //      ctx.webkitImageSmoothingEnabled = false;
          //      ctx.mozImageSmoothingEnabled    = false;
          //      ctx.imageSmoothingEnabled       = false;
          //
          //      var data = canvas.toDataURL("image/png ");
          //
          //      $cordovaSocialSharing
          //        .share(null, 'myScreenShot', data, null)
          //        .then(function (result) {
          //          document.getElementById("waterMark" + elemId).style.display = "none";
          //        }, function (err) {
          //          console.error('Error', err)
          //        });
          //    }
          //  });
          //}


        }
      }
    }]);
