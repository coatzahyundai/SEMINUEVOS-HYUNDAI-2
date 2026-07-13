const fs = require('fs');
let code = fs.readFileSync('src/components/Section3.tsx', 'utf8');

code = code.replace(
  /const isFormLocked = .*?;/,
  '' // just in case it exists
);

code = code.replace(
  /\{showFormModal && \(/,
  `{showFormModal && (() => {
        const isFormLocked = selectedItem && (selectedItem.estatus === 'Poliza' || selectedItem.estatus === 'Liquidación') && user.role !== 'gerencia';
        return (`
);

// We need to replace all `onChange={` to also check `isFormLocked`? No, simpler to add `disabled={isFormLocked}` to inputs.
// But some inputs already have `disabled={!!selectedItem}` (like vin).
// We can just add `disabled={isFormLocked}` everywhere or just `disabled={isFormLocked || ...}`
// Let's replace `<input ` with `<input disabled={isFormLocked} ` but wait, for `vin` it is `<input type="text" value={formData.vin || ''} onChange={...} disabled={!!selectedItem}`.

// Let's just do a regex replace for the input tag if it doesn't have disabled.
code = code.replace(/<input type="text" value=\{formData\.([^}]+)\} onChange=\{e => handleFormChange\(([^)]+)\)\} className=/g, '<input type="text" disabled={isFormLocked} value={formData.$1} onChange={e => handleFormChange($2)} className=');

// For VIN specifically:
code = code.replace(/<input type="text" value=\{formData\.vin \|\| ''\} onChange=\{e => handleFormChange\('vin', e\.target\.value\)\} disabled=\{!!selectedItem\} className=/g, '<input type="text" value={formData.vin || ""} onChange={e => handleFormChange("vin", e.target.value)} disabled={!!selectedItem || isFormLocked} className=');

// For <select> if any:
code = code.replace(/<select value=\{formData\.([^}]+)\} onChange=\{e => handleFormChange\(([^)]+)\)\} className=/g, '<select disabled={isFormLocked} value={formData.$1} onChange={e => handleFormChange($2)} className=');

code = code.replace(
  /<button disabled=\{savingForm\} onClick=\{handleSaveForm\} className="px-5 py-2 bg-\[\#002c5f\] text-white rounded font-bold hover:bg-\[\#001a3a\] flex items-center">/,
  `{!isFormLocked && <button disabled={savingForm} onClick={handleSaveForm} className="px-5 py-2 bg-[#002c5f] text-white rounded font-bold hover:bg-[#001a3a] flex items-center">`
);

code = code.replace(
  /\{savingForm \? <RefreshCw className="animate-spin mr-2" size=\{18\} \/> : <Save className="mr-2" size=\{18\} \/>\} Guardar\s*<\/button>\s*<\/div>\s*<\/div>\s*<\/div>\s*\)}/,
  `{savingForm ? <RefreshCw className="animate-spin mr-2" size={18} /> : <Save className="mr-2" size={18} />} Guardar
              </button>}
            </div>
          </div>
        </div>
      );})()}`
);

fs.writeFileSync('src/components/Section3.tsx', code);
