const fs = require('fs');
let code = fs.readFileSync('src/components/Section3.tsx', 'utf8');

code = code.replace(/\{\(user\.role === 'servicio' \|\| user\.role === 'gerencia'\) &&\s*\{\(user\.role === 'servicio' \|\| user\.role === 'gerencia'\) &&/g, "{(user.role === 'servicio' || user.role === 'gerencia') &&");
code = code.replace(/\{\(user\.role === 'asesor' \|\| user\.role === 'gerencia'\) &&\s*\{\(user\.role === 'asesor' \|\| user\.role === 'gerencia'\) &&/g, "{(user.role === 'asesor' || user.role === 'gerencia') &&");

fs.writeFileSync('src/components/Section3.tsx', code);
