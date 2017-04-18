# Paralign mobile app

---
# Development

## Install (Setup the environment and dependencies)

1. Install Cordova

  ```
  sudo npm install -g cordova
  ```
2. Install Ionic 

  ```
  sudo npm install -g ionic
  ```
3. Check your node.js version. Should be 0.12.0

  ```
  node -v
  ```
4. Install XCode (only for Mac OS) for the builds for iOS platform
  
5. Install Android SDK for the builds for Android platform (instruction is different for every platform)

6. Clone the project

 ```
 git clone https://github.com/pouria3/paralign
 ```

7. Install dependencies
  
  ```
  cd paralign &&
  npm install &&
  bower install
  ```


## Run

### Browser
```
ionic serve
```

### Device

Connect a device to your machine

#### iOS

1. Go to XCode
2. In top bar 'Product' -> 'Run'

#### Android

1. Run

  ```
  ionic run android --device
  ```
2. Debug
  * open Google Chrome
  * go to `chrome://inspect`
  * choose the connected device


---
# Build

## Android

### Creation of a release build

1. Add platform **(skip if it is already done)**

  ```
  ionic platform add android
  ```

2. Change the version of code in the config.xml

  > <widget id="..something.." android-versionCode="1"...

3. Build:  

  ```
  cordova build --release android
  ```

4. Signing
  ```
  jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore paralign-android-release-key.keystore ./platforms/android/build/outputs/apk/android-release-unsigned.apk mykey
  ```
  > alias: mykey
  
  > pass: 123456

5. Zipping

  ```
  zipalign -v 4 ./platforms/android/build/outputs/apk/android-release-unsigned.apk ../paralign.apk
  ```
  
  or
  
  ```
  ~/android-sdk-macosx2/build-tools/22.0.1/zipalign -v 4 ./platforms/android/build/outputs/apk/android-release-unsigned.apk ../paralign.apk
  ```
6. You can find `../paralign.apk` file which you can upload to Google Play


##### The same commands combined to one:
```
cordova build --release android &&
 jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore paralign-android-release-key.keystore ./platforms/android/build/outputs/apk/android-release-unsigned.apk mykey &&
 ~/android-sdk-macosx2/build-tools/22.0.1/zipalign -v 4 ./platforms/android/build/outputs/apk/android-release-unsigned.apk ../paralign.apk
```



## iOS

1. Add platform **(skip if it is already done)**

  ```
  ionic platform add ios
  ```

2. Change the version of code in the config.xml

  > <widget id="..something.." ios-CFBundleVersion="1"...

3. Build

  ```
  ionic build ios
  ```
4. In Xcode:

  1. 'General' -> 'Identity' -> 'Team' choose team
  2. 'General' -> 'Deployment Info' -> 'Devices' set only 'iPhone'
  3. 'Build Settings' -> 'Build Options' -> 'Enable Bitcode' set all fields 'no'
  4. In top bar 'Product' -> 'Archive'
  5. In window 'organizer' choose the archived build and press the button 'Upload to App Store...'
  6. In the next windows confirm all default settings (just click 'ok' or 'next')
  7. The build will appear in testflight in ~10 mins 




---
# Information
- App ID in config.xml will be changed every time before building, depending on the platform, 
because the bundle ID is different for ios and android.
Hook is here: `hooks/before_prepare/005_switch_app_id_in_config.js`

- there are some errors in the default keyboard plugin and therefore before every 
build the fixed plugin will be copied from the 'ionic-plugin-keyboard-fixed' folder to directory 'plugins'.
Hook is here: `hooks/after_prepare/004_copy_fixed_keyboard_plugin.js`




---
# Plugins
## Cordova Purchase Plugin
> Good tutorial https://github.com/j3k0/cordova-plugin-purchase/blob/master/doc/api.md

## Google+
> https://github.com/EddyVerbruggen/cordova-plugin-googleplus

> Tutorial: https://developers.google.com/identity/sign-in/android/start-integrating

