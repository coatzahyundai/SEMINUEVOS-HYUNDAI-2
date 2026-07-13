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
  "Factura Original", "Tenencias", "Tarjeta de Circulacion", "Verificacion", "Carnet de Servicio",
  "Valuacion de Unidad (Avalúo)", "Presupuesto de Reparacion", "Guia Azul", "INE del Cliente",
  "Comprobante de Domicilio", "CURP", "Constancia de Situacion Fiscal", "Repuve", "Baja de Placas",
  "Transunion 1", "Transunion 2", "Verificacion de Factura", "Contrato de Compraventa",
  "Imagen de Escaner", "Reporte de Escaner", "VIN (Foto)"
];

function doPost(e) {
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
  return str.toString().trim().toLowerCase()
    .replace(/\s+/g, "")
    .replace(/_/g, "")
    .replace(/ñ/g, "n")
    .replace(/[áäâ]/g, "a")
    .replace(/[éëê]/g, "e")
    .replace(/[íïî]/g, "i")
    .replace(/[óöô]/g, "o")
    .replace(/[úüû]/g, "u")
    .replace(/[^a-z0-9]/g, "");
}

function getHeaderMap(sheet) {
  var headers = sheet.getRange(2, 1, 1, sheet.getLastColumn()).getValues()[0];
  var normalizedHeaders = headers.map(normalizeKey);
  
  var findColIndex = function(possibleNames) {
    for (var i = 0; i < possibleNames.length; i++) {
      var idx = normalizedHeaders.indexOf(possibleNames[i]);
      if (idx !== -1) return idx;
    }
    return -1;
  };
  
  return {
    headers: headers,
    normalized: normalizedHeaders,
    idx: {
      vin: findColIndex(["vin", "nvin", "numerodevin", "serie", "numerodeserie", "chasis"]),
      fecha: findColIndex(["fecha", "date", "fechadeingreso"]),
      cliente: findColIndex(["cliente", "nombre", "nombrecliente", "propietario", "clienteoproveedor"]),
      marca: findColIndex(["marca"]),
      linea: findColIndex(["linea", "submarca", "tipo", "vehiculo", "modelo"]), 
      modelo: findColIndex(["ano", "año", "year", "modelo"]), 
      version: findColIndex(["version", "paquete", "equipamiento"]),
      km: findColIndex(["km", "kilometraje", "kilometros"]),
      placa: findColIndex(["placa", "placas", "matricula"]),
      precio_compra: findColIndex(["preciocompra", "preciodecompra", "compra", "preciopagado"]),
      precio_venta: findColIndex(["precioventa", "preciodeventa", "venta", "preciopublico"]),
      toma: findColIndex(["preciodetoma", "preciotoma", "toma", "avaluo", "preciotomaavaluo"]),
      dacion: findColIndex(["dacion", "dacionenpago", "engancheneutro", "dacionpago"]),
      liq_financiera: findColIndex(["liqfinanciera", "liquidacion", "liquidacionfinanciera", "financiera", "liq"]),
      dev_cliente: findColIndex(["devcliente", "devolucion", "devolucioncliente", "dev"]),
      rec_marca: findColIndex(["recmarca", "recompramarca"]),
      rec_modelo: findColIndex(["recmodelo", "recompramodelo"]),
      rec_vin: findColIndex(["recvin", "recompravin"]),
      asesor: findColIndex(["asesor", "vendedor", "ejecutivo"]),
      estatus: findColIndex(["estatus", "estado", "status"])
    }
  };
}

// Devuelve el inventario dinámico con todos los campos (soluciona el problema de datos vacíos en Sección 3)
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
    
    // Filtrado original por nivel
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
    if (map.idx[key] !== -1 && val !== undefined && val !== null) {
      newRow[map.idx[key]] = val;
    }
  };
  
  assign("vin", formData.vin);
  assign("fecha", formData.fecha);
  assign("cliente", formData.cliente);
  assign("marca", formData.marca);
  assign("linea", formData.linea || formData.modelo); // fallback para coincidir con la fila 2
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
  assign("estatus", formData.estatus || (currentDataRow ? currentDataRow[map.idx["estatus"]] : ESTATUS.CAPTURA));
  
  if (map.idx["vin"] === -1) newRow[0] = formData.vin || "";
  
  return newRow;
}

function saveInitialRecord(formData) {
  var ss = SpreadsheetApp.openById(ID_SHEET);
  var sheet = ss.getSheetByName("TomasUnidades");
  var lastRow = sheet.getLastRow();
  
  if(lastRow >= 3) {
    var vinData = sheet.getRange(3, 1, lastRow-2, 1).getValues();
    for(var i=0; i<vinData.length; i++){
      if(vinData[i][0] === formData.vin) return { status: "error", message: "El VIN ya está registrado."};
    }
  }
  
  var map = getHeaderMap(sheet);
  var newRow = mapFormDataToArray(formData, map, null);
  sheet.appendRow(newRow);
  
  try {
    var rootFolder = DriveApp.getFolderById(ID_CARPETA_RAIZ);
    var folderName = (formData.cliente || "Sin Cliente") + " - " + (formData.asesor || "Sin Asesor"); rootFolder.createFolder(folderName);
  } catch(e) { console.error("Error creando carpeta: " + e.toString()); }
  
  return { status: "success", message: "Registro guardado exitosamente." };
}

function updateRecord(formData) {
  var sheet = SpreadsheetApp.openById(ID_SHEET).getSheetByName("TomasUnidades");
  var rowIdx = findRowByVIN(sheet, formData.vin);
  
  if (rowIdx === -1) {
    return { status: "error", message: "No se puede actualizar, VIN no encontrado." };
  }
  
  var map = getHeaderMap(sheet);
  var currentData = sheet.getRange(rowIdx, 1, 1, sheet.getLastColumn()).getValues()[0];
  var updatedRow = mapFormDataToArray(formData, map, currentData);
  
  sheet.getRange(rowIdx, 1, 1, updatedRow.length).setValues([updatedRow]);
  return { status: "success", message: "Registro actualizado exitosamente." };
}

function checkVIN(vin) {
  var sheet = SpreadsheetApp.openById(ID_SHEET).getSheetByName("TomasUnidades");
  var row = findRowByVIN(sheet, vin);
  return { status: "success", exists: row !== -1 };
}

function updateStatus(vin, newStatus, options) {
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
  var headers = sheet.getRange(2, 1, 1, sheet.getLastColumn()).getValues()[0];
  var rowIdx = findRowByVIN(sheet, vin);
  if (rowIdx === -1) return { status: "error", message: "VIN no encontrado." };
  var rowData = sheet.getRange(rowIdx, 1, 1, sheet.getLastColumn()).getValues()[0];
  var loadedFiles = [];
  for (var i = 0; i < headers.length; i++) {
    if (DOCS_TODOS.indexOf(headers[i]) !== -1 && rowData[i]) {
      try {
        var file = DriveApp.getFileById(rowData[i]);
        loadedFiles.push({ type: headers[i], name: file.getName(), url: file.getUrl() });
      } catch(e) {
        loadedFiles.push({ type: headers[i], name: "Archivo inaccesible en Drive", error: true });
      }
    }
  }
  return { status: "success", data: loadedFiles };
}

function uploadFileToDrive(vin, docType, fileName, mimeType, fileDataBase64, folderName) {
  var sheet = SpreadsheetApp.openById(ID_SHEET).getSheetByName("TomasUnidades");
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
  var headers = sheet.getRange(2, 1, 1, sheet.getLastColumn()).getValues()[0];
  var colIdx = -1;
  for(var i=0; i<headers.length; i++){ if(headers[i] === docType){ colIdx = i+1; break; } }
  if(colIdx === -1) return { status: "error", message: "Columna de documento no encontrada: " + docType };
  var rowIdx = findRowByVIN(sheet, vin);
  sheet.getRange(rowIdx, colIdx).setValue(fileId);
  return { status: "success", message: "Guardado.", url: file.getUrl() };
}

function saveValuationData(vin, valData) {
  var ss = SpreadsheetApp.openById(ID_SHEET);
  var sheet = ss.getSheetByName("Avaluos");
  if(!sheet) return { status: "error", message: "No se encontró pestaña 'Avaluos'." };
  var newRow = [
    vin, new Date(), valData.observaciones, JSON.stringify(valData.cargos), 
    valData.grand_total, valData.mantenimientos, valData.orden_servicio, valData.tecnico
  ];
  sheet.appendRow(newRow);
  updateStatus(vin, ESTATUS.AVALUO_LISTO);
  return { status: "success", message: "Avalúo técnico guardado." };
}

function findRowByVIN(sheet, vin) {
  var lastRow = sheet.getLastRow();
  if(lastRow < 3) return -1;
  var vinData = sheet.getRange(3, 1, lastRow - 2, 1).getValues();
  for (var i = 0; i < vinData.length; i++) { if (vinData[i][0] === vin) return i + 3; }
  return -1;
}

function doGet(e) {
  return ContentService.createTextOutput("Servicio Activo. Script Robusto (Compatible con Sección 1, 2 y 3).").setMimeType(ContentService.MimeType.TEXT);
}

// ------ FUNCIONES NUEVAS INTEGRADAS ------ //

function saveCloudData(payload) {
  try {
    var ss = SpreadsheetApp.openById(ID_SHEET);
    var sheet = ss.getSheetByName("NubeTemporal"); // Creamos la hoja de base de datos puente
    if (!sheet) {
      sheet = ss.insertSheet("NubeTemporal");
      sheet.appendRow(["Tipo", "JSON Data", "Nombre Archivo", "Password PDF"]);
    }
    
    // Almacena estáticamente las configuraciones del Libro Azul
    if (payload.tipo === 'azul') {
      var existRow = findCloudRow(sheet, "azul");
      var dataStr = JSON.stringify(payload.dbInventario || {});
      if (existRow > 0) {
        sheet.getRange(existRow, 2).setValue(dataStr);
      } else {
        sheet.appendRow(["azul", dataStr, "", ""]);
      }
    }
    
    // Almacena estáticamente las configuraciones de la Base de Citas
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
    
    // Extrae arreglos del Excels anclados en Backend
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

    // Fusiona la info recolectando también a los usuarios
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
