const fs = require('fs');
let code = fs.readFileSync('appscript_v5.js', 'utf8');

const newUploadFunc = `function uploadFileToDrive(vin, docType, fileName, mimeType, fileDataBase64, folderName) {
  var sheet = SpreadsheetApp.openById(ID_SHEET).getSheetByName("TomasUnidades");
  var headers = sheet.getRange(2, 1, 1, sheet.getLastColumn()).getValues()[0];
  var colIdx = -1;
  var normalizedDocType = normalizeKey(docType); 
  for(var i=0; i<headers.length; i++){ 
    if(normalizeKey(headers[i]) === normalizedDocType){ colIdx = i+1; break; } 
  }
  if(colIdx === -1) return { status: "error", message: "Columna de documento no encontrada: " + docType };
  
  var rowIdx = findRowByVIN(sheet, vin);
  if (rowIdx === -1) return { status: "error", message: "VIN no encontrado." };
  
  // Eliminar archivo anterior si existe
  var existingFileId = sheet.getRange(rowIdx, colIdx).getValue();
  if (existingFileId && existingFileId.toString().trim() !== "") {
    try {
      var existingFile = DriveApp.getFileById(existingFileId.toString().trim());
      existingFile.setTrashed(true);
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
