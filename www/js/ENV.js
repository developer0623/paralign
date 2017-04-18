
/*
* Choose one of numbers from the list below.
*
* 'device' - means that will be launched all plugins of the app.
*            Use these environments when the app will be launched on a device.
*
* 'browser' - use these environments while developing in a browser
* */
var ENV_NUMBER = 4;


var ENV_LIST   = {
  // DEV
  0: ['browser-dev'         , 'http://192.168.88.80:80'],
  1: ['device-dev'          , 'http://192.168.88.80:80'],

  // IBM server
  2: ['device-prod-IBM'     , 'http://50.97.233.90:1337'],
  3: ['device-prod-IBM-test', 'http://50.97.233.90:1338'],

  // AWS server
  4: ['device-prod-AWS'     , 'http://50.18.178.57:80'],
  5: ['device-prod-AWS-test', 'http://50.18.178.57:81'],
  6: ['browser-prod-AWS'    , 'http://50.18.178.57:80']
};


var ENV            = ENV_LIST[ ENV_NUMBER ][0];
var ENV_SERVER_URL = ENV_LIST[ ENV_NUMBER ][1];


