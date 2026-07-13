const fs = require('fs');
let code = fs.readFileSync('appscript_final.js', 'utf8');

code = code.replace(
  'case "get_files_for_vin": result = getFilesForVin(data.vin); break;',
  'case "get_files_for_vin": result = getFilesForVin(data.vin); break;\\n      case "getAllFilesBase64": result = getAllFilesBase64(data.vin); break;'
);

fs.writeFileSync('appscript_final.js', code);
