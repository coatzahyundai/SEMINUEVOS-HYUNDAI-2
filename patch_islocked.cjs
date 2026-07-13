const fs = require('fs');
let code = fs.readFileSync('src/components/Section3.tsx', 'utf8');

code = code.replace(
  /const isLocked = item\.estatus === 'POLIZA ENVIADA' && user\.role !== 'gerencia'; \/\/ Locks for non-managers if POLIZA ENVIADA/,
  `const isLocked = item.estatus === 'Poliza'; // Lock editing and uploading once it's Poliza`
);

// We need to NOT disable the valuation button so they can consult it
code = code.replace(
  /\{ \(user\.role === 'servicio' \|\| user\.role === 'gerencia'\) && \(\s*<button \s*disabled=\{isLocked\}\s*onClick=\{\(\) => \{ setSelectedItem\(item\); setShowValuationModal\(true\); \}\}/,
  `{ (user.role === 'servicio' || user.role === 'gerencia') && (
                           <button 
                            onClick={() => { setSelectedItem(item); setShowValuationModal(true); }}`
);

fs.writeFileSync('src/components/Section3.tsx', code);
