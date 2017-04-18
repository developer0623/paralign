ParalignAppResources
  .factory('Settings', ['$resource', 'ServerUrl', SettingsResource]);



function SettingsResource ($resource, ServerUrl) {

  var Settings = $resource(
    ServerUrl + '/settings/:id',
    null,
    {
      update: { method: 'PUT' },
      query: {
        url: ServerUrl + '/settings',
        method: 'GET',
        isArray: true
      }
    }
  );

  return new Settings();
};