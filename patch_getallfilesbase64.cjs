const fs = require('fs');
let code = fs.readFileSync('appscript_final.js', 'utf8');

const newFunction = `
function getAllFilesBase64(vin) {
  var sheet = SpreadsheetApp.openById(ID_SHEET).getSheetByName("TomasUnidades");
  var headersRow2 = sheet.getRange(2, 1, 1, sheet.getLastColumn()).getValues()[0];
  var rowIdx = findRowByVIN(sheet, vin);
  if (rowIdx === -1) return { status: "error", message: "VIN no encontrado." };
  
  var rowData = sheet.getRange(rowIdx, 1, 1, sheet.getLastColumn()).getValues()[0];
  var filesData = [];
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
        var blob = file.getBlob();
        filesData.push({
          name: file.getName(),
          mimeType: blob.getContentType(),
          base64: Utilities.base64Encode(blob.getBytes())
        });
      } catch(e) {
        // skip if inaccessible
      }
    }
  }
  
  return { status: "success", data: filesData };
}
`;

// Also add it to doPost dispatch
code = code.replace(
  /if \(action === 'getFilesForVin'\) \{\s*return ContentService\.createTextOutput\(JSON\.stringify\(getFilesForVin\(req\.vin\)\)\)\.setMimeType\(ContentService\.MimeType\.JSON\);\s*\}/,
  `if (action === 'getFilesForVin') {
      return ContentService.createTextOutput(JSON.stringify(getFilesForVin(req.vin))).setMimeType(ContentService.MimeType.JSON);
    }
    if (action === 'getAllFilesBase64') {
      return ContentService.createTextOutput(JSON.stringify(getAllFilesBase64(req.vin))).setMimeType(ContentService.MimeType.JSON);
    }`
);

code = code + '\n' + newFunction;

fs.writeFileSync('appscript_final.js', code);
