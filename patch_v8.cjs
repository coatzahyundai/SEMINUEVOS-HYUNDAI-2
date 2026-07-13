const fs = require('fs');
let code = fs.readFileSync('appscript_v6.js', 'utf8');

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
    vin: findColIndex(["vin", "numero de serie", "chasis"]),
    fecha: findColIndex(["fecha", "date", "fecha de ingreso"]),
    cliente: findColIndex(["cliente", "nombre del cliente", "propietario"]),
    marca: findColIndex(["marca"]),
    linea: findColIndex(["linea", "submarca", "tipo"]),
    modelo: findColIndex(["modelo", "año", "ano", "year", "modelo_ano", "modelo año"]),
    version: findColIndex(["version"]),
    color: findColIndex(["color"]),
    km: findColIndex(["km", "kilometraje", "kilometros"]),
    placa: findColIndex(["placa", "placas", "matricula"]),
    precio_compra: findColIndex(["precio de toma", "toma", "toma en agencia", "precio compra", "toma o valor comercial", "preciocompra"]),
    precio_venta: findColIndex(["precio de venta", "venta", "precio publico", "precioventa"]),
    toma: findColIndex(["toma real", "toma", "precio toma", "preciotoma", "avaluo"]),
    dacion: findColIndex(["dacion", "dacion en pago", "dacionpago", "engancheneutro"]),
    liq_financiera: findColIndex(["liquidacion", "liquidacion financiera", "liq financiera", "liqfinanciera", "financiera", "liq"]),
    dev_cliente: findColIndex(["devolucion", "devolucion a cliente", "dev cliente", "devcliente", "dev"]),
    estatus: findColIndex(["estatus", "estado", "status"]),
    rec_marca: findColIndex(["marca a llevar", "marca nueva", "marca rec", "recmarca"]),
    rec_modelo: findColIndex(["modelo a llevar", "modelo nuevo", "modelo rec", "recmodelo"]),
    rec_vin: findColIndex(["vin a llevar", "vin nuevo", "vin rec", "recvin"]),
    asesor: findColIndex(["asesor", "vendedor", "asesor de ventas", "ejecutivo", "asesor comercial"])
  };

  return { idx: map, headers: headersRow2, normalized: normalizedHeaders2 };
}`;

code = code.substring(0, code.indexOf('function getHeaderMap(sheet)')) + 
       newGetHeaderMap + '\n\n' + 
       code.substring(code.indexOf('function getInventory(nivel, nombreAsesor)'));

fs.writeFileSync('appscript_v8.js', code);
