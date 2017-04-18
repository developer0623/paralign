ParalignAppServices.service('GoogleAnalytics', ['$rootScope', 'GOOGLE_ANALYTICS_ID', GoogleAnalytics]);


function GoogleAnalytics ($rootScope, GOOGLE_ANALYTICS_ID) {
  "use strict";
  var self  = this;
  var ready = false;
  var analytics = undefined;



  this.init       = init;
  this.trackView  = trackView;
  this.trackEvent = trackEvent;



  function init(){
    if (!$rootScope.GAnalyticsOn) return undefined;
    if (!navigator || !navigator.analytics) return console.error('GoogleAnalytics :: init. Google analytics plugin is not defined.');
    navigator.analytics.setTrackingId(GOOGLE_ANALYTICS_ID, function(){
        analytics = navigator.analytics;
        ready = true;
      },
      function(err){
        console.error('GoogleAnalytics :: init.', err)
      });
    return undefined;
  }



  function trackEvent(event){
    if (!$rootScope.GAnalyticsOn) return undefined;
    return self.trackView(event);
  }



  function trackView(title){
    if (!$rootScope.GAnalyticsOn) return undefined;

    if (!title) return undefined;
    if (!ready) return console.error('GoogleAnalytics :: trackView. Plugin is not ready');
    if (!$rootScope.GAnalyticsOn) return undefined;

    var params = {};
    params[analytics.Fields.USER_ID] = $rootScope.user ? $rootScope.user.id : undefined;

    analytics.sendAppViewWithParams(
      title,
      params,
      function(){},
      function(err){
        console.error('GoogleAnalytics :: sendAppView.', err)
      }
    );
    return undefined;
  }
}