const fs = require('fs');

function patchFile(filename) {
  let content = fs.readFileSync(filename, 'utf8');
  let target = '"IMAGEN ESCANER", "IMAGEN VIN", "REPORTE ESCANER"';
  let idx = content.indexOf(target);
  if (idx !== -1) {
    let before = content.substring(0, idx);
    let after = content.substring(idx + target.length);
    let newContent = before + '"IMAGEN ESCANER", "IMAGEN VIN", "REPORTE ESCANER", "EDO CLIENTE", "EDO FINANCIERA"' + after;
    fs.writeFileSync(filename, newContent);
    console.log(`Patched ${filename}`);
  } else {
    console.log(`Target not found in ${filename}`);
  }
}

patchFile('src/components/Section3.tsx');
patchFile('appscript_final.js');
