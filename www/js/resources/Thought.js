ParalignAppResources
  .factory('Thought', ['$resource', 'ServerUrl', ThoughtResource]);



function ThoughtResource ($resource, ServerUrl) {

  var Thought = $resource(
    ServerUrl + '/thought/:id',
    null,
    {
      update: { method:'PUT' },
      query: {
        url: ServerUrl + '/thought',
        method: 'GET',
        isArray: true
      },
      queryWonderingMinds: {
        url: ServerUrl + '/thought/queryWonderingMinds',
        method: 'GET',
        isArray: true
      },
      findById: {
        url: ServerUrl + '/thought/:id',
        method: 'GET',
        isArray: false
      }
    }
  );


  return new Thought();
};