const fs = require('fs');
let code = fs.readFileSync('appscript_final.js', 'utf8');
const lines = code.split('\n');
const newLines = lines.filter((line, i) => i !== 706); // 0-indexed, line 707 is index 706
fs.writeFileSync('appscript_final.js', newLines.join('\n'));
