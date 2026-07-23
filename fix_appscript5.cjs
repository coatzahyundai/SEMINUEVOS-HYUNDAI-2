const fs = require('fs');
let code = fs.readFileSync('appscript_final.js', 'utf8');

const target = "    }\n  }\n  }\n    return { status: \"success\", data: filesData };";
const replacement = "    }\n  }\n  return { status: \"success\", data: filesData };\n}\n";

let idx = code.lastIndexOf("    }\n  }\n  }");
if (idx !== -1) {
   code = code.substring(0, idx) + replacement;
}

fs.writeFileSync('appscript_final.js', code);
