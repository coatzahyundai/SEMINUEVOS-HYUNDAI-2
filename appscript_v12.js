function saveRecord(formData) {
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
    if (inputData.estatus) setVal("estatus", inputData.estatus); // Update status if provided
    setVal("rec_marca", inputData.rec_marca);
    setVal("rec_modelo", inputData.rec_modelo);
    setVal("rec_vin", inputData.rec_vin);
    setVal("asesor", inputData.asesor);
    
    // Dates tracking
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
  return ContentService.createTextOutput("Servicio Activo. Script Robusto v12.").setMimeType(ContentService.MimeType.TEXT);
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
