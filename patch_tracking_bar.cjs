const fs = require('fs');
let code = fs.readFileSync('src/components/Section3.tsx', 'utf8');

const trackingBarCode = `const renderTrackingBar = (item: InventoryItem) => {
    const steps = [
      { name: 'Contrato', done: !!item.fecha_contrato, active: true },
      { name: 'Envío', done: !!item.fecha_envio_exp, active: true },
      { name: 'Póliza', done: !!item.fecha_poliza, active: true },
      { name: 'Liq Fin', done: !!item.fecha_pago_fin, active: !!item.liq_financiera },
      { name: 'Dev Cli', done: !!item.fecha_dev_cliente, active: !!item.dev_cliente }
    ].filter(s => s.active);
    
    return (
      <div className="flex w-32 h-1.5 bg-gray-200 rounded-full overflow-hidden mt-1.5 opacity-80 hover:opacity-100 transition-opacity cursor-help" title={getTrackingTooltip(item)}>
        {steps.map((step, i) => (
          <div key={i} className={\`h-full flex-1 border-r border-white/50 last:border-0 \${step.done ? 'bg-green-500' : 'bg-red-400'}\`}></div>
        ))}
      </div>
    );
  };`;

code = code.replace(
  /const filteredInventory = inventory\.filter/,
  `${trackingBarCode}\n\n  const filteredInventory = inventory.filter`
);

// Remove the Seg. column header
code = code.replace(
  /\{user\.role === 'gerencia' && <th className="p-3 font-bold border-b-2 border-gray-200">Seg\.<\/th>\}/,
  ``
);

// Remove the Seg. column cell
code = code.replace(
  /\{user\.role === 'gerencia' && \([\s\S]*?<td className="p-3">[\s\S]*?<div title=\{getTrackingTooltip\(item\)\}[\s\S]*?<\/div>[\s\S]*?<\/td>[\s\S]*?\)\}/,
  ``
);

// Add it under client name
code = code.replace(
  /<td className="p-3 font-medium text-gray-900">\{item\.cliente\}<\/td>/,
  `<td className="p-3 font-medium text-gray-900">
                      {item.cliente}
                      {user.role === 'gerencia' && renderTrackingBar(item)}
                    </td>`
);

fs.writeFileSync('src/components/Section3.tsx', code);
