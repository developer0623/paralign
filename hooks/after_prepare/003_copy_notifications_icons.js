// #!/usr/bin/env node


// var fs      = require('fs');
// var path    = require('path');




// (function copyIcons(){
//   var DIR_ICONS  = 'resources/drawable';
//   var DIR_TARGET = 'platforms/android/res/drawable';
//   var files      = fs.readdirSync(DIR_ICONS);

//   if (!fs.existsSync(DIR_TARGET)) fs.mkdirSync(DIR_TARGET);

//   for (var i in files) {
//     var filename    = files[i];
//     var currentFile = DIR_ICONS + '/' + filename;
//     var stats       = fs.statSync(currentFile);

//     if (stats.isFile()) {
//       fs.readFile(currentFile, function (err, data) {
//         if (err) {
//           return process.stdout.write('Error', err);
//         }
//         if (data) {
//           var newFile = DIR_TARGET + '/' + filename;
//           if (fs.existsSync(newFile)) return undefined;

//           fs.writeFile(newFile, data, function (error) {
//             if (error) return process.stdout.write('Error', error);
//             process.stdout.write('Copied the notification icons for Android\n');
//           });
//         }
//       });
//     }
//   }
// })();