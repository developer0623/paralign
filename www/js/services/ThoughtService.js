ParalignAppServices
  .service('ThoughtService', ['$rootScope', '$localStorage', '$timeout', 'NotAlone', 'Thought', 'Report', '$serverConsole', 'CacheFactory', ThoughtService]);


function ThoughtService($rootScope, $localStorage, $timeout, NotAlone, Thought, Report, $serverConsole, CacheFactory) {
  "use strict";
  var self = this;

  this.CacheThoughts       = CacheFactory.createCache('Thoughts', {});
  this.CacheClusters       = CacheFactory.createCache('Clusters', {});

  this.cacheThought        = cacheThought;
  this.get_cachedThought   = get_cachedThought;
  this.createThought       = createThought;
  this.reportThought       = reportThought;
  this.set_notAlone        = set_notAlone;

  this.putToCache      = putToCache;
  this.getFromCache    = getFromCache;
  this.removeFromCache = removeFromCache;
  this.clearCache      = clearCache;
  this.getAllFromCache = getAllFromCache;
  this.updateCache     = updateCache;

  this.fetchWonderingMinds  = fetchWonderingMinds;
  this.fetchMyMinds         = fetchMyMinds;

  return this;





  function putToCache(id, value, type){
    if (!id) {
      error('ThoughtService :: putToCache. Thought/Cluster ID is not defined');
      return undefined;
    }
    if (type == "Thoughts"){
      return self.CacheThoughts.put(id, value);
    }
    else if(type == "Clusters"){
      return self.CacheClusters.put(id, value);
    }
    else {
      return undefined;
    }
  }






  function getFromCache(id, type){
    if (!id) {
      error('ThoughtService :: getFromCache. Chat ID is not defined');
      return undefined;
    }
    if (type == "Thoughts"){
      return self.CacheThoughts.get(id);
    }
    else if(type == "Clusters"){
      return self.CacheClusters.get(id);
    }
    else if(type == "WonderingMinds"){
      return self.CacheWonderingMinds.get(id);
    }
    else {
      return undefined;
    }
  }





  function updateCache(data, type){
    angular.forEach(data, function(item){
      if (type == "Thoughts") {
        self.putToCache(item.id, item, type);
      } else {
        self.putToCache(item.createdAt, item, type);
      }
    });
  }





  function removeFromCache(id, type){
    if (!id) {
      error('ThoughtService :: removeFromCache. Chat ID is not defined');
      return undefined;
    }
    if (type == "Thoughts"){
      self.removeFromCache(id);
      return self.CacheThoughts.remove(id);
    }
    else if(type == "Clusters"){
      self.removeFromCache(id);
      return self.CacheClusters.remove(id);
    }
    else {
      return undefined;
    }
  }




  function clearCache(type){
    if (type == "Thoughts"){
      self.CacheThoughts.removeAll();
      return self.CacheThoughts.removeAll();
    }
    else if(type == "Clusters"){
      self.CacheClusters.removeAll();
      return self.CacheClusters.removeAll();
    }
    else {
      return undefined;
    }
  }



  function getAllFromCache(type){
    if (type == "Thoughts"){
      return self.CacheThoughts.values();
    }
    else if(type == "Clusters"){
      return self.CacheClusters.values();
    }
    else {
      return undefined;
    }
  }






  function createThought(thought, cb){
    var isCallback = typeof(cb) === 'function';
    if (!thought) {
      $serverConsole.error('ThoughtService :: createThought. Could not create Thought.', arguments);
      if (isCallback) return cb('ThoughtService :: createThought. Could not create Thought.');
      else return undefined;
    }
    if (!thought.content) {
      if (isCallback) return cb('Could not create Thought. Content is empty.');
      else return undefined;
    }
    if (!$rootScope.isCorrectMood(thought.mood)) {
      if (isCallback) return cb('Could not create Thought. Mood is incorrect.');
      else return undefined;
    }
    if (!thought.user) thought.user = $rootScope.user ? $rootScope.user.id : undefined;

    new Thought
      .$save(thought, function(savedThought){
        if (!savedThought || !savedThought.id) {
          $serverConsole.error('ThoughtService :: createThought. Could not save new Thought.', arguments);
          if (isCallback) return cb('ThoughtService :: createThought. Could not save new Thought.');
          else return undefined;
        }
        $rootScope.refreshUser(function(){
          if (isCallback) return cb(null, savedThought);
          else return savedThought;
        });
        return undefined;
      })
      .catch(function(err){
        $serverConsole.error('ThoughtService :: createThought. Could not save new Thought.', arguments);
        if (isCallback) return cb('ThoughtService :: createThought. Could not save new Thought.');
        else return undefined;
      });
    return undefined;
  }





  function fetchMyMinds (userID, skip, limit, cb){
    if (!userID) return cb('User ID is not defined');
    new Thought
      .$query({user: userID, sort: '_id desc', skip: skip, limit: limit})
      .then(function(thoughts){
        return cb(null, thoughts);
      })
      .catch(function(err){
        $serverConsole.error('ThoughtService :: fetchMyMinds.', err);
        return cb(err);
      });
    return undefined;
  }




  function fetchWonderingMinds(query, skip, limit, cb){
    if (!$rootScope.user || !$rootScope.user.id) {
      $serverConsole.error('ThoughtService :: fetchWonderingMinds. User is undefined');
      return cb();
    }

    try {
      new Thought
        .$queryWonderingMinds({
          sort : '_id desc',
          skip : skip || 0,
          limit: limit || 0,
          where: query
        })
        .then(function(thoughts){
          return cb(null, thoughts);
        })
        .catch(function(err){
          $serverConsole.error('ThoughtService :: fetchWonderingMinds.', err);
          return cb(err);
        });
    } catch (e){
      $serverConsole.error('ThoughtService :: fetchWonderingMinds :: catch.', e);
      return cb(e);
    }
    return undefined;
  }





  function cacheThought(newThought){
    return $localStorage.set('cached_thought', newThought || '');
  }


  function get_cachedThought(){
    return $localStorage.get('cached_thought');
  }





  function set_notAlone(data, cb){
    var isCallback = typeof(cb) === 'function';
    if (!data || !data.thought) {
      $serverConsole.error('ThoughtService :: set_notAlone. Could not set NotAlone to thought.', arguments);
      if (isCallback) return cb('Could not set NotAlone to thought.');
      else return undefined;
    }
    if (!data.author) data.author = $rootScope.user ? $rootScope.user.id : undefined;
    if (data.createdAt) delete data.createdAt;

    new NotAlone
      .$save(data)
      .then(function(createdModel){
        if (!createdModel || !createdModel.id) {
          $serverConsole.error('ThoughtService :: set_notAlone :: $save. Could not save NotAlone.', arguments);
          if (isCallback) return cb('Could not set NotAlone to thought.');
          else return undefined;
        }
        if (isCallback) return cb(null, createdModel);
        else return createdModel;
      })
      .catch(function(err){
        $serverConsole.error('ThoughtService :: set_notAlone. Could not save NotAlone.', arguments);
        if (isCallback) return cb('Could not set NotAlone to thought.');
        else return undefined;
      });
    return undefined;
  }





  function reportThought(thought, cb){
    var thoughtId  = undefined;
    var timeStart  = +new Date();
    var isCallback = typeof(cb) === 'function';
    if (thought && typeof(thought) === 'object' && thought.id) thoughtId = thought.id;
    else if (thought && typeof(thought) === 'string') thoughtId = thought;
    else {
      $serverConsole.error('ThoughtService :: reportThought. Could not report about thought. Thought: ', thought);
      if (isCallback) return cb('Could not report about thought.');
      else return undefined;
    }

    if (!$rootScope.user || !$rootScope.user.id) {
      $serverConsole('ThoughtService :: reportThought. User is not defined');
      return cb('User is not defined');
    }

    new Report
      .$save({
        user   : $rootScope.user.id,
        type   : 'thought',
        thought: thoughtId
      })
      .catch(function(err){
        $serverConsole.error('ChatService :: reportThought. Could not save new report.', err);
        $rootScope.alertError(0, 'Unable to send report', 'Please try again later');
        if (isCallback) return cb(err);
        else return undefined;
      })
      .finally(function(){
        var timeEnd = +new Date();
        if ((timeEnd - timeStart) < 400) return $timeout(_callback, 400);
        else return _callback();
      });

    function _callback(){
      $rootScope.alert('Reported', 'This thought has been reported and will be reviewed by our moderators.');
      if (isCallback) return cb();
      else return undefined;
    }
    return undefined;
  }

}