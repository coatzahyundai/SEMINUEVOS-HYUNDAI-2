const fs = require('fs');
let code = fs.readFileSync('appscript_final.js', 'utf8');

code = code.replace(
  /fecha_envio_exp: findColIndex\(\["fecha_envio_expediente", "fecha_envio_exp", "fecha envio expediente", "fecha de envio de expediente", "envio expediente", "fecha de envio"\]\)/,
  `fecha_envio_exp: findColIndex(["fecha_envio_expediente", "fecha_envio_exp", "fecha envio expediente", "fecha de envio de expediente", "envio expediente", "fecha de envio", "fecha_envio_ex", "fechaenvioex"])`
);

fs.writeFileSync('appscript_final.js', code);
