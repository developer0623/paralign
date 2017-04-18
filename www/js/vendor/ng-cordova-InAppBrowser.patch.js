/**
 * ==================  ng-cordova-InAppBrowser-patch for Paralign ==================
 *
 * Example:
 *
 * ```
 * angular.module('myApp', ['ngCordova'])`
 * ```
 *
 * becomes
 *
 * ```
 * angular.module('myApp', ['ngCordova', 'ng-cordova-InAppBrowser-patch'])
 * ```
 */


angular
  .module('ng-cordova-InAppBrowser-patch', ['ngCordova'])
  .run(['$cordovaOauthUtility', function($cordovaOauthUtility) {
    'use strict';
    console.log('Info: ng-cordova-InAppBrowser-patch was applied');
    $cordovaOauthUtility.isInAppBrowserInstalled = function(){
      return !!cordova && !!cordova.InAppBrowser;
    };
  }]);