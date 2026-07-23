const fs = require('fs');
let code = fs.readFileSync('appscript_final.js', 'utf8');
code = code.replace("    }\n  }\n  }\n  return { status:", "    }\n  }\n  return { status:");
code = code.replace("    }\n  }\n  }\n    return { status:", "    }\n  }\n    return { status:");
fs.writeFileSync('appscript_final.js', code);
