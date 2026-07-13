const fs = require('fs');

const fixIsLocked = (file) => {
  let code = fs.readFileSync(file, 'utf8');
  code = code.replace(
    /const isLocked = item\.estatus === 'Poliza' && user\?\.role !== 'gerencia';/,
    `const isLocked = (item.estatus === 'Poliza' || item.estatus === 'Liquidación') && user?.role !== 'gerencia';`
  );
  fs.writeFileSync(file, code);
}

fixIsLocked('src/components/TrackingModal.tsx');
fixIsLocked('src/components/ValuationModal.tsx');

// Also for Section3.tsx, let's fix the upload action logic
let section3 = fs.readFileSync('src/components/Section3.tsx', 'utf8');
section3 = section3.replace(
  /disabled=\{!selectedDocType \|\| !selectedFileName \|\| uploading \|\| \(selectedItem\?\.estatus === 'Poliza' && user\.role !== 'gerencia'\)\}/,
  `disabled={!selectedDocType || !selectedFileName || uploading || ((selectedItem?.estatus === 'Poliza' || selectedItem?.estatus === 'Liquidación') && user.role !== 'gerencia')}`
);
fs.writeFileSync('src/components/Section3.tsx', section3);

