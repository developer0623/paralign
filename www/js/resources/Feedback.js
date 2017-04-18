ParalignAppResources
  .factory('Feedback', ['$resource', 'ServerUrl', FeedbackResource]);

function FeedbackResource ($resource, ServerUrl) {

  var Feedback = $resource(
    ServerUrl + '/feedback/:id',
    null,
    {
      update: { method:'PUT' },
      query: {
        url: ServerUrl + '/feedback',
        method: 'GET',
        isArray: true
      },
      findById: {
        url: ServerUrl + '/feedback/:id',
        method: 'GET',
        isArray: false
      }
    }
  );

  return new Feedback();
};