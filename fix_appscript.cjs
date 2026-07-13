const fs = require('fs');
let code = fs.readFileSync('appscript_final.js', 'utf8');

code = code.replace(/\\n      case "getAllFilesBase64"/g, '\n      case "getAllFilesBase64"');

fs.writeFileSync('appscript_final.js', code);
