ParalignAppFilters.filter('dateMindFormat', ['$filter', dateMindFormat]);


function dateMindFormat($filter) {
  function dateAgoFormat (time){
    switch (typeof time) {
      case 'number': break;
      case 'string': time = +new Date(time); break;
      case 'object': if (time.constructor === Date) time = time.getTime(); break;
      default: time = +new Date();
    }
    var time_formats = [
      //[60, 'seconds', 1], // 60
      [60, 'A moment', ''], // 60
      [120, 'minute', 60], // 60*2
      [3600, 'minutes', 60], // 60*60, 60
      [7200, 'hour', 3600], // 60*60*2
      [86400, 'hours', 3600], // 60*60*24, 60*60
      [172800, 'day', 86400], // 60*60*24*2
      [604800, 'days', 86400], // 60*60*24*7, 60*60*24
      //[1209600, 'Last week', 'Next week'], // 60*60*24*7*4*2
      //[2419200, 'weeks', 604800], // 60*60*24*7*4, 60*60*24*7
      //[4838400, 'Last month', 'Next month'], // 60*60*24*7*4*2
      //[29030400, 'months', 2419200], // 60*60*24*7*4*12, 60*60*24*7*4
      //[58060800, 'Last year', 'Next year'], // 60*60*24*7*4*12*2
      //[2903040000, 'years', 29030400], // 60*60*24*7*4*12*100, 60*60*24*7*4*12
      //[5806080000, 'Last century', 'Next century'], // 60*60*24*7*4*12*100*2
      //[58060800000, 'centuries', 2903040000] // 60*60*24*7*4*12*100*20, 60*60*24*7*4*12*100
    ];
    var seconds = (+new Date() - time) / 1000;
    var token   = 'ago';
    var list_choice = 1;

    if (seconds <= 0) {
      return 'A moment ago';
    }
    //if (seconds < 0) {
    //  seconds = Math.abs(seconds);
    //  token   = 'from now';
    //  list_choice = 2;
    //}
    var i = 0, format;
    while (format = time_formats[i++])
      if (seconds < format[0]) {
        if (typeof format[2] == 'string')
          return format[list_choice] + ' ' + token;
        else
          return Math.floor(seconds / format[2]) + ' ' + format[1] + ' ' + token;
      }
    return time;
  };



  function dateWithSuffix(input) {
    var suffixes  = ["th", "st", "nd", "rd"];
    var dtfilter  = $filter('date')(new Date(input), 'MMMM dd');
    var monthYear = $filter('date')(new Date(input), 'MMMM yyyy');
    var day       = parseInt(dtfilter.slice(-2));
    var relDigits = (day < 30) ? day % 20 : day % 30;
    var suffix    = (relDigits <= 3) ? suffixes[relDigits] : suffixes[0];
    return day + suffix + ' of ' + monthYear;
  };




  return function(input){
    var seconds    = (+new Date() - new Date(input)) / 1000;
    var secPerWeek = 60*60*24*7;
    if (seconds > secPerWeek) return dateWithSuffix(input);
    else return dateAgoFormat(input);
  }
};