const fs = require('fs');
let code = fs.readFileSync('appscript_final.js', 'utf8');

// The end of the file looks like:
//      } catch(e) {
//        // skip if inaccessible
//      }
//    }
//  }
//  }
//    return { status: "success", data: filesData };

const target = "    }\n  }\n  }\n    return { status: \"success\", data: filesData };";
const replacement = "    }\n  }\n  return { status: \"success\", data: filesData };\n}\n";

if (code.endsWith("return { status: \"success\", data: filesData };")) {
   code = code.replace(/    \}\n  \}\n  \}\n    return \{ status: "success", data: filesData \};/g, replacement);
   
   // Actually let's just do a simpler string replace since it's at the very end
   let idx = code.lastIndexOf("    }\n  }\n  }");
   if (idx !== -1) {
      code = code.substring(0, idx) + replacement;
   }
}

fs.writeFileSync('appscript_final.js', code);
