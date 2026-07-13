const fs = require('fs');
let code = fs.readFileSync('src/components/ValuationModal.tsx', 'utf8');

code = code.replace(
  /const iva = \(data\.subtotal_mecanica \+ data\.subtotal_mo \+ data\.subtotal_hyp\) \* 0\.16;/g,
  "const iva = ((Number(data.subtotal_mecanica)||0) + (Number(data.subtotal_mo)||0) + (Number(data.subtotal_hyp)||0)) * 0.16;"
);

code = code.replace(
  /const sub = data\.subtotal_mecanica \+ data\.subtotal_mo \+ data\.subtotal_hyp;/g,
  "const sub = (Number(data.subtotal_mecanica)||0) + (Number(data.subtotal_mo)||0) + (Number(data.subtotal_hyp)||0);"
);

code = code.replace(
  /const sumM = newData\.mecanica\.reduce\(\(a, b\) => a \+ Number\(b\.importe \|\| 0\), 0\);/g,
  "const sumM = (newData.mecanica || []).reduce((a, b) => a + Number(b.importe || 0), 0);"
);

code = code.replace(
  /const sumMO = newData\.mano_obra\.reduce\(\(a, b\) => a \+ Number\(b\.importe \|\| 0\), 0\);/g,
  "const sumMO = (newData.mano_obra || []).reduce((a, b) => a + Number(b.importe || 0), 0);"
);

code = code.replace(
  /const sumHYP = newData\.hyp\.reduce\(\(a, b\) => a \+ Number\(b\.importe \|\| 0\), 0\);/g,
  "const sumHYP = (newData.hyp || []).reduce((a, b) => a + Number(b.importe || 0), 0);"
);

fs.writeFileSync('src/components/ValuationModal.tsx', code);
