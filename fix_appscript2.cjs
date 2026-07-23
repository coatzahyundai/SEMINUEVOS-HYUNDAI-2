const fs = require('fs');
let code = fs.readFileSync('appscript_final.js', 'utf8');
code = code.replace("    }\n  }\n  }\n    return { status: \"success\"", "    }\n  }\n    return { status: \"success\"");
fs.writeFileSync('appscript_final.js', code);
