ParalignAppControllers.controller('MyMindsCtrl', ['$rootScope', '$scope', '$stateParams', 'User', 'Thought', 'ThoughtService', '$timeout', '$serverConsole', '$q', '$ionicPopover', MyMindsCtrl]);


function MyMindsCtrl ($rootScope, $scope, $stateParams, User, Thought, ThoughtService, $timeout, $serverConsole, $q, $ionicPopover) {
  $scope.isFirstLoading    = true;
  $scope.selectedThought   = undefined;
  $scope.selectedCluster   = undefined;
  $scope.processingThought = undefined;
  $scope.myMindsList       = [];
  $scope.myMindsClusters   = [];
  $scope.isMoreDataCanBeLoaded = true;

  $scope.currentTemplate = undefined;
  $scope.pageTemplate    = undefined;
  $scope.templates       = {
    list   : 'pages/myMinds/tmplt-list.html',
    cluster: 'pages/myMinds/tmplt-cluster.html'
  };

  $scope.fetch_partSize = 30;
  $scope.fetch_skip     = 8;


  $scope.init                           = init;
  $scope.prepareList                    = prepareList;
  $scope.switchModeTo                   = switchModeTo;
  $scope.selectThought                  = selectThought;
  $scope.deselectThought                = deselectThought;
  $scope.partialLoading                 = partialLoading;
  $scope.mergeWithNewData               = mergeWithNewData;
  $scope.loadMore                       = loadMore;
  $scope.isOtherMonth                   = isOtherMonth;
  $scope.openCluster                    = openCluster;
  $scope.getSortedMinds                 = getSortedMinds;
  $scope.getUserThoughts                = getUserThoughts;
  $scope.getUserClusters                = getUserClusters;
  $scope.getNotAloneValue               = getNotAloneValue;
  $scope.getSelectedThought             = getSelectedThought;
  $scope.getThoughtsNClustersFromServer = getThoughtsNClustersFromServer;
  $scope.isSelectedThought              = isSelectedThought;
  $scope.openPopupSelectedThought       = openPopupSelectedThought;
  $scope.parseProcessingThought         = parseProcessingThought;
  $scope.isProcessingThoughtHasUploaded = isProcessingThoughtHasUploaded;
  $scope.getAverageIntensity            = getAverageIntensity;
  $scope.getAverageMood                 = getAverageMood;

  $scope.isCaseToEnableInfiniteScroll = isCaseToEnableInfiniteScroll;
  $scope.isCaseToGoHome               = isCaseToGoHome;
  $scope.isCaseEmptyList              = isCaseEmptyList;
  $scope.isCaseEmptyClusters          = isCaseEmptyClusters;
  $scope.isCaseToShowDateItem         = isCaseToShowDateItem;
  $scope.isCaseToShowProcessingFile   = isCaseToShowProcessingFile;



  var watcherViewEnter = $scope.$on('$ionicView.enter', $scope.init);
  $scope.$on('$destroy', watcherViewEnter);
  return this;













  function init(){
    var numberFetchTrying       = 0;
    var MAX_NUMBER_FETCH_TRYING = 2;

    $scope.switchModeTo('list');
    var cachedClusters = ThoughtService.getAllFromCache('Clusters');
    var cachedThoughts = ThoughtService.getAllFromCache('Thoughts');
    var thoughtsSorted = $scope.getSortedMinds(cachedThoughts).slice(0, $scope.fetch_skip +1);

    // show selected thought, for example after a Not Alone notification
    if ($stateParams.thought) {
      $scope.getSelectedThought($stateParams.thought, function (err, thought) {
        if (err) return error('Could not get selected thought', err);
        $scope.selectThought(thought);
      });
    }

    $scope.prepareList(thoughtsSorted, cachedClusters);
    if ($stateParams.processingThought) $scope.parseProcessingThought($stateParams.processingThought);


    return fetchData(function () {
      $scope.isFirstLoading = false;
    });


    /*
    * This function makes request to the server second time if the
    * first request was empty. ONLY when there is a selected thought
    * because the response could not be empty if there is a selected thought
    * */
    function fetchData(cb){
      numberFetchTrying++;
      if (numberFetchTrying >= MAX_NUMBER_FETCH_TRYING) return cb();
      $scope.getThoughtsNClustersFromServer(function () {
        if ($stateParams.thought && $scope.isCaseEmptyList() && $scope.isCaseEmptyClusters()) {
          return fetchData(cb);
        }
        return cb();
      });
    }
  }






  function getThoughtsNClustersFromServer(cb){
    var userThoughts = $scope.getUserThoughts();
    var userClusters = $scope.getUserClusters();

    function fn_then(value){ return value; }

    $q
      .all([userThoughts.then(fn_then), userClusters.then(fn_then)])
      .then(function(values){
        var thoughts = values[0];
        var clusters = values[1];
        $scope.prepareList(thoughts, clusters, function () {});
        return cb();
      });
  }






  function prepareList(UserThoughts, UserClusters, callback){
    var isCallback = typeof(callback) === 'function';
    UserThoughts = $scope.mergeWithNewData(UserThoughts, 'Thoughts').data;
    UserClusters = $scope.mergeWithNewData(UserClusters, 'Clusters').data;

    $scope.myMindsList     = $scope.getSortedMinds(UserThoughts);
    $scope.myMindsClusters = UserClusters;

    ThoughtService.updateCache($scope.myMindsList, 'Thoughts');
    ThoughtService.updateCache($scope.myMindsClusters, 'Clusters');
    return isCallback ? callback() : undefined;
  }






  function switchModeTo(mode){
    $scope.currentTemplate = mode;
    $scope.pageTemplate    = $scope.templates[mode];
  }




  function getSelectedThought(id, callback){
    if (!id) return callback('ID is undefined');

    new Thought
      .$findById({
        id: id
      }).then(function (data) {
        return callback(null, data);
      })
      .catch(callback);
  }




  function isSelectedThought(thought){
    return $scope.selectedThought && $scope.selectedThought.id !== thought.id;
  }



  function selectThought(thought) {
    $scope.selectedThought = thought;
    $scope.openPopupSelectedThought(thought);
  }


  function deselectThought() {
    $scope.selectedThought = undefined;
    $timeout(function () {
      if ($rootScope.popover) {
        $rootScope.popover.remove();
        $rootScope.popover = null;
      }
    }, 300);
  }



  function openPopupSelectedThought(thought){
    if (!thought) return undefined;

    $ionicPopover
      .fromTemplateUrl("pages/myMinds/popover-selected-thought.html", {
        scope: $scope
      }).then(function(popover) {
        $rootScope.popover = popover;
        popover.show();
      });
  }







  function parseProcessingThought(thought){
    if (!thought) return undefined;

    var thght = undefined;
    try {
      thght = JSON.parse(thought);
    } catch (e){
      error('Could not parse "Processing Thought"', thought);
      return undefined;
    }

    thght.id        = new Date().valueOf();
    thght.createdAt = new Date().toISOString();
    thght.notAlones = [];
    return $scope.processingThought = thght;
  }







  function isProcessingThoughtHasUploaded(){
    if (!$scope.processingThought) return undefined;
    var lastThought = $scope.myMindsList[0];
    var procThought = $scope.processingThought;

    if (!lastThought || !procThought) return false;

    return procThought.content == lastThought.content &&
           procThought.intensity == lastThought.intensity &&
           procThought.mood == lastThought.mood;
  }






  function getAverageIntensity(cluster){
    if (!cluster || !cluster.thoughts) return undefined;

    var thoughts = cluster.thoughts;
    var arrayInt = [];

    for (var i=0; i < thoughts.length; i++){
      var thought = thoughts[i];
      if (thought && thought.intensity) arrayInt.push(Number(thought.intensity));
    }

    var sum = arrayInt.reduce(function(a, b) { return a + b; });
    var avg = sum / arrayInt.length;
    return Math.ceil(avg);
  }

 function getAverageMood(cluster){
    if (!cluster || !cluster.thoughts) return undefined;

    var thoughts = cluster.thoughts;
    var mood_freq = {};
    for (var i=0; i < thoughts.length; i++){
      var thought = thoughts[i];
      mood_freq[thought.mood] = 0;
    }

    for (var i=0; i < thoughts.length; i++){
      var thought = thoughts[i];
      mood_freq[thought.mood] = mood_freq[thought.mood] + 1;
    }

    var mood = Object.keys(mood_freq).reduce(function(a, b){ return mood_freq[a] > mood_freq[b] ? a : b });
    if (mood_freq[mood] === 1 && thoughts.length > 1 ){
      return " "
    }
    return mood  
    
  }




  function mergeWithNewData(data, type){
    var result = {
      data   : [],
      changed: false
    };
    var currentIDs = [];
    if (type == 'Thoughts'){
      result.data = $scope.myMindsList;
      currentIDs  = _.pluck($scope.myMindsList, 'id');
    } else {
      result.data = $scope.myMindsClusters;
      currentIDs  = _.pluck($scope.myMindsClusters, 'createdAt');
    }

    var dataIDs     = _.pluck(data, 'id');
    var differences = _.difference(dataIDs, currentIDs);


    angular.forEach(data, function(item){
      var id = type == 'Thoughts' ? item.id : item.createdAt;
      var indexItem = currentIDs.indexOf(id);

      if (id && indexItem === -1) {
        result.changed = true;
        result.data.push(item);
      }
      else {
        if (type == 'Thoughts' && indexItem !== -1){
          var _item = $scope.myMindsList[indexItem];
          _item.notAlones = item.notAlones;
        }
      }
    });

    angular.forEach(differences, function(diffCon){
      result.changed = true;
      var index = currentIDs.indexOf(diffCon);
      if (index > -1) {
        if (type == 'Thoughts'){
          result.data.splice(index, 1);
          ThoughtService.removeFromCache(diffCon, 'Thoughts');
        } else {
          result.data.splice(index, 1);
          ThoughtService.removeFromCache(diffCon, 'Clusters');
        }
      }
    });
    return result;
  }








  function loadMore(){
    if ($scope.isMoreDataCanBeLoaded === false) $scope.$broadcast('scroll.infiniteScrollComplete');
    $scope.partialLoading($scope.fetch_partSize, $scope.fetch_skip, function(){
      $scope.$broadcast('scroll.infiniteScrollComplete');
    });
  }





  function isOtherMonth(currentThought, previousThought){
    if (!currentThought || !currentThought.createdAt || !previousThought || !previousThought.createdAt) return false;
    var current  = moment(currentThought.createdAt);
    var previous = moment(previousThought.createdAt);
    var currentMonth  = current.month();
    var currentYear   = current.year();
    var previousMonth = previous.month();
    var previousYear  = previous.year();
    if (currentYear === previousYear && currentMonth !== previousMonth) return true;
    else if (currentYear > previousYear || currentYear < previousYear) return true;
    else return false
  }





  function openCluster(cluster){
    if (!cluster) return undefined;
    $scope.selectedCluster = cluster;
    $scope.switchModeTo('cluster');
  }




  function getSortedMinds(array){
    if (!array || !array.length) return [];
    return array.sort(function (a,b){
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
  }




  function getNotAloneValue(thought){
    if (!thought || !Array.isArray(thought.notAlones)) return '0';
    return thought.notAlones.length;
  }



  
  
  
  function partialLoading(partSize, skip, callback){
    $scope.fetch_skip += partSize;

    if (!$rootScope.user || !$rootScope.user.id) {
      $serverConsole.error('MyMindsCtrl :: partialLoading. User is not defined');
      return callback('User is not defined');
    }

    ThoughtService.fetchMyMinds($rootScope.user.id, skip, partSize, function(err, thoughts){
      if (!Array.isArray(thoughts) || !thoughts.length) $scope.isMoreDataCanBeLoaded = false;
      else {
        var mergedData = $scope.mergeWithNewData(thoughts, 'Thoughts');
        if(mergedData.changed) {
          $scope.myMindsList = $scope.getSortedMinds(mergedData.data);
          ThoughtService.updateCache(mergedData.data, 'Thoughts');
        }
      }
      return callback();
    });
  }





  function getUserThoughts() {
    var deferred = $q.defer();

    if (!$rootScope.user || !$rootScope.user.id) {
      $rootScope.alertError(0, 'Oops!', 'Seems to you are not logged in.');
      deferred.resolve([]);
      return deferred.promise;
    }

    return new Thought
      .$query({
        user: $rootScope.user.id,
        sort: '_id desc',
        limit: $scope.fetch_skip
      });
  }





  function getUserClusters() {
    var deferred = $q.defer();
    if (!$rootScope.user || !$rootScope.user.id) {
      $rootScope.alertError(0, 'Oops!', 'Seems to you are not logged in.');
      deferred.resolve([]);
    }
    else {
      new User
        .$findOne({id: $rootScope.user.id})
        .then(function(user){
          if (!user || !user['thoughts_clusters']) return deferred.resolve([]);
          else return deferred.resolve(user['thoughts_clusters']);
        })
        .catch(function(err){
          error('resolve :: getUserClusters :: User.$findOne.', err);
          $rootScope.alertError(3, 'Oops!', 'Could not get your thoughts. Please, try again.');
          return deferred.resolve([]);
        });
    }
    return deferred.promise;
  }








  function isCaseToEnableInfiniteScroll(){
    return $scope.isMoreDataCanBeLoaded && $scope.myMindsList && $scope.myMindsList.length;
  }


  function isCaseToGoHome(){
    return ($rootScope.$backState && $rootScope.$backState.name === 'newThought') || !!$scope.processingThought;
  }


  function isCaseEmptyList(){
    return !$scope.myMindsList || !$scope.myMindsList.length && !$scope.processingThought;
  }


  function isCaseEmptyClusters(){
    return !$scope.myMindsClusters || !$scope.myMindsClusters.length;
  }


  function isCaseToShowDateItem(){
    return $scope.processingThought && !$scope.isProcessingThoughtHasUploaded();
  }


  function isCaseToShowProcessingFile(){
    return $scope.processingThought && !$scope.isProcessingThoughtHasUploaded();
  }

}