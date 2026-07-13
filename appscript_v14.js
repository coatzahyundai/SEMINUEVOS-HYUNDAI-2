// --- CONFIGURACIÓN GLOBAL ---
const ID_SHEET = "1ZOGeuRffM4Z1uhX0RziijInmPTpYm4KDOViMjr6GnHU";
const ID_CARPETA_RAIZ = "1GdAYmsMo94hmS8hYNxUbawNXEImtBhLp"; 

const ESTATUS = {
  CAPTURA: "En captura",
  AVALUO_SOLICITADO: "Solicitud Avalúo",
  AVALUO_LISTO: "Avalúo Listo",
  ENVIO_EXPEDIENTE: "Envío de Expediente",
  ENVIO_CONTRATO: "Envío de Contrato",
  POLIZA: "Poliza",
  LIQUIDACION: "Liquidación"
};

const DOCS_SERVICIO = [
  "Valuacion de Unidad (Avalúo)", 
  "Presupuesto de Reparacion", 
  "Imagen de Escaner", 
  "Reporte de Escaner", 
  "VIN (Foto)"
];

const DOCS_TODOS = [
  "CARATULA DE DOCUMENTOS", "FACTURA ORIGINAL", "FACTURA COPIA O CARTA COMPROMISO O REFACTURA", 
  "TENENCIA 2019", "TENENCIA 2020", "TENENCIA 2021", "TENENCIA 2022", "TENENCIA 2023", 
  "TENENCIA 2024", "TENENCIA 2025", "TENENCIA 2026", "TENENCIA 2027", 
  "BAJA DE PLACAS O CARTA COMPROMISO", "TARJETA DE CIRCULACION", "VERIFICACION", 
  "VALUACION DE LA UNIDAD", "PRESUPUESTO DE REPARACION", "GUIA AZUL", "INE DEL CLIENTE", 
  "COMP DE DOMICILIO", "CURP", "CSF", "REPUVE", "TRANSUNION 1", "TRANSUNION 2", 
  "VERIFICACION DE FACTURA 1", "VERIFICACION DE FACTURA 2", "CONTRATO DE COMPRA-VENTA", 
  "IMAGEN ESCANER", "IMAGEN VIN", "REPORTE ESCANER"
];

function doPost(e) {
  var p = e.postData.contents; var parsed = JSON.parse(p); if(parsed.action === 'getValuationData') { return ContentService.createTextOutput(JSON.stringify(getValuationData(parsed.vin))).setMimeType(ContentService.MimeType.JSON); } if(parsed.action === 'deleteRecord') { return ContentService.createTextOutput(JSON.stringify(deleteRecord(parsed.vin))).setMimeType(ContentService.MimeType.JSON); }

  try {
    if (!e || !e.postData || !e.postData.contents) {
      return ContentService.createTextOutput(JSON.stringify({ status: "error", message: "No se recibieron datos." })).setMimeType(ContentService.MimeType.JSON);
    }
    
    var data = JSON.parse(e.postData.contents);
    var action = data.action;
    var result;

    switch (action) {
      case "login": result = loginUser(data.password); break;
      case "get_inventory": result = getInventory(data.nivel, data.nombre); break;
      case "save_record": result = saveInitialRecord(data.data); break;
      case "request_valuation": result = updateStatus(data.vin, data.estatus || ESTATUS.AVALUO_SOLICITADO); break;
      case "get_files_for_vin": result = getFilesForVin(data.vin); break;
      case "upload_file": result = uploadFileToDrive(data.vin, data.docType, data.fileName, data.mimeType, data.fileData, data.folderName); break;
      case "save_valuation": result = saveValuationData(data.vin, data.data); break;
      
      // -- EVENTOS INTEGRADOS Y ACTUALIZADOS --
      case "save_cloud_data": result = saveCloudData(data); break; 
      case "get_cloud_data": result = getCloudData(); break;
      case "update_record": result = updateRecord(data.data); break;
      case "check_vin": result = checkVIN(data.vin); break;
      
      default: result = { status: "error", message: "Acción no reconocida: " + action };
    }

    return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: "Error del Servidor: " + error.toString() })).setMimeType(ContentService.MimeType.JSON);
  }
}

// ------ FUNCIONES EXISTENTES NATIVAS Y ACTUALIZADAS ------ //

function loginUser(password) {
  try {
    var ss = SpreadsheetApp.openById(ID_SHEET);
    var sheet = ss.getSheetByName("Usuarios");
    if(!sheet) return { status: "error", message: "No se encontró la pestaña 'Usuarios'." };
    var data = sheet.getDataRange().getValues();
    var inputPass = password.toString().trim();
    for (var i = 1; i < data.length; i++) {
      var sheetPass = data[i][0].toString().trim();
      if (sheetPass === inputPass) {
        return { status: "success", data: { nivel: data[i][1].toString().trim().toLowerCase(), nombre: data[i][2] } };
      }
    }
    return { status: "error", message: "Contraseña incorrecta." };
  } catch(e) {
    return { status: "error", message: "Error al leer Sheet: " + e.toString() };
  }
}

function normalizeKey(str) {
  if (!str) return "";
  var s = str.toString().trim().toLowerCase()
    .replace(/\s+/g, "")
    .replace(/_/g, "")
    .replace(/ñ/g, "n")
    .replace(/[áäâ]/g, "a")
    .replace(/[éëê]/g, "e")
    .replace(/[íïî]/g, "i")
    .replace(/[óöô]/g, "o")
    .replace(/[úüû]/g, "u");
  s = s.replace("tenencias", "tenencia");
  s = s.replace("comprobantededomicilio", "compdedomicilio");
  s = s.replace("facturacopiaocartacompromisoorefactura", "facturacopia");
  s = s.replace("bajadeplacasocartacompromiso", "bajadeplacas");
  return s;
}

function getHeaderMap(sheet) {
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
    asesor: findColIndex(["asesor", "vendedor", "ejecutivo", "asesor de ventas", "asesor comercial"]),
    fecha_contrato: findColIndex(["fecha_contrato", "fechacontrato", "fecha contrato"]),
    fecha_envio_exp: findColIndex(["fecha_envio_expediente", "fecha_envio_exp", "fecha envio expediente"]),
    fecha_poliza: findColIndex(["fecha_poliza", "fechapoliza", "fecha poliza"]),
    fecha_pago_fin: findColIndex(["fecha_pago_fin", "fechapagofin", "fecha pago fin", "fecha pago financiera"]),
    fecha_dev_cliente: findColIndex(["fecha_dev_cliente", "fechadevcliente", "fecha devolucion cliente", "fecha dev cliente"])
  };

  return { idx: map, headers: headersRow2, normalized: normalizedHeaders2 };
}

function getInventory(nivel, nombreAsesor) {
  var ss = SpreadsheetApp.openById(ID_SHEET);
  var sheet = ss.getSheetByName("TomasUnidades");
  var lastRow = sheet.getLastRow();
  if (lastRow < 3) return { status: "success", data: [] };
  
  var map = getHeaderMap(sheet);
  var data = sheet.getRange(3, 1, lastRow - 2, sheet.getLastColumn()).getValues();
  
  var result = [];
  for (var i = 0; i < data.length; i++) {
    var row = data[i];
    var obj = {};
    
    for (var key in map.idx) {
      if (map.idx[key] !== -1) {
        obj[key] = row[map.idx[key]];
      }
    }
    if (!obj.vin) obj.vin = row[0];
    
    if (nivel === "asesor" && obj.asesor !== nombreAsesor) continue;
    if (nivel === "servicio" && obj.estatus !== ESTATUS.AVALUO_SOLICITADO) continue;
    
    if (obj.vin && obj.vin.toString().trim() !== "") {
      result.push(obj);
    }
  }
  
  return { status: "success", data: result };
}

function mapFormDataToArray(formData, map, currentDataRow) {
  var newRow = currentDataRow ? currentDataRow.slice() : new Array(map.headers.length).fill("");
  
  var assign = function(key, val) {
    if (map.idx[key] !== -1 && val !== undefined && val !== null && val !== "") {
      newRow[map.idx[key]] = val;
    }
  };
  
  assign("vin", formData.vin);
  assign("fecha", formData.fecha);
  assign("cliente", formData.cliente);
  assign("marca", formData.marca);
  assign("linea", formData.linea || formData.modelo); 
  assign("modelo", formData.modelo || formData.ano);
  assign("version", formData.version);
  assign("km", formData.km);
  assign("placa", formData.placa);
  assign("precio_compra", formData.precio_compra);
  assign("precio_venta", formData.precio_venta);
  assign("toma", formData.precio_toma || formData.toma);
  assign("dacion", formData.dacion);
  assign("liq_financiera", formData.liq_financiera || formData.liq);
  assign("dev_cliente", formData.dev_cliente || formData.dev);
  assign("rec_marca", formData.rec_marca);
  assign("rec_modelo", formData.rec_modelo);
  assign("rec_vin", formData.rec_vin);
  assign("asesor", formData.asesor);
  
  // Mantener el estatus si ya existe y no se proporcionó uno nuevo
  if (formData.estatus) {
    assign("estatus", formData.estatus);
  } else if (!currentDataRow) {
    assign("estatus", ESTATUS.CAPTURA);
  }
  
  if (map.idx["vin"] === -1) newRow[0] = formData.vin || "";
  
  return newRow;
}

function saveInitialRecord(formData) {
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
}

function checkVIN(vin) {
  var sheet = SpreadsheetApp.openById(ID_SHEET).getSheetByName("TomasUnidades");
  var row = findRowByVIN(sheet, vin);
  return { status: "success", exists: row !== -1 };
}

function updateStatus(vin, newStatus) {
  var sheet = SpreadsheetApp.openById(ID_SHEET).getSheetByName("TomasUnidades");
  var rowIdx = findRowByVIN(sheet, vin);
  if (rowIdx === -1) return { status: "error", message: "VIN no encontrado." };
  
  var map = getHeaderMap(sheet);
  var colEstatus = map.idx["estatus"] !== -1 ? map.idx["estatus"] + 1 : 21;
  
  sheet.getRange(rowIdx, colEstatus).setValue(newStatus);
  return { status: "success", message: "Estatus actualizado." };
}

function getFilesForVin(vin) {
  var sheet = SpreadsheetApp.openById(ID_SHEET).getSheetByName("TomasUnidades");
  var headersRow2 = sheet.getRange(2, 1, 1, sheet.getLastColumn()).getValues()[0];
  var rowIdx = findRowByVIN(sheet, vin);
  if (rowIdx === -1) return { status: "error", message: "VIN no encontrado." };
  var rowData = sheet.getRange(rowIdx, 1, 1, sheet.getLastColumn()).getValues()[0];
  var loadedFiles = [];
  var normalizedDocsTodos = DOCS_TODOS.map(normalizeKey);
  
  var getDocIdx = function(headerVal) {
    var normH = normalizeKey(headerVal);
    if (!normH) return -1;
    var idx = normalizedDocsTodos.indexOf(normH);
    if (idx !== -1) return idx;
    for (var j = 0; j < normalizedDocsTodos.length; j++) {
      if (normalizedDocsTodos[j] !== "" && (normalizedDocsTodos[j].indexOf(normH) === 0 || normH.indexOf(normalizedDocsTodos[j]) === 0)) return j;
    }
    return -1;
  };

  for (var i = 0; i < headersRow2.length; i++) {
    var docIdx = getDocIdx(headersRow2[i]);
    
    if (docIdx !== -1 && rowData[i] && rowData[i].toString().trim() !== "") {
      try {
        var fileId = rowData[i].toString().trim();
        if (fileId.indexOf(',') !== -1) {
           var parts = fileId.split(',');
           fileId = parts[parts.length - 1].trim();
        }
        var file = DriveApp.getFileById(fileId);
        loadedFiles.push({ type: DOCS_TODOS[docIdx], name: file.getName(), url: file.getUrl() });
      } catch(e) {
        loadedFiles.push({ type: DOCS_TODOS[docIdx], name: "Archivo inaccesible en Drive", error: true });
      }
    }
  }
  return { status: "success", data: loadedFiles };
}

function uploadFileToDrive(vin, docType, fileName, mimeType, fileDataBase64, folderName) {
  var sheet = SpreadsheetApp.openById(ID_SHEET).getSheetByName("TomasUnidades");
  var headersRow2 = sheet.getRange(2, 1, 1, sheet.getLastColumn()).getValues()[0];
  var colIdx = -1;
  var normalizedDocType = normalizeKey(docType); 
  
  var findCol = function(headers) {
    for(var i=0; i<headers.length; i++){ 
      if(normalizeKey(headers[i]) === normalizedDocType) return i+1; 
    }
    for(var i=0; i<headers.length; i++){
      var normH = normalizeKey(headers[i]);
      if (normH !== "" && (normalizedDocType.indexOf(normH) === 0 || normH.indexOf(normalizedDocType) === 0)) return i+1;
    }
    return -1;
  };

  colIdx = findCol(headersRow2);
  if(colIdx === -1) return { status: "error", message: "Columna de documento no encontrada: " + docType + ". Por favor verifica que la columna en la fila 2 del Excel se llame EXACTAMENTE igual." };
  
  var rowIdx = findRowByVIN(sheet, vin);
  if (rowIdx === -1) return { status: "error", message: "VIN no encontrado." };
  
  // Eliminar archivo anterior si existe
  var existingFileId = sheet.getRange(rowIdx, colIdx).getValue();
  if (existingFileId && existingFileId.toString().trim() !== "") {
    try {
      var ids = existingFileId.toString().split(',');
      for (var k=0; k<ids.length; k++) {
        var existingFile = DriveApp.getFileById(ids[k].trim());
        existingFile.setTrashed(true);
      }
    } catch(e) {
      console.error("No se pudo enviar a papelera el archivo anterior: " + e.toString());
    }
  }

  var rootFolder = DriveApp.getFolderById(ID_CARPETA_RAIZ);
  var targetFolderName = folderName || vin;
  var folders = rootFolder.getFoldersByName(targetFolderName);
  if (!folders.hasNext()) {
    var vinFolders = rootFolder.getFoldersByName(vin);
    if (vinFolders.hasNext()) {
      targetFolderName = vin;
      folders = vinFolders;
    }
  }
  var vinFolder = folders.hasNext() ? folders.next() : rootFolder.createFolder(targetFolderName);
  
  var blob = Utilities.newBlob(Utilities.base64Decode(fileDataBase64), mimeType, fileName);
  var file = vinFolder.createFile(blob);
  var fileId = file.getId();
  
  sheet.getRange(rowIdx, colIdx).setValue(fileId);
  return { status: "success", message: "Guardado.", url: file.getUrl() };
}

function saveValuationData(vin, valData) {
  var ss = SpreadsheetApp.openById(ID_SHEET);
  var sheet = ss.getSheetByName("Avaluos");
  if(!sheet) return { status: "error", message: "No se encontró pestaña 'Avaluos'." };
  
  // Columns: A: VIN, B: ESTATUS AVALUO, C: Fecha_Avaluo, D: Observaciones, E: mecanica, F: subtotal Mecanica, G: mano de obra, H: subtotal MO, I: HYP, J: subtotal HYP, K: Gran_Total, L: Tiene_Garantia, M: Valuador_Tecnico
  var newRow = [
    vin, 
    valData.estatus_avaluo || "", 
    valData.fecha_avaluo || "", 
    valData.observaciones || "", 
    JSON.stringify(valData.mecanica || []), 
    valData.subtotal_mecanica || 0, 
    JSON.stringify(valData.mano_obra || []), 
    valData.subtotal_mo || 0, 
    JSON.stringify(valData.hyp || []), 
    valData.subtotal_hyp || 0, 
    valData.gran_total || 0, 
    valData.tiene_garantia || "", 
    valData.valuador_tecnico || ""
  ];
  
  // Update if exists, else append
  var lastRow = sheet.getLastRow();
  var rowIdx = -1;
  if(lastRow > 0) {
    var vinData = sheet.getRange(1, 1, lastRow, 1).getValues();
    for (var i = 0; i < vinData.length; i++) {
      if (vinData[i][0] === vin) {
        rowIdx = i + 1;
        break;
      }
    }
  }
  
  if (rowIdx !== -1) {
    sheet.getRange(rowIdx, 1, 1, newRow.length).setValues([newRow]);
  } else {
    sheet.appendRow(newRow);
  }
  
  if(valData.estatus_avaluo) {
     updateStatus(vin, valData.estatus_avaluo);
  }
  return { status: "success", message: "Avalúo técnico guardado." };
}

function getValuationData(vin) {
  var ss = SpreadsheetApp.openById(ID_SHEET);
  var sheet = ss.getSheetByName("Avaluos");
  if(!sheet) return { status: "error", message: "No se encontró pestaña 'Avaluos'." };
  var lastRow = sheet.getLastRow();
  if(lastRow < 1) return { status: "success", data: null };
  var vinData = sheet.getRange(1, 1, lastRow, 1).getValues();
  for (var i = 0; i < vinData.length; i++) {
    if (vinData[i][0] === vin) {
      var row = sheet.getRange(i + 1, 1, 1, 13).getValues()[0];
      return {
        status: "success",
        data: {
          vin: row[0],
          estatus_avaluo: row[1],
          fecha_avaluo: row[2],
          observaciones: row[3],
          mecanica: row[4] ? JSON.parse(row[4]) : [],
          subtotal_mecanica: row[5],
          mano_obra: row[6] ? JSON.parse(row[6]) : [],
          subtotal_mo: row[7],
          hyp: row[8] ? JSON.parse(row[8]) : [],
          subtotal_hyp: row[9],
          gran_total: row[10],
          tiene_garantia: row[11],
          valuador_tecnico: row[12]
        }
      };
    }
  }
  return { status: "success", data: null };
}

function deleteRecord(vin) {
  var ss = SpreadsheetApp.openById(ID_SHEET);
  var sheet = ss.getSheetByName("TomasUnidades");
  var rowIdx = findRowByVIN(sheet, vin);
  
  if (rowIdx !== -1) {
    sheet.deleteRow(rowIdx);
  }
  
  var sheetAvaluos = ss.getSheetByName("Avaluos");
  if (sheetAvaluos) {
    var lastRow = sheetAvaluos.getLastRow();
    if(lastRow > 0) {
      var vinData = sheetAvaluos.getRange(1, 1, lastRow, 1).getValues();
      for (var i = 0; i < vinData.length; i++) {
        if (vinData[i][0] === vin) {
          sheetAvaluos.deleteRow(i + 1);
          break;
        }
      }
    }
  }
  
  // Trash Drive Folder
  try {
    var rootFolder = DriveApp.getFolderById(ID_CARPETA_RAIZ);
    var folders = rootFolder.getFoldersByName(vin);
    while (folders.hasNext()) {
      folders.next().setTrashed(true);
    }
  } catch(e) {
    console.error("Error deleting folder: " + e.toString());
  }
  
  return { status: "success", message: "Registro eliminado exitosamente." };
}

function findRowByVIN(sheet, vin) {
  var lastRow = sheet.getLastRow();
  if(lastRow < 3) return -1;
  var vinData = sheet.getRange(3, 1, lastRow - 2, 1).getValues();
  for (var i = 0; i < vinData.length; i++) { if (vinData[i][0] === vin) return i + 3; }
  return -1;
}

function doGet(e) {
  return ContentService.createTextOutput("Servicio Activo. Script Robusto v14.").setMimeType(ContentService.MimeType.TEXT);
}

// ------ FUNCIONES NUEVAS INTEGRADAS ------ //

function saveCloudData(payload) {
  try {
    var ss = SpreadsheetApp.openById(ID_SHEET);
    var sheet = ss.getSheetByName("NubeTemporal"); 
    if (!sheet) {
      sheet = ss.insertSheet("NubeTemporal");
      sheet.appendRow(["Tipo", "JSON Data", "Nombre Archivo", "Password PDF"]);
    }
    
    if (payload.tipo === 'azul') {
      var existRow = findCloudRow(sheet, "azul");
      var dataStr = JSON.stringify(payload.dbInventario || {});
      if (existRow > 0) {
        sheet.getRange(existRow, 2).setValue(dataStr);
      } else {
        sheet.appendRow(["azul", dataStr, "", ""]);
      }
    }
    
    if (payload.tipo === 'citas') {
      var existRow = findCloudRow(sheet, "citas");
      var dataStr = JSON.stringify(payload.rawCitasExcel || []);
      if (existRow > 0) {
        sheet.getRange(existRow, 2).setValue(dataStr);
        sheet.getRange(existRow, 3).setValue(payload.nameCitas || "");
        sheet.getRange(existRow, 4).setValue(payload.pdfPass || "");
      } else {
        sheet.appendRow(["citas", dataStr, payload.nameCitas || "", payload.pdfPass || ""]);
      }
    }
    
    return { status: "success", message: "Archivos guardados correctamente." };
  } catch(e) {
    return { status: "error", message: e.toString() };
  }
}

function getCloudData() {
  try {
    var ss = SpreadsheetApp.openById(ID_SHEET);
    var resultObj = {};
    
    var tSheet = ss.getSheetByName("TomasUnidades");
    if (tSheet) {
      resultObj.layout = tSheet.getRange(1, 1, 3, tSheet.getLastColumn()).getValues();
    }
    
    var sheet = ss.getSheetByName("NubeTemporal");
    if (sheet) {
      var data = sheet.getDataRange().getValues();
      for (var i = 1; i < data.length; i++) {
        var tipo = data[i][0];
        var jsonDataStr = data[i][1];
        if (tipo === "azul") {
          resultObj.dbInventario = JSON.parse(jsonDataStr || "{}");
        } else if (tipo === "citas") {
          resultObj.rawCitasExcel = JSON.parse(jsonDataStr || "[]");
          resultObj.nameCitas = data[i][2];
          resultObj.pdfPass = data[i][3];
        }
      }
    }
    var uSheet = ss.getSheetByName("Usuarios");
    if (uSheet) {
      resultObj.usuarios = uSheet.getDataRange().getValues();
    }
    return { status: "success", data: resultObj };
  } catch(e) {
    return { status: "error", message: e.toString() };
  }
}

function findCloudRow(sheet, tipo) {
  var data = sheet.getRange("A:A").getValues();
  for (var i = 0; i < data.length; i++) {
    if (data[i][0] === tipo) return i + 1;
  }
  return -1;
}
