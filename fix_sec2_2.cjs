const fs = require('fs');
let code = fs.readFileSync('src/components/Section2.tsx', 'utf8');

code = code.replace(
  /<div className="bg-white px-5 py-2 mb-3 flex justify-between items-center rounded-md shadow-sm shrink-0">\s*<span className="font-bold text-\[\#002c5f\] truncate max-w-\[200px\] md:max-w-md">\s*BASE CITAS:/,
  `<div className="bg-[#002c5f] text-white px-5 py-2 mb-3 flex justify-between items-center rounded-md shadow-sm shrink-0">
        <span className="font-bold truncate max-w-[200px] md:max-w-md flex items-center gap-3">
          <button onClick={() => setCurrentSection(0)} className="p-2 bg-white/20 hover:bg-white/30 rounded transition-colors" title="Volver al Inicio">
            <Home size={20} />
          </button>
          BASE CITAS:`
);

fs.writeFileSync('src/components/Section2.tsx', code);
