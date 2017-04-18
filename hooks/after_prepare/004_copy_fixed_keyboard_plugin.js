// #!/usr/bin/env node


// var fs   = require('fs');
// var path = require('path');
// var exec = require('child_process').exec;



// (function copyKeyboardPlugin(){
//   var DIR_SOURCE = 'ionic-plugin-keyboard-fixed/';
//   var DIR_TARGET = 'plugins/ionic-plugin-keyboard';
//   var FILE_FLAG  = 'plugins/ionic-plugin-keyboard/isFixedPlugin.true';

//   if (!fs.existsSync(DIR_TARGET)) fs.mkdirSync(DIR_TARGET);

//   if (fs.existsSync(FILE_FLAG)) {
//     return process.stdout.write('The fixed keyboard plugin has already copied\n');
//   }
//   else {
//     return exec('cp -r ' + DIR_SOURCE + ' ' + DIR_TARGET, function (err, out, code) {
//       return process.stdout.write('The fixed keyboard plugin has successfully copied\n');
//     });
//   }
// })();