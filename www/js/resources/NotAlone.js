ParalignAppResources
  .factory('NotAlone', ['$resource', 'ServerUrl', NotAloneResource]);



function NotAloneResource ($resource, ServerUrl) {

  var NotAlone = $resource(
    ServerUrl + '/notAlone/:id',
    null,
    {
      update: { method:'PUT' }
    }
  );

  return new NotAlone();
};