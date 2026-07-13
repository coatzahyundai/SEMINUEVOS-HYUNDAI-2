const fs = require('fs');
let code = fs.readFileSync('appscript_final.js', 'utf8');

code = code.replace(
  /var map = getHeaderMap\(sheet\);\s*var data = sheet\.getRange\(3, 1, lastRow - 2, sheet\.getLastColumn\(\)\)\.getValues\(\);/,
  `var map = getHeaderMap(sheet);
  var data = sheet.getRange(3, 1, lastRow - 2, sheet.getLastColumn()).getValues();

  var avaluosSheet = ss.getSheetByName("Avaluos");
  var avaluosMap = {};
  if (avaluosSheet) {
    var avaluosLastRow = avaluosSheet.getLastRow();
    if (avaluosLastRow >= 2) {
      var avaluosData = avaluosSheet.getRange(2, 1, avaluosLastRow - 1, 2).getValues(); // A: VIN, B: ESTATUS
      for (var a = 0; a < avaluosData.length; a++) {
        var aVin = avaluosData[a][0];
        var aEst = avaluosData[a][1];
        if (aVin) avaluosMap[aVin.toString().trim()] = aEst;
      }
    }
  }`
);

code = code.replace(
  /if \(!obj\.vin\) obj\.vin = row\[0\];/,
  `if (!obj.vin) obj.vin = row[0];
    obj.estatus_avaluo = avaluosMap[obj.vin.toString().trim()] || "";`
);

fs.writeFileSync('appscript_final.js', code);
