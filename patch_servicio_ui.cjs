const fs = require('fs');
let code = fs.readFileSync('src/components/Section3.tsx', 'utf8');

code = code.replace(
  /\{ \(user\.role === 'servicio' \|\| user\.role === 'gerencia'\) && \(\s*<div className="flex items-center gap-2">\s*<span className="text-sm font-bold text-gray-600">Mostrar Estatus:<\/span>\s*<select \s*value=\{statusFilter\} \s*onChange=\{e => setStatusFilter\(e\.target\.value\)\}\s*className="p-2 border border-gray-300 rounded text-sm bg-white"\s*>\s*<option value="ALL">TODOS<\/option>\s*<option value="Solicitud Avalúo">Solicitud Avalúo<\/option>\s*<option value="Avalúo Listo">Avalúo Listo<\/option>\s*<option value="Avalúo Rechazado">Avalúo Rechazado<\/option>\s*<option value="Envío de Expediente">Envío de Expediente<\/option>\s*<option value="Envío de Contrato">Envío de Contrato<\/option>\s*<option value="Poliza">Poliza<\/option>\s*<option value="Liquidación">Liquidación<\/option>\s*<\/select>\s*<\/div>\s*\)\}/,
  `{ user.role === 'gerencia' && (
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-gray-600">Mostrar Estatus:</span>
            <select 
              value={statusFilter} 
              onChange={e => setStatusFilter(e.target.value)}
              className="p-2 border border-gray-300 rounded text-sm bg-white"
            >
              <option value="ALL">TODOS</option>
              <option value="Solicitud Avalúo">Solicitud Avalúo</option>
              <option value="Avalúo Listo">Avalúo Listo</option>
              <option value="Avalúo Rechazado">Avalúo Rechazado</option>
              <option value="Envío de Expediente">Envío de Expediente</option>
              <option value="Envío de Contrato">Envío de Contrato</option>
              <option value="Poliza">Poliza</option>
              <option value="Liquidación">Liquidación</option>
            </select>
          </div>
        )}
        { user.role === 'servicio' && (
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-gray-600">Mostrar Historial:</span>
            <select 
              value={statusFilter} 
              onChange={e => setStatusFilter(e.target.value)}
              className="p-2 border border-gray-300 rounded text-sm bg-white"
            >
              <option value="Solicitud Avalúo">NINGUNO</option>
              <option value="Avalúo Listo">Avalúo Listo</option>
              <option value="Avalúo Rechazado">Avalúo Rechazado</option>
            </select>
          </div>
        )}`
);

fs.writeFileSync('src/components/Section3.tsx', code);
