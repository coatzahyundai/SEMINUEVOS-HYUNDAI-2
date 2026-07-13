const fs = require('fs');
let code = fs.readFileSync('appscript_final.js', 'utf8');
code = code.replace(
  /case "update_record": result = updateRecord\(data\.data\); break;/,
  'case "update_record": result = saveInitialRecord(data.data); break;'
);
fs.writeFileSync('appscript_final.js', code);
