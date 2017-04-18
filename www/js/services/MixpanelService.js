ParalignAppServices.service('MixpanelService', ['$mixpanel', MixpanelService]);


function MixpanelService ($mixpanel) {
  "use strict";
  var self = $mixpanel;


  this.setPeople = setPeople;
  this.track     = track;


  function track(event){
    if (!$rootScope.mixpanelTrackOn) return undefined;
    if (!event) return undefined;
    return $mixpanel.track(event);
  };



  function setPeople(user, cb){
    var isCallback = typeof(cb) === 'function';
    if (!user || !user.id) {
      console.error('MixpanelService :: setPeople. User is undefined.');
      if (isCallback) return cb('User is undefined');
      else return undefined;
    }
    self.identify(user.id);

    self.people.set({
      "$first_name": user.firstname || 'Anonymous',
      "$last_name" : user.lastname || 'User',
      "$created"   : user.createdAt,
      "$email"     : user.email
    }, function(){
      if (isCallback) return cb();
      else return undefined;
    }, function(err){
      console.error('MixpanelService :: setPeople.', err);
      if (isCallback) return cb(err);
      else return undefined;
    });

    return undefined;
  };




  angular.extend(this, $mixpanel);

  return this;
};




