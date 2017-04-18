ParalignAppServices.service('StoreService', ['$rootScope', '$serverConsole', 'Transaction', StoreService]);


function StoreService ($rootScope, $serverConsole, Transaction) {
  var self = this;
  var products = [
    'paralign_product_guide_calm_lake'
  ];


  this.init        = init;
  this.get_product = get_product;
  this.buy_product = buy_product;

  this.isPaidProduct = isPaidProduct;




  function init(callback){
    if (!$rootScope.purchasesOn) return undefined;
    if (!window.store) return console.error('StoreService :: init. Store plugin is not defined');

    store.verbosity = store.WARNING;
    store.validator = "https://api.fovea.cc:1982/check-purchase";

    for (var i = 0; i < products.length; i++) {
      store.register({
        id   : products[i],
        alias: products[i],
        type :  store.NON_CONSUMABLE
      });
    }

    store.error(function(error) {
      return $serverConsole.error('StoreService :: init. Error: ', error);
    });


    store.ready(function(){
      if (typeof(callback) === 'function' ) return callback();
      else return undefined;
    });


    store.refresh();
    return undefined;
  }




  function get_product(productId){
    if (!$rootScope.purchasesOn) return undefined;
    if (!window.store) return console.error('StoreService :: get_product. Store plugin is not defined');
    return store.get(productId);
  }



  // TODO: remove this piece of shit asap
  var counter_of_pieces_of_shit = 0;


  function buy_product(productId, cb){
    if (!$rootScope.purchasesOn) return undefined;
    if (!window.store) return console.error('StoreService :: buy_product. Store plugin is not defined');
    if (!productId) return cb('Product id is not defined');

    $serverConsole.log('StoreService :: buy_product ' + productId);

    var handler_order       = undefined;
    var handler_product     = undefined;
    var handler_store_error = undefined;

    handler_order = store.order(productId);

    handler_product = store.once(productId)
      .approved(handler_approved)
      .owned(handler_owned)
      .cancelled(handler_cancelled);

    handler_store_error = store.error(handler_error);



    function handler_approved (product) {
      $serverConsole.log('guide_calm_lake approved and finish', product.price, product.owned);
      return product.finish();
    }

    function handler_owned(product) {
      $serverConsole.log('guide_calm_lake owned', product.price, product.owned);
      var transaction = {
        user   : $rootScope.user ? $rootScope.user.id : undefined,
        product: productId,
        details: product,
        success: true,
        transaction  : product && product.transaction ? product.transaction : undefined,
        transactionId: product && product.transaction ? product.transaction.id : undefined,
        deviceType   : $rootScope.platform
      };
      return createTransaction(transaction, product, fn_callback);
    }

    function handler_cancelled(product) {
      return fn_callback(null, product, 'cancelled');
    }

    function handler_error(error) {
      $serverConsole.error('StoreService. guide_calm_lake order error: ', error);
      if (error && error.code == 7 && counter_of_pieces_of_shit === 0) return $rootScope.alert('Sorry', 'It seems it is already owned by you');
      if (error && error.code == 6777017) return repeat_order_once_if_error(error);  // TODO: remove this piece of shit asap
      if (error && error.code == 6777001) return repeat_order_once_if_error(error);  // TODO: remove this piece of shit asap
      return undefined;
    }


    // TODO: remove this piece of shit asap
    function repeat_order_once_if_error(error){
      $serverConsole.log('guide_calm_lake repeat_order_once_if_error');
      if (counter_of_pieces_of_shit != 0) {
        $serverConsole.log('\trepeat_order_once_if_error second time');
        return fn_callback(error);
      }
      counter_of_pieces_of_shit = 1;
      fn_turn_off_all_handlers();
      return self.buy_product(productId, cb);
    }


    function fn_turn_off_all_handlers(){
      store.off(handler_approved);
      store.off(handler_owned);
      store.off(handler_cancelled);
      store.off(handler_error);
      store.off(handler_order);
      store.off(handler_product);
      store.off(handler_store_error);
      return undefined;
    }


    function fn_callback(err, product, event){
      fn_turn_off_all_handlers();
      counter_of_pieces_of_shit = 0;
      return cb(err, product, event);
    }

    return undefined;
  }






  function createTransaction(transaction, product, cb){
    new Transaction
      .$createIfUnique(transaction)
      .then(function(trans){
        if (!trans) return cb('Could not save transaction');
        $rootScope.refreshUser(function(){
          return cb(null, product, 'owned');
        });
        return undefined;
      })
      .catch(function(err){
        var userID = $rootScope.user ? $rootScope.user.id : undefined;
        $serverConsole.error('StoreService :: buy_product. Could not save transaction', err, 'UserID: ' + userID);
        if (typeof(err) === 'object' && err.code === 'E11000') return cb();
        else return cb(err, product, 'owned');
      });
  }






  function isPaidProduct(productId){
    if (!$rootScope.purchasesOn) return false;
    if (!window.store) {
      console.error('StoreService :: isPaidProduct. Store plugin is not defined');
      return false;
    }
    if (!productId) return false;
    var transactions = $rootScope.user.transactions;
    if (transactions && transactions.length) {
      var transaction = transactions.filter(function(trans){
        if (trans.product === productId && trans.success) return this;
      })[0];
      return !!transaction;
    }
    else {
      var product = self.get_product(productId);
      return product && product.owned;
    }
  }



  return this;
}
