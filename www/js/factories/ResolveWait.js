ParalignAppFactories
  .factory('ResolveWait', ['$rootScope', '$timeout', ResolveWait]);


function ResolveWait ($rootScope, $timeout) {
  function wait(arrayPromises, cb){
    if (!arrayPromises) return console.error('ResolveWait factory array of promises is undefined.');

    var length        = get_length(arrayPromises);
    var finishTimeout = 60 * 1000;
    var isFinished    = false;
    $rootScope.doneCounter = 0;
    $rootScope.watchers    = [];
    $rootScope.resolveWait_items = [];
    angular.forEach(arrayPromises, set_watcher);


    function set_watcher (promise, i){
      if (!promise || !promise.hasOwnProperty('$resolved')) return;
      $rootScope.resolveWait_items[i] = promise;
      var watcherResolve = $rootScope.$watch('resolveWait_items[' + i + '].$resolved', function(resolved){
        if (resolved) $rootScope.doneCounter +=1;
      }, true);

      var watcherReject = $rootScope.$watch('resolveWait_items[' + i + '].$promise.$$state.status', function(status){
        if (status === 2) {
          $rootScope.doneCounter +=1;
          errorHandler('Object not found.', $rootScope.resolveWait_items[i]);
        }
      }, true);

      $rootScope.watchers.push(watcherResolve);
      $rootScope.watchers.push(watcherReject);
    }



    function errorHandler (message, data){
      return console.error('ResolveWait service error. ', message, data);
    }



    function get_length (array) {
      var _length = 0;
      for (var i = 0; i < array.length; i++) {
        if (array[i] && array[i].hasOwnProperty('$resolved')) _length++;
      }
      return _length;
    }



    var unbindWatcherCounter = $rootScope.$watch('doneCounter', function(count){
      if (count === length) {
        isFinished = true;
        angular.forEach($rootScope.watchers, function(unbindWatcher){
          if (unbindWatcher && typeof(unbindWatcher) === 'function') return unbindWatcher();
        });
        $rootScope.resolveWait_items = [];
        $rootScope.watchers  = [];
        unbindWatcherCounter();
        $rootScope.doneCounter = 0;
        return cb();
      }
    }, true);



    $timeout(function(){
      if (!isFinished) return cb(true);
      return undefined;
    }, finishTimeout);
  }

  return wait;
}

