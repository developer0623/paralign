// #!/usr/bin/env node


// var fs      = require('fs');
// var path    = require('path');
// var rootdir = process.argv[2];



// function modifyAdjustPan (filePath){
//   try {
//     var content      = fs.readFileSync(filePath, 'utf8');
//     var value_string = 'android:windowSoftInputMode="adjustPan"';

//     if(content.indexOf(value_string) > -1) return; // already added

//     var newString = value_string;
//     var regExp    = /android\:windowSoftInputMode\=\"[A-z]+\"/g;

//     content = content.replace(regExp, newString);

//     fs.writeFileSync(filePath, content, 'utf8');

//     process.stdout.write('Replaced windowSoftInputMode to "adjustPan"\n');
//   } catch(e) {
//     process.stdout.write(e);
//   }
// }


// function modifyAudioPermissions (filePath){
//   try {
//     var content   = fs.readFileSync(filePath, 'utf8');
//     var regExp    = /\<uses\-permission\s*android\:name\=\"android\.permission\.RECORD_AUDIO\"\s*\/\>/g;

//     content = content.replace(regExp, '');
//     fs.writeFileSync(filePath, content, 'utf8');

//     process.stdout.write('Removed "RECORD_AUDIO" permission\n');
//   } catch(e) {
//     process.stdout.write(e);
//   }
// }



// if (rootdir) {

//   // go through each of the platform directories that have been prepared
//   var platforms = (process.env.CORDOVA_PLATFORMS ? process.env.CORDOVA_PLATFORMS.split(',') : []);

//   for(var x=0; x<platforms.length; x++) {
//     // open up the index.html file at the www root
//     try {
//       var platform = platforms[x].trim().toLowerCase();
//       if(platform !== 'android') continue;

//       var filePath = path.join('platforms', platform, 'AndroidManifest.xml');

//       if(fs.existsSync(filePath)) {
//         modifyAdjustPan(filePath);
//         modifyAudioPermissions(filePath);
//       }

//     } catch(e) {
//       process.stdout.write(e);
//     }
//   }

// }
