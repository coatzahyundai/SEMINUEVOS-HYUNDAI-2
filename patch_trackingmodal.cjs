const fs = require('fs');
let code = fs.readFileSync('src/components/TrackingModal.tsx', 'utf8');

code = code.replace(
  /import \{ fetchAPI \} from '\.\.\/store';/,
  `import { fetchAPI, useAppContext } from '../store';`
);

code = code.replace(
  /const \[saving, setSaving\] = useState\(false\);/,
  `const [saving, setSaving] = useState(false);\n  const { user } = useAppContext();\n  const isLocked = item.estatus === 'Poliza' && user?.role !== 'gerencia';`
);

code = code.replace(
  /<button disabled=\{saving\} onClick=\{handleSave\} className="px-5 py-2 bg-\[\#002c5f\] text-white rounded font-bold hover:bg-\[\#001a3a\] flex items-center">/,
  `{!isLocked && <button disabled={saving} onClick={handleSave} className="px-5 py-2 bg-[#002c5f] text-white rounded font-bold hover:bg-[#001a3a] flex items-center">`
);

code = code.replace(
  /\{saving \? <RefreshCw className="animate-spin mr-2" size=\{18\} \/> : <Save className="mr-2" size=\{18\} \/>\} Guardar\s*<\/button>/,
  `{saving ? <RefreshCw className="animate-spin mr-2" size={18} /> : <Save className="mr-2" size={18} />} Guardar\n          </button>}`
);

code = code.replace(
  /<input type="date" value=\{data\.fecha_contrato \|\| ''\} onChange=\{e=>setData\(\{\.\.\.data, fecha_contrato: e\.target\.value\}\)\} className="w-full p-2 border border-gray-300 rounded" \/>/g,
  `<input type="date" disabled={isLocked} value={data.fecha_contrato || ''} onChange={e=>setData({...data, fecha_contrato: e.target.value})} className="w-full p-2 border border-gray-300 rounded disabled:bg-gray-200" />`
);
code = code.replace(
  /<input type="date" value=\{data\.fecha_envio_exp \|\| ''\} onChange=\{e=>setData\(\{\.\.\.data, fecha_envio_exp: e\.target\.value\}\)\} className="w-full p-2 border border-gray-300 rounded" \/>/g,
  `<input type="date" disabled={isLocked} value={data.fecha_envio_exp || ''} onChange={e=>setData({...data, fecha_envio_exp: e.target.value})} className="w-full p-2 border border-gray-300 rounded disabled:bg-gray-200" />`
);
code = code.replace(
  /<input type="date" value=\{data\.fecha_poliza \|\| ''\} onChange=\{e=>setData\(\{\.\.\.data, fecha_poliza: e\.target\.value\}\)\} className="w-full p-2 border border-gray-300 rounded" \/>/g,
  `<input type="date" disabled={isLocked} value={data.fecha_poliza || ''} onChange={e=>setData({...data, fecha_poliza: e.target.value})} className="w-full p-2 border border-gray-300 rounded disabled:bg-gray-200" />`
);

code = code.replace(
  /<input type="date" value=\{data\.fecha_pago_fin \|\| ''\} onChange=\{e=>setData\(\{\.\.\.data, fecha_pago_fin: e\.target\.value\}\)\} disabled=\{!item\.liq_financiera\} className="w-full p-2 border border-gray-300 rounded disabled:bg-gray-200" \/>/g,
  `<input type="date" value={data.fecha_pago_fin || ''} onChange={e=>setData({...data, fecha_pago_fin: e.target.value})} disabled={!item.liq_financiera || isLocked} className="w-full p-2 border border-gray-300 rounded disabled:bg-gray-200" />`
);

code = code.replace(
  /<input type="date" value=\{data\.fecha_dev_cliente \|\| ''\} onChange=\{e=>setData\(\{\.\.\.data, fecha_dev_cliente: e\.target\.value\}\)\} disabled=\{!item\.dev_cliente\} className="w-full p-2 border border-gray-300 rounded disabled:bg-gray-200" \/>/g,
  `<input type="date" value={data.fecha_dev_cliente || ''} onChange={e=>setData({...data, fecha_dev_cliente: e.target.value})} disabled={!item.dev_cliente || isLocked} className="w-full p-2 border border-gray-300 rounded disabled:bg-gray-200" />`
);

fs.writeFileSync('src/components/TrackingModal.tsx', code);
