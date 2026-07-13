const fs = require('fs');
let code = fs.readFileSync('src/components/Section3.tsx', 'utf8');

code = code.replace(
  /disabled=\{!selectedDocType \|\| !selectedFileName \|\| uploading\}/,
  `disabled={!selectedDocType || !selectedFileName || uploading || (selectedItem?.estatus === 'Poliza')}`
);

fs.writeFileSync('src/components/Section3.tsx', code);
