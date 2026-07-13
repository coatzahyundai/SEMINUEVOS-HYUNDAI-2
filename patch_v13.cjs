const fs = require('fs');
let code = fs.readFileSync('appscript_v11.js', 'utf8');

const newSaveInitialRecord = `function saveInitialRecord(formData) {
  var ss = SpreadsheetApp.openById(ID_SHEET);
  var sheet = ss.getSheetByName("TomasUnidades");
  var map = getHeaderMap(sheet);
  
  var vin = formData.vin;
  var rowIdx = findRowByVIN(sheet, vin);
  
  var buildRow = function(inputData, mapInfo, currentVals) {
    var maxCols = sheet.getLastColumn();
    var row = new Array(maxCols).fill("");
    if (currentVals) {
      for (var j = 0; j < currentVals.length; j++) { row[j] = currentVals[j]; }
    }
    
    var setVal = function(key, val) {
      if (mapInfo.idx[key] !== -1 && val !== undefined) {
        row[mapInfo.idx[key]] = val;
      }
    };
    
    setVal("vin", inputData.vin);
    setVal("fecha", inputData.fecha);
    setVal("cliente", inputData.cliente);
    setVal("marca", inputData.marca);
    setVal("linea", inputData.linea);
    setVal("modelo", inputData.modelo);
    setVal("version", inputData.version);
    setVal("color", inputData.color);
    setVal("km", inputData.km);
    setVal("placa", inputData.placa);
    setVal("precio_compra", inputData.precio_compra);
    setVal("precio_venta", inputData.precio_venta);
    setVal("toma", inputData.toma);
    setVal("dacion", inputData.dacion);
    setVal("liq_financiera", inputData.liq_financiera);
    setVal("dev_cliente", inputData.dev_cliente);
    if (!currentVals) setVal("estatus", inputData.estatus || ESTATUS.EXPEDIENTE);
    if (inputData.estatus) setVal("estatus", inputData.estatus);
    setVal("rec_marca", inputData.rec_marca);
    setVal("rec_modelo", inputData.rec_modelo);
    setVal("rec_vin", inputData.rec_vin);
    setVal("asesor", inputData.asesor);
    
    // Dates
    setVal("fecha_contrato", inputData.fecha_contrato);
    setVal("fecha_envio_exp", inputData.fecha_envio_exp);
    setVal("fecha_poliza", inputData.fecha_poliza);
    setVal("fecha_pago_fin", inputData.fecha_pago_fin);
    setVal("fecha_dev_cliente", inputData.fecha_dev_cliente);
    
    return row;
  };

  if (rowIdx === -1) {
    var newRow = buildRow(formData, map, null);
    sheet.appendRow(newRow);
    return { status: "success", message: "Registro nuevo guardado." };
  }
  
  var currentData = sheet.getRange(rowIdx, 1, 1, sheet.getLastColumn()).getValues()[0];
  var updatedRow = buildRow(formData, map, currentData);
  sheet.getRange(rowIdx, 1, 1, updatedRow.length).setValues([updatedRow]);
  return { status: "success", message: "Registro actualizado exitosamente." };
}`;

code = code.substring(0, code.indexOf('function saveInitialRecord(formData)')) + 
       newSaveInitialRecord + '\n\n' + 
       code.substring(code.indexOf('function checkVIN(vin)'));

code = code.replace("Servicio Activo. Script Robusto v11.", "Servicio Activo. Script Robusto v13.");

fs.writeFileSync('appscript_v13.js', code);
