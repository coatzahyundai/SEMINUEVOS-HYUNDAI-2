const fs = require('fs');
let code = fs.readFileSync('appscript_v5.js', 'utf8');

// Patch getFilesForVin to include fuzzy matching
const newGetFilesFunc = `function getFilesForVin(vin) {
  var sheet = SpreadsheetApp.openById(ID_SHEET).getSheetByName("TomasUnidades");
  var headers = sheet.getRange(2, 1, 1, sheet.getLastColumn()).getValues()[0];
  var rowIdx = findRowByVIN(sheet, vin);
  if (rowIdx === -1) return { status: "error", message: "VIN no encontrado." };
  var rowData = sheet.getRange(rowIdx, 1, 1, sheet.getLastColumn()).getValues()[0];
  var loadedFiles = [];
  var normalizedDocsTodos = DOCS_TODOS.map(normalizeKey);
  for (var i = 0; i < headers.length; i++) {
    var normalizedHeader = normalizeKey(headers[i]);
    if (!normalizedHeader) continue;
    var docIdx = normalizedDocsTodos.indexOf(normalizedHeader);
    
    // Fallback de búsqueda parcial para soportar nombres cortados como "Verificacion de F"
    if (docIdx === -1) {
      for (var j = 0; j < normalizedDocsTodos.length; j++) {
         if (normalizedDocsTodos[j] !== "" && (normalizedDocsTodos[j].indexOf(normalizedHeader) === 0 || normalizedHeader.indexOf(normalizedDocsTodos[j]) === 0)) {
             docIdx = j;
             break;
         }
      }
    }

    if (docIdx !== -1 && rowData[i] && rowData[i].toString().trim() !== "") {
      try {
        var fileId = rowData[i].toString().trim();
        // Si hay varios IDs separados por coma (caso raro), tomar el último
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

// Patch uploadFileToDrive to include fuzzy matching
const newUploadFunc = `function uploadFileToDrive(vin, docType, fileName, mimeType, fileDataBase64, folderName) {
  var sheet = SpreadsheetApp.openById(ID_SHEET).getSheetByName("TomasUnidades");
  var headers = sheet.getRange(2, 1, 1, sheet.getLastColumn()).getValues()[0];
  var colIdx = -1;
  var normalizedDocType = normalizeKey(docType); 
  
  // Búsqueda exacta
  for(var i=0; i<headers.length; i++){ 
    if(normalizeKey(headers[i]) === normalizedDocType){ colIdx = i+1; break; } 
  }
  
  // Búsqueda parcial si no se encontró exacta (ej. columna "Verificacion de F" vs docType "VERIFICACION DE FACTURA 1")
  if (colIdx === -1) {
    for(var i=0; i<headers.length; i++){
      var normH = normalizeKey(headers[i]);
      if (normH !== "" && (normalizedDocType.indexOf(normH) === 0 || normH.indexOf(normalizedDocType) === 0)) {
        colIdx = i+1;
        break;
      }
    }
  }

  if(colIdx === -1) return { status: "error", message: "Columna de documento no encontrada: " + docType + ". Por favor verifica que la columna en la fila 2 del Excel se llame EXACTAMENTE igual." };
  
  var rowIdx = findRowByVIN(sheet, vin);
  if (rowIdx === -1) return { status: "error", message: "VIN no encontrado." };
  
  // Eliminar archivo anterior si existe
  var existingFileId = sheet.getRange(rowIdx, colIdx).getValue();
  if (existingFileId && existingFileId.toString().trim() !== "") {
    try {
      // Manejar casos donde pueda haber múltiples IDs
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

fs.writeFileSync('appscript_v5.js', code);
