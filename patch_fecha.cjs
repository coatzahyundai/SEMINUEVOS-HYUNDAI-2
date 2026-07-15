const fs = require('fs');
let code = fs.readFileSync('src/components/Section3.tsx', 'utf8');

code = code.replace(
  '<div className="grid grid-cols-1 md:grid-cols-2 gap-4">',
  `<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700">Fecha de Registro</label>
                  <input type="date" value={formData.fecha || ''} onChange={e => handleFormChange("fecha", e.target.value)} disabled={isFormLocked} className="w-full p-2 border border-gray-300 rounded focus:border-[#00aad2] outline-none" />
                </div>`
);

fs.writeFileSync('src/components/Section3.tsx', code);
