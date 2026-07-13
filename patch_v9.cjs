const fs = require('fs');
let code = fs.readFileSync('appscript_v6.js', 'utf8'); // base is v6, I'll update it

const newGetHeaderMap = `function getHeaderMap(sheet) {
  var headersRow2 = sheet.getRange(2, 1, 1, sheet.getLastColumn()).getValues()[0];
  var normalizedHeaders2 = headersRow2.map(normalizeKey);
  
  var findColIndex = function(possibleNames) {
    for (var i = 0; i < possibleNames.length; i++) {
      var idx = normalizedHeaders2.indexOf(possibleNames[i]);
      if (idx !== -1) return idx;
    }
    return -1;
  };

  var map = {
    vin: findColIndex(["vin", "nvin", "numerodevin", "serie", "numerodeserie", "chasis", "numero de serie"]),
    fecha: findColIndex(["fecha", "date", "fechadeingreso", "fecha de ingreso"]),
    cliente: findColIndex(["cliente", "nombre", "nombrecliente", "propietario", "clienteoproveedor", "nombre del cliente"]),
    marca: findColIndex(["marca"]),
    linea: findColIndex(["linea", "submarca", "tipo", "vehiculo", "modelo"]),
    modelo: findColIndex(["modelo", "año", "ano", "year", "modelo_ano", "modelo año"]),
    version: findColIndex(["version", "paquete", "equipamiento"]),
    color: findColIndex(["color"]),
    km: findColIndex(["km", "kilometraje", "kilometros"]),
    placa: findColIndex(["placa", "placas", "matricula"]),
    precio_compra: findColIndex(["preciocompra", "preciodecompra", "compra", "preciopagado", "precio de toma", "toma en agencia", "precio compra", "toma o valor comercial"]),
    precio_venta: findColIndex(["precioventa", "preciodeventa", "venta", "preciopublico", "precio de venta"]),
    toma: findColIndex(["preciodetoma", "preciotoma", "toma", "avaluo", "preciotomaavaluo", "toma real", "precio toma"]),
    dacion: findColIndex(["dacion", "dacionenpago", "engancheneutro", "dacionpago", "dacion_pago", "dacion en pago"]),
    liq_financiera: findColIndex(["liqfinanciera", "liquidacion", "liquidacionfinanciera", "financiera", "liq", "liquidacion financiera", "liq financiera"]),
    dev_cliente: findColIndex(["devcliente", "devolucion", "devolucioncliente", "dev", "devolucion a cliente", "dev cliente"]),
    estatus: findColIndex(["estatus", "estado", "status"]),
    rec_marca: findColIndex(["recmarca", "recompramarca", "marca a llevar", "marca nueva", "marca rec"]),
    rec_modelo: findColIndex(["recmodelo", "recompramodelo", "modelo a llevar", "modelo nuevo", "modelo rec"]),
    rec_vin: findColIndex(["recvin", "recompravin", "vin a llevar", "vin nuevo", "vin rec"]),
    asesor: findColIndex(["asesor", "vendedor", "ejecutivo", "asesor de ventas", "asesor comercial"])
  };

  return { idx: map, headers: headersRow2, normalized: normalizedHeaders2 };
}`;

code = code.substring(0, code.indexOf('function getHeaderMap(sheet)')) + 
       newGetHeaderMap + '\n\n' + 
       code.substring(code.indexOf('function getInventory(nivel, nombreAsesor)'));

code = code.replace("Servicio Activo. Script Robusto v7 (Solo Fila 2, Coincidencia Difusa).", "Servicio Activo. Script Robusto v9 (Combined Aliases).");
code = code.replace("Servicio Activo. Script Robusto v8 (Fix Modelo).", "Servicio Activo. Script Robusto v9 (Combined Aliases).");

fs.writeFileSync('appscript_v9.js', code);
