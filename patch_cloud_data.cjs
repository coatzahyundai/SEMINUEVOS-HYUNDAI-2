const fs = require('fs');
let code = fs.readFileSync('appscript_v5.js', 'utf8');

const newFunc = `function getCloudData() {
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
}`;

code = code.replace(/function getCloudData[\s\S]*?return \{ status: "error", message: e\.toString\(\) \};\n  \}\n\}/, newFunc);

fs.writeFileSync('appscript_v5.js', code);
