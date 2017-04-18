ParalignAppResources
  .factory('Report', ['$resource', 'ServerUrl', ReportResource]);

function ReportResource ($resource, ServerUrl) {

  var Report = $resource(
    ServerUrl + '/report/:id',
    null,
    {
      update: { method:'PUT' },
      query: {
        url: ServerUrl + '/report',
        method: 'GET',
        isArray: true
      },
      findById: {
        url: ServerUrl + '/report/:id',
        method: 'GET',
        isArray: false
      }
    }
  );

  return new Report();
};