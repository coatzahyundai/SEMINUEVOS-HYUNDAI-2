const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');

if (!code.includes('notranslate')) {
  code = code.replace('<head>', '<head>\n    <meta name="google" content="notranslate" />');
  fs.writeFileSync('index.html', code);
}
