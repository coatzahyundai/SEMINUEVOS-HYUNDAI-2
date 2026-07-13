const fs = require('fs');
let code = fs.readFileSync('src/components/ValuationModal.tsx', 'utf8');

const regex = /<div className="flex flex-wrap gap-x-6 gap-y-3 mb-4 border border-gray-300 p-3 bg-white rounded text-xs md:text-sm">[\s\S]*?<\/div>\s*<div>\{item\.modelo\}<\/div>[\s\S]*?<\/div>\s*<\/div>/;

const replacement = `<div className="flex flex-wrap gap-x-6 gap-y-3 mb-4 border border-gray-300 p-3 bg-white rounded text-xs md:text-sm">
            <div className="w-full"><span className="font-bold mr-2">CLIENTE:</span>{item.cliente}</div>
            <div className="w-full md:w-auto"><span className="font-bold mr-2">VEHÍCULO:</span>{item.linea}</div>
            <div className="w-full md:w-auto"><span className="font-bold mr-2">PLACAS:</span>{item.placa}</div>
            <div className="w-full md:w-auto"><span className="font-bold mr-2">COLOR:</span>{item.color}</div>
            <div className="w-full md:w-auto"><span className="font-bold mr-2">KM:</span>{item.km}</div>
            <div className="w-full md:w-auto"><span className="font-bold mr-2">AÑO:</span>{item.modelo}</div>
            <div className="w-full md:w-auto"><span className="font-bold mr-2">ASESOR:</span>{item.asesor}</div>
            <div className="w-full md:w-auto"><span className="font-bold mr-2">SERIE:</span><span className="text-xs break-all">{item.vin}</span></div>
            <div className="w-full md:w-auto"><span className="font-bold mr-2">VERSIÓN:</span>{item.version}</div>
          </div>`;

code = code.replace(regex, replacement);

fs.writeFileSync('src/components/ValuationModal.tsx', code);
