// #!/usr/bin/env node


// var fs      = require('fs');
// var path    = require('path');
// var rootdir = path.resolve(__dirname, '../../');




// function replaceInFile (filePath, newValue, platform){
//   try {
//     var content   = fs.readFileSync(filePath, 'utf8');
//     var regExp    = /\<widget.+id\s{0,}\=\s{0,}\"([A-z\.0-9\-]+)\"/gi;
//     var parseID   = regExp.exec(content);
//     var currentID = parseID ? parseID[1] : undefined;

//     if (!currentID) {
//       return process.stdout.write('\nERROR. Could not replace App ID\n');
//     }

//     content = content.replace(currentID, newValue);

//     fs.writeFileSync(filePath, content, 'utf8');

//     process.stdout.write('\nReplaced App ID for ' + platform + ' to ' + newValue + '\n');
//   } catch(e) {
//     process.stdout.write(e);
//   }
// }






// var IDS = {
//   ios    : 'me.paralign',
//   android: 'cst.com.paralign2'
// };


// if (rootdir) {
//   var platform = process.env.CORDOVA_PLATFORMS;
//   if(platform !== 'android' && platform !== 'ios') return undefined;
//   var configFile = path.join(rootdir, 'config.xml');

//   if(fs.existsSync(configFile)) {
//     replaceInFile(configFile, IDS[platform], platform);
//   }
// }
