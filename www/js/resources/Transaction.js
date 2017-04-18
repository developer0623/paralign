ParalignAppResources
  .factory('Transaction', ['$resource', 'ServerUrl', TransactionResource]);

function TransactionResource ($resource, ServerUrl) {

  var Transaction = $resource(
    ServerUrl + '/transaction/:id',
    null,
    {
      update: { method:'PUT' },
      query: {
        url: ServerUrl + '/transaction',
        method: 'GET',
        isArray: true
      },
      createIfUnique: {
        url: ServerUrl + '/transaction/createIfUnique',
        method: 'POST',
        isArray: false
      },
      findById: {
        url: ServerUrl + '/transaction/:id',
        method: 'GET',
        isArray: false
      }
    }
  );


  return new Transaction();
};