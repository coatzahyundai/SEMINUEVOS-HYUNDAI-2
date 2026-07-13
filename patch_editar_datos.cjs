const fs = require('fs');
let code = fs.readFileSync('src/components/Section3.tsx', 'utf8');

code = code.replace(
  /\{user\.role !== 'servicio' && \(\s*<button\s*onClick=\{\(\) => handleOpenForm\(item\)\}\s*className="p-1\.5 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded transition-colors disabled:opacity-30 disabled:bg-transparent"\s*title="Editar Datos"\s*>\s*<Edit size=\{16\} \/>\s*<\/button>\s*\)\}/,
  `<button 
                            onClick={() => handleOpenForm(item)}
                            className="p-1.5 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded transition-colors disabled:opacity-30 disabled:bg-transparent"
                            title="Editar Datos"
                          >
                            <Edit size={16} />
                          </button>`
);

fs.writeFileSync('src/components/Section3.tsx', code);
