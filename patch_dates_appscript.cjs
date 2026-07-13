const fs = require('fs');
let code = fs.readFileSync('appscript_final.js', 'utf8');

code = code.replace(
  /fecha_envio_exp: findColIndex\(\["fecha_envio_expediente", "fecha_envio_exp", "fecha envio expediente"\]\),/,
  'fecha_envio_exp: findColIndex(["fecha_envio_expediente", "fecha_envio_exp", "fecha envio expediente", "fecha de envio de expediente", "envio expediente", "fecha de envio"]),'
);

code = code.replace(
  /var setVal = function\(key, val\) \{\s*if \(mapInfo\.idx\[key\] !== -1 && val !== undefined\) \{\s*row\[mapInfo\.idx\[key\]\] = val;\s*\}\s*\};/g,
  `var setVal = function(key, val) {
      if (mapInfo.idx[key] !== -1 && val !== undefined) {
        if (key.startsWith('fecha') && typeof val === 'string' && (val.includes('/') || val.includes('-'))) {
           row[mapInfo.idx[key]] = "'" + val;
        } else {
           row[mapInfo.idx[key]] = val;
        }
      }
    };`
);

fs.writeFileSync('appscript_final.js', code);
