const fs = require('fs');
let code = fs.readFileSync('src/components/Section3.tsx', 'utf8');

// 1. PDF Button
code = code.replace(
  /\{\s*\(user\.role === 'servicio' \|\| user\.role === 'gerencia'\)\s*&&\s*\(\s*<button[^>]*onClick=\{\(\) => generatePDF\(item\)\}[^>]*>[\s\S]*?<\/button>\s*\)\s*\}/,
  `{ (user.role === 'servicio' || user.role === 'gerencia' || (user.role === 'asesor' && item.estatus === 'Avalúo Listo')) && (
                          <button 
                            onClick={() => generatePDF(item)}
                            className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                            title="Imprimir PDF Avalúo"
                          >
                            <FileDown size={16} />
                          </button>
                        )}`
);

// 2. Add "Volver al Inicio" button in header
code = code.replace(
  /<h2 className="text-xl font-bold text-white mb-3 sm:mb-0">Expedientes Seminuevos<\/h2>/,
  `<div className="flex items-center gap-3 mb-3 sm:mb-0">
          <button onClick={() => setCurrentSection('home')} className="bg-white/20 hover:bg-white/30 text-white p-2 rounded transition-colors" title="Volver al Inicio">
            <ArrowLeft size={20} />
          </button>
          <h2 className="text-xl font-bold text-white">Expedientes Seminuevos</h2>
        </div>`
);
code = code.replace(/import \{ ([^}]+) \} from 'lucide-react';/, (match, p1) => {
  if (!p1.includes('ArrowLeft')) {
    return `import { ${p1}, ArrowLeft } from 'lucide-react';`;
  }
  return match;
});

// 3. Remove "En captura" from status filter
code = code.replace(/<option value="En captura">En captura<\/option>\n\s*/, '');

fs.writeFileSync('src/components/Section3.tsx', code);
