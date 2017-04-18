
/* Array.sortBy
 *  array.sortBy(function(o){ return o.date });
 * */
(function(){
  if (typeof Object.defineProperty === 'function'){
    try{Object.defineProperty(Array.prototype,'sortBy',{value:sb}); }catch(e){}
  }
  if (!Array.prototype.sortBy) Array.prototype.sortBy = sb;

  function sb(f){
    for (var i=this.length;i;){
      var o = this[--i];
      this[i] = [].concat(f.call(o,o,i),o);
    }
    this.sort(function(a,b){
      for (var i=0,len=a.length;i<len;++i){
        if (a[i]!=b[i]) return a[i]<b[i]?-1:1;
      }
      return 0;
    });
    for (var i=this.length;i;){
      this[--i]=this[i][this[i].length-1];
    }
    return this;
  }
})();





var openedAlerts = [];
function fn_alert(title, content, cb){
  var index = openedAlerts.indexOf(title + content);

  if (index >= 0) return undefined;

  openedAlerts.push(title + content);
  if (navigator && navigator.notification && navigator.notification.alert){
    navigator.notification.alert(
      content,
      function(){
        _removeAlert(title, content);
        return cb();
      },
      title || 'Alert',
      'Okay'
    );
  }
  else if (ionic.$ionicPopup) {
    ionic.$ionicPopup.alert({
      title: title || 'Alert',
      content: content,
      cssClass: '',
      buttons: [{
        text: 'Okay',
        onTap: function(){
          _removeAlert(title, content);
          return cb();
        }
      }]
    });
  } else {
    title = title ? title + '. ' : '';
    alert(title + content);
    if (typeof(cb) === 'function') cb();
  }


  function _removeAlert(_title, _content){
    var i = openedAlerts.indexOf(_title + _content);
    return openedAlerts.splice(i, 1);
  }
}





var log   = console.log.bind(console);
var error = console.error.bind(console);
