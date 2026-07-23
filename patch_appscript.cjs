const fs = require('fs');
let code = fs.readFileSync('appscript_final.js', 'utf8');

// Replace the loop in getFilesForVin
const newLoop1 = `  for (var j = 0; j < DOCS_TODOS.length; j++) {
    var expectedDoc = DOCS_TODOS[j];
    var colIdx = -1;
    var normExpected = normalizeKey(expectedDoc);
    for (var k = 0; k < headersRow2.length; k++) {
      if (normalizeKey(headersRow2[k]) === normExpected) { colIdx = k; break; }
    }
    if (colIdx !== -1 && rowData[colIdx] && rowData[colIdx].toString().trim() !== "") {
      try {
        var fileId = rowData[colIdx].toString().trim();
        if (fileId.indexOf(',') !== -1) {
           var parts = fileId.split(',');
           fileId = parts[parts.length - 1].trim();
        }
        var file = DriveApp.getFileById(fileId);
        loadedFiles.push({ type: DOCS_TODOS[j], name: file.getName(), url: file.getUrl() });
      } catch(e) {
        loadedFiles.push({ type: DOCS_TODOS[j], name: "Archivo inaccesible en Drive", error: true });
      }
    }
  }`;

const oldLoop1Regex = /for\s*\(\s*var\s*i\s*=\s*0;\s*i\s*<\s*headersRow2\.length;\s*i\+\+\s*\)\s*\{[\s\S]*?loadedFiles\.push[\s\S]*?\}\s*\}/;

code = code.replace(oldLoop1Regex, newLoop1);


// Replace the loop in getAllFilesBase64
const newLoop2 = `  for (var j = 0; j < DOCS_TODOS.length; j++) {
    var expectedDoc = DOCS_TODOS[j];
    var colIdx = -1;
    var normExpected = normalizeKey(expectedDoc);
    for (var k = 0; k < headersRow2.length; k++) {
      if (normalizeKey(headersRow2[k]) === normExpected) { colIdx = k; break; }
    }
    if (colIdx !== -1 && rowData[colIdx] && rowData[colIdx].toString().trim() !== "") {
      try {
        var fileId = rowData[colIdx].toString().trim();
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
  }`;

const oldLoop2Regex = /for\s*\(\s*var\s*i\s*=\s*0;\s*i\s*<\s*headersRow2\.length;\s*i\+\+\s*\)\s*\{[\s\S]*?filesData\.push[\s\S]*?\}\s*\}/;

code = code.replace(oldLoop2Regex, newLoop2);

fs.writeFileSync('appscript_final.js', code);
console.log("Done");
