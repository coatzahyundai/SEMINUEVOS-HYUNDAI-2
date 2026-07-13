const fs = require('fs');
let code = fs.readFileSync('appscript_final.js', 'utf8');

code = code.replace(
  /var findColIndex = function\(possibleNames\) \{\s*for \(var i = 0; i < possibleNames\.length; i\+\+\) \{\s*var idx = normalizedHeaders2\.indexOf\(possibleNames\[i\]\);/g,
  `var findColIndex = function(possibleNames) {
    for (var i = 0; i < possibleNames.length; i++) {
      var normalizedName = possibleNames[i].toLowerCase().replace(/\\s+/g, "").replace(/_/g, "").replace(/ñ/g, "n");
      var idx = normalizedHeaders2.indexOf(normalizedName);`
);

fs.writeFileSync('appscript_final.js', code);
