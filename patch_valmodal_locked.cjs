const fs = require('fs');
let code = fs.readFileSync('src/components/ValuationModal.tsx', 'utf8');

code = code.replace(
  /const \[saving, setSaving\] = useState\(false\);/,
  `const [saving, setSaving] = useState(false);\n  const isLocked = item.estatus === 'Poliza';`
);

// Add disabled={isLocked} to inputs and buttons
code = code.replace(
  /<input type="text" value=\{r\.descripcion\}/g,
  `<input type="text" disabled={isLocked} value={r.descripcion}`
);
code = code.replace(
  /<input type="number" value=\{r\.importe \|\| ''\}/g,
  `<input type="number" disabled={isLocked} value={r.importe || ''}`
);
code = code.replace(
  /<button onClick=\{\(\)=>removeRow\(section, i\)\}/g,
  `<button disabled={isLocked} onClick={()=>removeRow(section, i)}`
);
code = code.replace(
  /<button onClick=\{\(\) => addRow\(section\)\}/g,
  `<button disabled={isLocked} onClick={() => addRow(section)}`
);
code = code.replace(
  /<input type="date" value=\{data\.fecha_avaluo \|\| ''\}/g,
  `<input type="date" disabled={isLocked} value={data.fecha_avaluo || ''}`
);
code = code.replace(
  /<input type="text" value=\{data\.valuador_tecnico \|\| ''\}/g,
  `<input type="text" disabled={isLocked} value={data.valuador_tecnico || ''}`
);
code = code.replace(
  /<select value=\{data\.tiene_garantia \|\| 'NO'\}/g,
  `<select disabled={isLocked} value={data.tiene_garantia || 'NO'}`
);
code = code.replace(
  /<select value=\{data\.estatus_avaluo \|\| 'AVALUO TERMINADO'\}/g,
  `<select disabled={isLocked} value={data.estatus_avaluo || 'AVALUO TERMINADO'}`
);
code = code.replace(
  /<textarea value=\{data\.observaciones \|\| ''\}/g,
  `<textarea disabled={isLocked} value={data.observaciones || ''}`
);

// Hide save button if locked
code = code.replace(
  /<button\s*onClick=\{handleSave\}\s*disabled=\{saving\}\s*className="bg-\[\#1e8449\] hover:bg-\[\#166534\] text-white px-4 py-2 rounded flex items-center font-bold text-sm transition-colors"\s*>/g,
  `{!isLocked && <button 
              onClick={handleSave} 
              disabled={saving} 
              className="bg-[#1e8449] hover:bg-[#166534] text-white px-4 py-2 rounded flex items-center font-bold text-sm transition-colors"
            >`
);

// Close the conditional block for the save button
code = code.replace(
  /<Save size=\{18\} className="mr-2" \/>\s*\{saving \? 'Guardando\.\.\.' : 'Guardar Presupuesto'\}\s*<\/button>/g,
  `<Save size={18} className="mr-2" />
              {saving ? 'Guardando...' : 'Guardar Presupuesto'}
            </button>}`
);

fs.writeFileSync('src/components/ValuationModal.tsx', code);
