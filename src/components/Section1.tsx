import React, { useState, useMemo } from 'react';
import { Home } from 'lucide-react';
import { useAppContext } from '../store';

export default function Section1() {
  const { cloudData, setCurrentSection } = useAppContext();
  const dbInventario = cloudData?.dbInventario || {};

  const [year, setYear] = useState('');
  const [model, setModel] = useState('');
  const [versionPrice, setVersionPrice] = useState<number | null>(null);

  const years = useMemo(() => {
    return Object.keys(dbInventario).sort((a, b) => parseInt(b) - parseInt(a));
  }, [dbInventario]);

  const models = useMemo(() => {
    if (!year || !dbInventario[year]) return [];
    return Object.keys(dbInventario[year]).sort();
  }, [year, dbInventario]);

  const versions = useMemo(() => {
    if (!year || !model || !dbInventario[year]?.[model]) return [];
    return dbInventario[year][model];
  }, [year, model, dbInventario]);

  const resetForm = () => {
    setYear('');
    setModel('');
    setVersionPrice(null);
  };

  return (
    <div className="flex flex-col h-full bg-[#f4f6f9] p-3 md:p-5 box-border">
      <div className="bg-[#002c5f] text-white px-5 py-2 mb-3 flex items-center gap-3 rounded-md shadow-sm shrink-0">
        <button onClick={() => setCurrentSection(0)} className="p-2 bg-white/20 hover:bg-white/30 rounded transition-colors" title="Volver al Inicio">
          <Home size={20} />
        </button>
        <span className="font-bold">COTIZADOR DE TOMA</span>
      </div>
      
      <div className="max-w-[750px] mx-auto bg-white p-5 rounded-lg shadow w-full box-border flex flex-col flex-grow md:max-h-[calc(100vh-100px)]">
        <h2 className="text-center text-[#002c5f] text-lg font-bold mb-4">Calculadora de Valor</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
          <div className="flex flex-col">
            <label className="text-[11px] font-bold text-[#002c5f] mb-1">Año</label>
            <select 
              value={year} 
              onChange={(e) => { setYear(e.target.value); setModel(''); setVersionPrice(null); }} 
              className="p-2 border border-gray-300 rounded text-sm w-full bg-white"
            >
              <option value="">-</option>
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          
          <div className="flex flex-col">
            <label className="text-[11px] font-bold text-[#002c5f] mb-1">Modelo</label>
            <select 
              value={model} 
              onChange={(e) => { setModel(e.target.value); setVersionPrice(null); }} 
              disabled={!year}
              className="p-2 border border-gray-300 rounded text-sm w-full bg-white disabled:bg-gray-100"
            >
              <option value="">-</option>
              {models.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          
          <div className="flex flex-col">
            <label className="text-[11px] font-bold text-[#002c5f] mb-1">Versión</label>
            <select 
              value={versionPrice || ''} 
              onChange={(e) => setVersionPrice(parseFloat(e.target.value))} 
              disabled={!model}
              className="p-2 border border-gray-300 rounded text-sm w-full bg-white disabled:bg-gray-100"
            >
              <option value="">-</option>
              {versions.map((v, i) => <option key={i} value={v.p}>{v.v}</option>)}
            </select>
          </div>
        </div>
        
        <div className="bg-[#f1f4f8] p-5 rounded-lg text-center border-2 border-[#00aad2] flex flex-col justify-center items-center flex-grow mb-4 min-h-[100px]">
          {versionPrice === null ? (
            <div className="font-bold text-gray-600">Selecciona los datos del vehículo</div>
          ) : (
            <div>
              <div className="text-[11px] text-gray-600 uppercase font-medium">Valor Estimado de Toma</div>
              <div className="text-4xl font-bold text-[#27ae60] my-2">
                {new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(versionPrice)}
              </div>
              <button 
                onClick={resetForm}
                className="mt-2 bg-[#002c5f] text-white px-4 py-1.5 rounded text-xs hover:bg-[#001a3a] transition-colors"
              >
                Limpiar
              </button>
            </div>
          )}
        </div>
        
        <div className="bg-[#fce4e4] border-l-4 border-[#d9534f] p-3 rounded text-[11px] text-gray-800 shrink-0">
          <p className="font-bold text-[#a94442] m-0 mb-1">Notas importantes:</p>
          <ul className="list-disc pl-4 m-0 space-y-1">
            <li>Precios sujetos a cambio sin previo aviso.</li>
            <li>La toma del vehículo está sujeta a diagnóstico mecánico y estético.</li>
            <li>Los costos de acondicionamiento se descontarán del valor de toma.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
