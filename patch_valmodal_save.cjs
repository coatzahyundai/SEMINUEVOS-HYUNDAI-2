const fs = require('fs');
let code = fs.readFileSync('src/components/ValuationModal.tsx', 'utf8');

code = code.replace(
  /<button disabled=\{saving\} onClick=\{handleSave\} className="px-5 py-2 bg-\[\#002c5f\] text-white rounded font-bold hover:bg-\[\#001a3a\] flex items-center">/,
  `{!isLocked && <button disabled={saving} onClick={handleSave} className="px-5 py-2 bg-[#002c5f] text-white rounded font-bold hover:bg-[#001a3a] flex items-center">`
);

code = code.replace(
  /\{saving \? <RefreshCw className="animate-spin mr-2" size=\{18\} \/> : <Save className="mr-2" size=\{18\} \/>\} Guardar\s*<\/button>/,
  `{saving ? <RefreshCw className="animate-spin mr-2" size={18} /> : <Save className="mr-2" size={18} />} Guardar\n          </button>}`
);

fs.writeFileSync('src/components/ValuationModal.tsx', code);
