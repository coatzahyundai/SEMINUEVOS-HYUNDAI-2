const fs = require('fs');
let code = fs.readFileSync('appscript_v5.js', 'utf8');

// Patch uploadFileToDrive
let newUploadFunc = `function uploadFileToDrive(vin, docType, fileName, mimeType, fileDataBase64, folderName) {
  var sheet = SpreadsheetApp.openById(ID_SHEET).getSheetByName("TomasUnidades");
  var headersRow2 = sheet.getRange(2, 1, 1, sheet.getLastColumn()).getValues()[0];
  var headersRow3 = sheet.getRange(3, 1, 1, sheet.getLastColumn()).getValues()[0];
  var colIdx = -1;
  var normalizedDocType = normalizeKey(docType); 
  
  // Buscar en la fila 2 y 3
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

  colIdx = findCol(headersRow3);
  if (colIdx === -1) colIdx = findCol(headersRow2);

  if(colIdx === -1) return { status: "error", message: "Columna de documento no encontrada: " + docType + ". (Buscado en filas 2 y 3)." };
  
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
}`;

code = code.replace(/function uploadFileToDrive[\s\S]*?return { status: "success", message: "Guardado\.", url: file\.getUrl\(\) \};\n\}/, newUploadFunc);

// Patch getFilesForVin
let newGetFilesFunc = `function getFilesForVin(vin) {
  var sheet = SpreadsheetApp.openById(ID_SHEET).getSheetByName("TomasUnidades");
  var headersRow2 = sheet.getRange(2, 1, 1, sheet.getLastColumn()).getValues()[0];
  var headersRow3 = sheet.getRange(3, 1, 1, sheet.getLastColumn()).getValues()[0];
  var rowIdx = findRowByVIN(sheet, vin);
  if (rowIdx === -1) return { status: "error", message: "VIN no encontrado." };
  var rowData = sheet.getRange(rowIdx, 1, 1, sheet.getLastColumn()).getValues()[0];
  var loadedFiles = [];
  var normalizedDocsTodos = DOCS_TODOS.map(normalizeKey);
  
  // Helper para buscar el index del docType en base al header de la hoja
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

  // Iteramos sobre las columnas para encontrar archivos. Damos prioridad a fila 3, luego fila 2.
  var maxCols = Math.max(headersRow2.length, headersRow3.length);
  for (var i = 0; i < maxCols; i++) {
    var docIdx = getDocIdx(headersRow3[i]);
    if (docIdx === -1) docIdx = getDocIdx(headersRow2[i]);
    
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
}`;

code = code.replace(/function getFilesForVin[\s\S]*?return \{ status: "success", data: loadedFiles \};\n\}/, newGetFilesFunc);

// IMPORTANT: Fix getHeaderMap to ALSO check row 3 for the data headers!
let newGetHeaderMap = `function getHeaderMap(sheet) {
  var headersRow2 = sheet.getRange(2, 1, 1, sheet.getLastColumn()).getValues()[0];
  var headersRow3 = sheet.getRange(3, 1, 1, sheet.getLastColumn()).getValues()[0];
  var normalizedHeaders2 = headersRow2.map(normalizeKey);
  var normalizedHeaders3 = headersRow3.map(normalizeKey);
  
  var findColIndex = function(possibleNames) {
    for (var i = 0; i < possibleNames.length; i++) {
      // Priorizamos fila 3 y luego fila 2
      var idx = normalizedHeaders3.indexOf(possibleNames[i]);
      if (idx !== -1) return idx;
      idx = normalizedHeaders2.indexOf(possibleNames[i]);
      if (idx !== -1) return idx;
    }
    return -1;
  };

  var map = {
    vin: findColIndex(["vin", "numero de serie", "chasis"]),
    fecha: findColIndex(["fecha", "date", "fecha de ingreso"]),
    cliente: findColIndex(["cliente", "nombre del cliente", "propietario"]),
    marca: findColIndex(["marca"]),
    linea: findColIndex(["linea", "modelo", "submarca"]),
    modelo: findColIndex(["año", "ano", "year", "modelo_ano", "modelo año"]),
    version: findColIndex(["version", "tipo"]),
    color: findColIndex(["color"]),
    km: findColIndex(["km", "kilometraje", "kilometros"]),
    placa: findColIndex(["placa", "placas", "matricula"]),
    precio_compra: findColIndex(["precio de toma", "toma", "toma en agencia", "precio compra", "toma o valor comercial"]),
    precio_venta: findColIndex(["precio de venta", "venta", "precio publico"]),
    toma: findColIndex(["toma real", "toma", "precio toma"]),
    dacion: findColIndex(["dacion", "dacion en pago"]),
    liq_financiera: findColIndex(["liquidacion", "liquidacion financiera", "liq financiera"]),
    dev_cliente: findColIndex(["devolucion", "devolucion a cliente", "dev cliente"]),
    estatus: findColIndex(["estatus", "estado", "status"]),
    rec_marca: findColIndex(["marca a llevar", "marca nueva", "marca rec"]),
    rec_modelo: findColIndex(["modelo a llevar", "modelo nuevo", "modelo rec"]),
    rec_vin: findColIndex(["vin a llevar", "vin nuevo", "vin rec"]),
    asesor: findColIndex(["asesor", "vendedor", "asesor de ventas", "ejecutivo", "asesor comercial"])
  };
  return { idx: map, rawRow2: headersRow2, rawRow3: headersRow3 };
}`;

code = code.replace(/function getHeaderMap[\s\S]*?return \{ idx: map, raw: headers \};\n\}/, newGetHeaderMap);

fs.writeFileSync('appscript_v5.js', code);
