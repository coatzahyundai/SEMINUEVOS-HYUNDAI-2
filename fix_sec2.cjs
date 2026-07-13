const fs = require('fs');
let code = fs.readFileSync('src/components/Section2.tsx', 'utf8');

code = code.replace(
  /<div className="bg-white px-5 py-3 mb-3 flex justify-between items-center rounded-md shadow-sm shrink-0">/,
  `<div className="bg-[#002c5f] text-white px-5 py-3 mb-3 flex justify-between items-center rounded-md shadow-sm shrink-0">`
);

code = code.replace(
  /<span className="font-bold text-\[\#002c5f\] text-lg md:text-xl">/,
  `<span className="font-bold text-white text-lg md:text-xl flex items-center gap-3">
          <button onClick={() => setCurrentSection(0)} className="p-2 bg-white/20 hover:bg-white/30 rounded transition-colors" title="Volver al Inicio">
            <Home size={20} />
          </button>
          PLANIFICADOR CITA`
);
code = code.replace(
  /PLANIFICADOR CITA PLANIFICADOR CITA/,
  'PLANIFICADOR CITA'
);
// Remove the old Regresar button
code = code.replace(
  /<button \s*onClick=\{\(\) => setCurrentSection\(0\)\} \s*className="px-4 py-1\.5 border border-gray-300 rounded hover:bg-gray-50 text-sm"\s*>\s*Regresar\s*<\/button>/,
  ``
);

fs.writeFileSync('src/components/Section2.tsx', code);
