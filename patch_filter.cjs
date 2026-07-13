const fs = require('fs');
let code = fs.readFileSync('src/components/Section3.tsx', 'utf8');

code = code.replace(/item\.cliente\.toLowerCase\(\)\.includes/g, "(item.cliente || '').toLowerCase().includes");
code = code.replace(/item\.vin\.toLowerCase\(\)\.includes/g, "(item.vin || '').toLowerCase().includes");
code = code.replace(/item\.marca\.toLowerCase\(\)\.includes/g, "(item.marca || '').toLowerCase().includes");

fs.writeFileSync('src/components/Section3.tsx', code);
