ParalignAppResources
  .factory('Guide', ['$resource', 'ServerUrl', GuideResource]);



function GuideResource ($resource, ServerUrl) {

  var Guide = $resource(
    ServerUrl + '/guide',
    {
      id: "@id"
    },
    {
      update: { method:'PUT' }
    }
  );

  return new Guide();
};