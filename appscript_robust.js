var ID_SHEET = "1ZOGeuRffM4Z1uhX0RziijInmPTpYm4KDOViMjr6GnHU";
var ID_FOLDER_PDF = "11v2P_U76W-Q4-b84A452s1D68k8O6-d1";

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
    .replace(/[^a-z0-9]/g, ""); // Keep only alphanumeric
}

function doGet(e) {
  return ContentService.createTextOutput("Servicio Activo y Listo. Script Robusto V2.").setMimeType(ContentService.MimeType.TEXT);
}

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return ContentService.createTextOutput(JSON.stringify({ status: "error", message: "No se recibieron datos." })).setMimeType(ContentService.MimeType.JSON);
    }
    
    var data = JSON.parse(e.postData.contents);
    var action = data.action;
    var result;
    
    switch (action) {
      case "save_record": result = saveInitialRecord(data.data); break;
      case "update_record": result = updateRecord(data.data); break;
      case "check_vin": result = checkVIN(data.vin); break;
      case "get_cloud_data": result = getCloudData(); break;
      case "get_records": result = getRecords(); break;
      case "upload_file": result = uploadFile(data); break;
      case "get_files_for_vin": result = getFilesForVin(data); break;
      default:
        result = { status: "error", message: "Acción no reconocida: " + action };
    }
    
    return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: "Error del Servidor: " + error.toString() })).setMimeType(ContentService.MimeType.JSON);
  }
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
      modelo: findColIndex(["ano", "año", "year", "modelo"]), // Algunas veces modelo es el año
      version: findColIndex(["version", "paquete", "equipamiento"]),
      km: findColIndex(["km", "kilometraje", "kilometros"]),
      placa: findColIndex(["placa", "placas", "matricula"]),
      precio_compra: findColIndex(["preciocompra", "preciodecompra", "compra", "preciopagado"]),
      precio_venta: findColIndex(["precioventa", "preciodeventa", "venta", "preciopublico"]),
      toma: findColIndex(["preciodetoma", "preciotoma", "toma", "avaluo", "preciotomaavaluo"]),
      dacion: findColIndex(["dacion", "dacionenpago", "engancheneutro"]),
      liq_financiera: findColIndex(["liqfinanciera", "liquidacion", "liquidacionfinanciera", "financiera"]),
      dev_cliente: findColIndex(["devcliente", "devolucion", "devolucioncliente"]),
      rec_marca: findColIndex(["recmarca", "recompramarca"]),
      rec_modelo: findColIndex(["recmodelo", "recompramodelo"]),
      rec_vin: findColIndex(["recvin", "recompravin"]),
      asesor: findColIndex(["asesor", "vendedor", "ejecutivo"]),
      estatus: findColIndex(["estatus", "estado", "status"])
    }
  };
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
  assign("linea", formData.linea);
  assign("modelo", formData.modelo);
  assign("version", formData.version);
  assign("km", formData.km);
  assign("placa", formData.placa);
  assign("precio_compra", formData.precio_compra);
  assign("precio_venta", formData.precio_venta);
  assign("toma", formData.precio_toma || formData.toma);
  assign("dacion", formData.dacion);
  assign("liq_financiera", formData.liq_financiera);
  assign("dev_cliente", formData.dev_cliente);
  assign("rec_marca", formData.rec_marca);
  assign("rec_modelo", formData.rec_modelo);
  assign("rec_vin", formData.rec_vin);
  assign("asesor", formData.asesor);
  assign("estatus", formData.estatus || (currentDataRow ? currentDataRow[map.idx["estatus"]] : "CAPTURA"));
  
  // Garantizar que VIN al menos esté en la primera columna si no se encontró un encabezado
  if (map.idx["vin"] === -1) newRow[0] = formData.vin || "";
  
  return newRow;
}

function findRowByVIN(sheet, vin) {
  var lastRow = sheet.getLastRow();
  if (lastRow < 3) return -1;
  var vinCol = sheet.getRange(3, 1, lastRow - 2, 1).getValues();
  for (var i = 0; i < vinCol.length; i++) {
    if (vinCol[i][0].toString().trim().toUpperCase() === vin.toString().trim().toUpperCase()) {
      return i + 3;
    }
  }
  return -1;
}

function checkVIN(vin) {
  var sheet = SpreadsheetApp.openById(ID_SHEET).getSheetByName("TomasUnidades");
  var row = findRowByVIN(sheet, vin);
  return { status: "success", exists: row !== -1 };
}

function saveInitialRecord(formData) {
  var ss = SpreadsheetApp.openById(ID_SHEET);
  var sheet = ss.getSheetByName("TomasUnidades");
  var map = getHeaderMap(sheet);
  
  var newRow = mapFormDataToArray(formData, map, null);
  sheet.appendRow(newRow);
  
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

function getRecords() {
  var sheet = SpreadsheetApp.openById(ID_SHEET).getSheetByName("TomasUnidades");
  var lastRow = sheet.getLastRow();
  if (lastRow < 3) return { status: "success", data: [] };
  
  var map = getHeaderMap(sheet);
  var data = sheet.getRange(3, 1, lastRow - 2, sheet.getLastColumn()).getValues();
  
  var records = [];
  for (var i = 0; i < data.length; i++) {
    var obj = {};
    for (var key in map.idx) {
      if (map.idx[key] !== -1) {
        obj[key] = data[i][map.idx[key]];
      }
    }
    // Si la hoja no tiene una columna VIN mapeada explícitamente, tomamos la 1ra
    if (!obj.vin) obj.vin = data[i][0];
    
    // Solo devolvemos si hay VIN
    if (obj.vin && obj.vin.toString().trim() !== "") {
      records.push(obj);
    }
  }
  
  return { status: "success", data: records };
}

function getCloudData() {
  try {
    var ss = SpreadsheetApp.openById(ID_SHEET);
    
    var invSheet = ss.getSheetByName("Inventario");
    var dbInventario = {};
    if (invSheet) {
      var invData = invSheet.getDataRange().getValues();
      if (invData.length > 1) {
        for (var i = 1; i < invData.length; i++) {
          var marca = invData[i][0];
          var vehiculo = invData[i][1];
          var precioStr = invData[i][2];
          var precio = parseFloat(precioStr.toString().replace(/[^0-9.]/g, ""));
          if (!marca || !vehiculo) continue;
          
          if (!dbInventario[marca]) dbInventario[marca] = [];
          dbInventario[marca].push({ v: vehiculo, p: isNaN(precio) ? 0 : precio });
        }
      }
    }
    
    var citasSheet = ss.getSheetByName("Citas");
    var citasData = citasSheet ? citasSheet.getDataRange().getValues() : [];
    
    var usSheet = ss.getSheetByName("Usuarios");
    var usData = usSheet ? usSheet.getDataRange().getValues() : [];
    
    return {
      status: "success",
      data: {
        dbInventario: dbInventario,
        rawCitasExcel: citasData,
        usuarios: usData
      }
    };
  } catch(e) {
    return { status: "error", message: e.toString() };
  }
}

function getOrCreateFolder(parentFolder, folderName) {
  var folders = parentFolder.getFoldersByName(folderName);
  if (folders.hasNext()) {
    return folders.next();
  }
  return parentFolder.createFolder(folderName);
}

function uploadFile(data) {
  try {
    var parent = DriveApp.getFolderById(ID_FOLDER_PDF);
    var targetFolder = getOrCreateFolder(parent, data.folderName || data.vin);
    
    var blob = Utilities.newBlob(Utilities.base64Decode(data.fileData), data.mimeType, data.fileName);
    var file = targetFolder.createFile(blob);
    var url = file.getUrl();
    
    var sheet = SpreadsheetApp.openById(ID_SHEET).getSheetByName("TomasUnidades");
    var rowIdx = findRowByVIN(sheet, data.vin);
    if (rowIdx !== -1 && data.docType) {
      var map = getHeaderMap(sheet);
      var typeNorm = normalizeKey(data.docType);
      
      for (var i = 0; i < map.normalized.length; i++) {
        if (map.normalized[i] === typeNorm || map.normalized[i] === ("url"+typeNorm)) {
          sheet.getRange(rowIdx, i + 1).setValue(url);
          break;
        }
      }
    }
    
    return { status: "success", url: url, message: "Archivo subido exitosamente." };
  } catch(e) {
    return { status: "error", message: e.toString() };
  }
}

function getFilesForVin(data) {
  try {
    var parent = DriveApp.getFolderById(ID_FOLDER_PDF);
    var folders = parent.getFoldersByName(data.folderName || data.vin);
    if (!folders.hasNext()) {
      return { status: "success", data: [] };
    }
    var folder = folders.next();
    var files = folder.getFiles();
    var fileList = [];
    while (files.hasNext()) {
      var file = files.next();
      fileList.push({
        name: file.getName(),
        url: file.getUrl(),
        type: "Documento"
      });
    }
    return { status: "success", data: fileList };
  } catch (e) {
    return { status: "error", message: e.toString() };
  }
}
