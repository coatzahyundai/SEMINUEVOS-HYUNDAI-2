const fs = require('fs');
let code = fs.readFileSync('src/components/Section3.tsx', 'utf8');

// Modify the inputs to have background colors
code = code.replace(
  /className="w-full p-2 border border-gray-300 rounded" \/><\/div>(\s*<div className="space-y-1"><label className="text-xs font-bold text-gray-700">Precio Venta)/,
  'className="w-full p-2 border border-blue-300 bg-blue-50 rounded" /></div>$1'
);

code = code.replace(
  /className="w-full p-2 border border-gray-300 rounded" \/><\/div>(\s*<div className="space-y-1"><label className="text-xs font-bold text-gray-700">Toma Avalúo)/,
  'className="w-full p-2 border border-green-300 bg-green-50 rounded" /></div>$1'
);

code = code.replace(
  /className="w-full p-2 border border-gray-300 rounded" \/><\/div>(\s*<div className="space-y-1"><label className="text-xs font-bold text-gray-700">Dación)/,
  'className="w-full p-2 border border-yellow-300 bg-yellow-50 rounded" /></div>$1'
);

fs.writeFileSync('src/components/Section3.tsx', code);
