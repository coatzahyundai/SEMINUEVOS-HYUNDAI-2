const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');
code = code.replace('<html lang="en">', '<html lang="es">');
code = code.replace('<title>My Google AI Studio App</title>', '<title>Seminuevos Hyundai</title>');
fs.writeFileSync('index.html', code);
