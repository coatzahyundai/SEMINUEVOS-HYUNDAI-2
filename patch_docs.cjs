const fs = require('fs');

let s3 = fs.readFileSync('src/components/Section3.tsx', 'utf8');
s3 = s3.replace(
  /"IMAGEN ESCANER", "IMAGEN VIN", "REPORTE ESCANER"\]/g,
  '"IMAGEN ESCANER", "IMAGEN VIN", "REPORTE ESCANER", "EDO CLIENTE", "EDO FINANCIERA"]'
);
fs.writeFileSync('src/components/Section3.tsx', s3);

let as = fs.readFileSync('appscript_final.js', 'utf8');
as = as.replace(
  /"IMAGEN ESCANER", "IMAGEN VIN", "REPORTE ESCANER"\]/g,
  '"IMAGEN ESCANER", "IMAGEN VIN", "REPORTE ESCANER", "EDO CLIENTE", "EDO FINANCIERA"]'
);
fs.writeFileSync('appscript_final.js', as);

console.log("Done");
