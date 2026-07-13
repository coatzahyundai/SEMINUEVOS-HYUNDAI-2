const fs = require('fs');
let code = fs.readFileSync('appscript_v15.js', 'utf8');

const replacement = `
  if(valData.estatus_avaluo) {
     updateStatus(vin, valData.estatus_avaluo);
  }
  
  if (valData.fecha_avaluo) {
    try {
      var sheetToma = ss.getSheetByName("TomasUnidades");
      var rIdx = findRowByVIN(sheetToma, vin);
      if (rIdx !== -1) {
        sheetToma.getRange(rIdx, 23).setValue(valData.fecha_avaluo); // W column
      }
    } catch(e) {}
  }
  
  return { status: "success", message: "Avalúo técnico guardado." };
`;

code = code.replace(/if\(valData\.estatus_avaluo\) \{\s*updateStatus\(vin, valData\.estatus_avaluo\);\s*\}\s*return \{ status: "success", message: "Avalúo técnico guardado\." \};/, replacement.trim());
fs.writeFileSync('appscript_v15.js', code);
