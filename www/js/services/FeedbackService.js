ParalignAppServices
  .service('FeedbackService', ['$rootScope', 'Feedback', FeedbackService]);


function FeedbackService($rootScope, Feedback) {
  "use strict";
  var self = this;

  this.createFeedback = createFeedback;


  return this;



  function createFeedback(feedback, cb){
    var isCallback = typeof(cb) === 'function';
    if (!feedback) {
      console.error('FeedbackService :: createFeedback. Could not create Feedback.', arguments);
      if (isCallback) return cb('FeedbackService :: createFeedback. Could not create Feedback.');
      else return undefined;
    }
    if (!feedback.content) {
      if (isCallback) return cb('Could not create Feedback. Content is empty.');
      else return undefined;
    }
    if (!$rootScope.isCorrectMood(feedback.mood)) {
      if (isCallback) return cb('Could not create Feedback. Mood is incorrect.');
      else return undefined;
    }
    if (!feedback.user) feedback.user = $rootScope.user ? $rootScope.user.id : undefined;

    new Feedback
      .$save(feedback, function(savedFeedback){
        if (!savedFeedback || !savedFeedback.id) {
          console.error('FeedbackService :: createFeedback. Could not save new Feedback.', arguments);
          if (isCallback) return cb('FeedbackService :: createFeedback. Could not save new Feedback.');
          else return undefined;
        }
        $rootScope.refreshUser(function(){
          if (isCallback) return cb(null, savedFeedback);
          else return savedFeedback;
        });
        return undefined;
      })
      .catch(function(err){
        console.error('FeedbackService :: createFeedback. Could not save new Feedback.', arguments);
        if (isCallback) return cb('FeedbackService :: createFeedback. Could not save new Feedback.');
        else return undefined;
      });
    return undefined;
  }
}