ParalignAppServices.factory('ListEvents', [ListEvents]);


function ListEvents () {
  "use strict";

  return {
    home      : 'home',
    sidemenu  : 'sidemenu',
    connection: 'connection',
    'terms-n-privacy': 'terms-n-privacy',

    tutorial        : 'tutorial',
    tutorialcomplete: 'tutorialcomplete',
    tutorialleave   : 'tutorialleave',

    login         : 'login',
    loginfacebook : 'loginfacebook',
    logingoogle   : 'logingoogle',
    logintwitter  : 'logintwitter',
    loginanonymous: 'loginanonymous',
    identificationanonymous: 'identificationanonymous',
    loginemail    : 'loginemail',
    logout        : 'logout',
    forgotpassword: 'forgotpassword',
    resetpassword : 'resetpassword',

    chat       : 'chat',
    chatmenu   : 'chatmenu',
    chatreport : 'chatreport',
    chatmessage: 'chatmessage',
    chatlock   : 'chatlock',
    chatunlock : 'chatunlock',
    chatleave  : 'chatleave',

    newthought         : 'newthought',
    newthoughtmood     : 'mood',
    newthoughtintensity: 'intensity',

    mymind       : 'mymind',
    myminddate   : 'myminddate',
    mymindcluster: 'mymindcluster',

    similarmind      : 'similarmind',
    similarmenu      : 'similarmenu',
    similarreport    : 'similarreport',
    similarYANA      : 'similarYANA', // youarenotalone button
    similarconnect   : 'similarconnect',
    similarflip      : 'similarflip',
    similarback      : 'similarback',
    similarswipeleft : 'similarswipeleft',
    similarswiperight: 'similarswiperight',

    wondermind      : 'wondermind',
    wondermenu      : 'wondermenu',
    wonderreport    : 'wonderreport',
    wonderYANA      : 'wonderYANA',
    wonderconnect   : 'wonderconnect',
    wonderswipeleft : 'wonderswipeleft',
    wonderswiperight: 'wonderswiperight',
    wonderswipeup   : 'wonderswipeup',
    wonderswipedown : 'wonderswipedown',

    companion    : 'companion',
    companioninfo: 'companioninfo',

    icediving        : 'icediving',
    icedivingstart   : 'icedivingstart',
    icedivingleave   : 'icedivingleave',
    icedivingcomplete: 'icedivingcomplete',
    icedivinginfo    : 'icedivinginfo',

    sunshinehill         : 'sunshinehill',
    sunshinestart        : 'sunshinestart',
    sunshineleave        : 'sunshineleave',
    sunshinecomplete     : 'sunshinecomplete',
    sunshineinfo         : 'sunshineinfo',
    sunshinethought      : 'sunshinethought',
    sunshinemood         : 'sunshinemood',
    sunshineintensity    : 'sunshineintensity',
    sunshinepostmood     : 'sunshinepostmood',
    sunshinepostintensity: 'sunshinepostintensity',

    calmlake             : 'calmlake',
    calmlakestart        : 'calmlakestart',
    calmlakeleave        : 'calmlakeleave',
    calmlakecomplete     : 'calmlakecomplete',
    calmlakeinfo         : 'calmlakeinfo',
    calmlakethought      : 'calmlakethought',
    calmlakemood         : 'calmlakemood',
    calmlakeintensity    : 'calmlakeintensity',
    calmlakepostmood     : 'calmlakepostmood',
    calmlakepostintensity: 'calmlakepostintensity',

    notifnewconnection: 'notifnewconnection',
    notifnewsimilar   : 'notifnewsimilar',
    notifnewclusters  : 'notifnewclusters',
    notifnewthought   : 'notifnewthought',
    notifnotalone     : 'notifnotalone'
  };
}