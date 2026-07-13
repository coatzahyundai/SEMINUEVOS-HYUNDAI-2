const fs = require('fs');
let code = fs.readFileSync('appscript_v5.js', 'utf8');

code = code.replace(
  /for \(var i = 0; i < headers\.length; i\+\+\) \{\s*if \(DOCS_TODOS\.indexOf\(headers\[i\]\) !== -1 && rowData\[i\]\) \{\s*try \{\s*var file = DriveApp\.getFileById\(rowData\[i\]\);\s*loadedFiles\.push\(\{ type: headers\[i\], name: file\.getName\(\), url: file\.getUrl\(\) \}\);\s*\} catch\(e\) \{\s*loadedFiles\.push\(\{ type: headers\[i\], name: "Archivo inaccesible en Drive", error: true \}\);\s*\}\s*\}\s*\}/g,
  `var normalizedDocsTodos = DOCS_TODOS.map(normalizeKey);
  for (var i = 0; i < headers.length; i++) {
    var normalizedHeader = normalizeKey(headers[i]);
    var docIdx = normalizedDocsTodos.indexOf(normalizedHeader);
    if (docIdx !== -1 && rowData[i]) {
      try {
        var file = DriveApp.getFileById(rowData[i]);
        loadedFiles.push({ type: DOCS_TODOS[docIdx], name: file.getName(), url: file.getUrl() });
      } catch(e) {
        loadedFiles.push({ type: DOCS_TODOS[docIdx], name: "Archivo inaccesible en Drive", error: true });
      }
    }
  }`
);

fs.writeFileSync('appscript_v5.js', code);
