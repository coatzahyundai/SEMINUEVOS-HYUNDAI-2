const fs = require('fs');
let code = fs.readFileSync('appscript_v9.js', 'utf8');

const newSaveValuation = `function saveValuationData(vin, valData) {
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
}`;

code = code.substring(0, code.indexOf('function saveValuationData(vin, valData)')) + 
       newSaveValuation + '\n\n' + 
       code.substring(code.indexOf('function findRowByVIN(sheet, vin)'));

code = code.replace("function doPost(e) {", "function doPost(e) {\n  var p = e.postData.contents; var parsed = JSON.parse(p); if(parsed.action === 'getValuationData') { return ContentService.createTextOutput(JSON.stringify(getValuationData(parsed.vin))).setMimeType(ContentService.MimeType.JSON); } if(parsed.action === 'deleteRecord') { return ContentService.createTextOutput(JSON.stringify(deleteRecord(parsed.vin))).setMimeType(ContentService.MimeType.JSON); }\n");
code = code.replace("Servicio Activo. Script Robusto v9 (Combined Aliases).", "Servicio Activo. Script Robusto v10.");

fs.writeFileSync('appscript_v10.js', code);
