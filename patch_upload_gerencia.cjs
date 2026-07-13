const fs = require('fs');
let code = fs.readFileSync('src/components/Section3.tsx', 'utf8');

code = code.replace(
  /disabled=\{!selectedDocType \|\| !selectedFileName \|\| uploading \|\| \(selectedItem\?\.estatus === 'Poliza'\)\}/,
  `disabled={!selectedDocType || !selectedFileName || uploading || (selectedItem?.estatus === 'Poliza' && user.role !== 'gerencia')}`
);

fs.writeFileSync('src/components/Section3.tsx', code);
