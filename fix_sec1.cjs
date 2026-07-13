const fs = require('fs');
let code1 = fs.readFileSync('src/components/Section1.tsx', 'utf8');

code1 = code1.replace(
  /<div className="bg-white px-5 py-2 mb-3 flex justify-between items-center rounded-md shadow-sm shrink-0">\s*<span className="font-bold text-\[\#002c5f\]">COTIZADOR DE TOMA<\/span>\s*<button onClick=\{\(\) => setCurrentSection\(0\)\} className="px-4 py-1\.5 border border-gray-300 rounded hover:bg-gray-50 text-sm">Inicio<\/button>\s*<\/div>/,
  `<div className="bg-[#002c5f] text-white px-5 py-2 mb-3 flex items-center gap-3 rounded-md shadow-sm shrink-0">
        <button onClick={() => setCurrentSection(0)} className="p-2 bg-white/20 hover:bg-white/30 rounded transition-colors" title="Volver al Inicio">
          <Home size={20} />
        </button>
        <span className="font-bold">COTIZADOR DE TOMA</span>
      </div>`
);
fs.writeFileSync('src/components/Section1.tsx', code1);
