import React, { useState, useEffect } from 'react';
import { InventoryItem, ValuationData, ValuationRow } from '../types';
import { X, Save, Plus, Trash2, RefreshCw } from 'lucide-react';
import { fetchAPI, useAppContext } from '../store';

interface Props {
  item: InventoryItem;
  onClose: () => void;
  onSaved: () => void;
}

export default function ValuationModal({ item, onClose, onSaved }: Props) {
  const [data, setData] = useState<ValuationData>({
    vin: item.vin,
    estatus_avaluo: 'Avalúo Listo',
    fecha_avaluo: new Date().toISOString().split('T')[0],
    observaciones: '',
    mecanica: [],
    subtotal_mecanica: 0,
    mano_obra: [],
    subtotal_mo: 0,
    hyp: [],
    subtotal_hyp: 0,
    gran_total: 0,
    tiene_garantia: 'NO',
    valuador_tecnico: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { user } = useAppContext();
  const isLocked = (item.estatus === 'Poliza' || item.estatus === 'Liquidación') && user?.role !== 'gerencia';

  useEffect(() => {
    fetchAPI('getValuationData', { vin: item.vin }).then(res => {
      if (res.status === 'success' && res.data) {
        setData(res.data);
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [item.vin]);

  const calcTotals = (newData: ValuationData) => {
    const sumM = newData.mecanica.reduce((a, b) => a + Number(b.importe || 0), 0);
    const sumMO = newData.mano_obra.reduce((a, b) => a + Number(b.importe || 0), 0);
    const sumHYP = newData.hyp.reduce((a, b) => a + Number(b.importe || 0), 0);
    newData.subtotal_mecanica = sumM;
    newData.subtotal_mo = sumMO;
    newData.subtotal_hyp = sumHYP;
    
    const subtotal = sumM + sumMO + sumHYP;
    const iva = subtotal * 0.16;
    newData.gran_total = subtotal + iva;
    return newData;
  };

  const handleRowChange = (section: 'mecanica'|'mano_obra'|'hyp', idx: number, field: keyof ValuationRow, val: string | number) => {
    const newData = { ...data };
    newData[section][idx] = { ...newData[section][idx], [field]: val };
    setData(calcTotals(newData));
  };

  const addRow = (section: 'mecanica'|'mano_obra'|'hyp') => {
    const newData = { ...data };
    newData[section].push({ descripcion: '', importe: 0 });
    setData(calcTotals(newData));
  };

  const removeRow = (section: 'mecanica'|'mano_obra'|'hyp', idx: number) => {
    const newData = { ...data };
    newData[section].splice(idx, 1);
    setData(calcTotals(newData));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetchAPI('save_valuation', { vin: item.vin, data: { ...data, fecha_avaluo: data.fecha_avaluo ? data.fecha_avaluo.split('-').reverse().join('/') : '' } });
      onSaved();
    } catch(e) {
      console.error(e);
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-[#002c5f]/80 z-50 flex justify-center items-center p-4">
        <RefreshCw className="animate-spin text-white" size={32} />
      </div>
    );
  }

  const iva = (data.subtotal_mecanica + data.subtotal_mo + data.subtotal_hyp) * 0.16;
  const sub = data.subtotal_mecanica + data.subtotal_mo + data.subtotal_hyp;

  const renderTable = (title: string, section: 'mecanica'|'mano_obra'|'hyp') => (
    <div className="mb-4 bg-white border border-gray-200 rounded p-2">
      <div className="flex justify-between items-center mb-2">
        <h4 className="font-bold text-gray-700 text-sm uppercase">{title}</h4>
        <button disabled={isLocked} onClick={() => addRow(section)} className="bg-gray-100 hover:bg-gray-200 p-1 rounded text-gray-600"><Plus size={16}/></button>
      </div>
      <div className="overflow-x-auto w-full"><table className="w-full text-sm text-left min-w-[300px]">
        <thead className="bg-gray-100 text-gray-600">
          <tr>
            <th className="p-1">Descripción / Concepto</th>
            <th className="p-1 w-32">Importe ($)</th>
            <th className="p-1 w-10"></th>
          </tr>
        </thead>
        <tbody>
          {data[section].map((r, i) => (
            <tr key={i} className="border-b border-gray-100">
              <td className="p-1"><input type="text" disabled={isLocked} value={r.descripcion} onChange={e=>handleRowChange(section, i, 'descripcion', e.target.value)} className="w-full p-1 border border-gray-300 rounded text-xs" /></td>
              <td className="p-1"><input type="number" disabled={isLocked} value={r.importe || ''} onChange={e=>handleRowChange(section, i, 'importe', Number(e.target.value))} className="w-full p-1 border border-gray-300 rounded text-xs" /></td>
              <td className="p-1"><button disabled={isLocked} onClick={()=>removeRow(section, i)} className="text-red-500 hover:bg-red-50 p-1 rounded"><Trash2 size={14}/></button></td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td className="text-right p-1 font-bold">Subtotal:</td>
            <td className="p-1 font-bold">${data[`subtotal_${section === 'mecanica' ? 'mecanica' : section === 'mano_obra' ? 'mo' : 'hyp'}` as keyof ValuationData]?.toLocaleString('es-MX', {minimumFractionDigits:2, maximumFractionDigits:2})}</td>
            <td></td>
          </tr>
        </tfoot>
      </table></div></div>
  );

  return (
    <div className="fixed inset-0 bg-[#002c5f]/80 z-50 flex justify-center items-center p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden">
        <div className="bg-[#002c5f] text-white p-4 flex justify-between items-center shrink-0">
          <h2 className="font-bold text-lg">Presupuesto de Avalúo</h2>
          <button onClick={onClose} className="hover:bg-white/20 p-1 rounded"><X size={20} /></button>
        </div>
        
        <div className="p-5 flex-1 overflow-y-auto bg-gray-50 text-sm">
          {/* Top section */}
          <div className="flex flex-wrap gap-x-6 gap-y-3 mb-4 border border-gray-300 p-3 bg-white rounded text-xs md:text-sm">
            <div className="w-full"><span className="font-bold mr-2">CLIENTE:</span>{item.cliente}</div>
            <div className="w-full md:w-auto"><span className="font-bold mr-2">VEHÍCULO:</span>{item.linea}</div>
            <div className="w-full md:w-auto"><span className="font-bold mr-2">PLACAS:</span>{item.placa}</div>
            <div className="w-full md:w-auto"><span className="font-bold mr-2">COLOR:</span>{item.color}</div>
            <div className="w-full md:w-auto"><span className="font-bold mr-2">KM:</span>{item.km}</div>
            <div className="w-full md:w-auto"><span className="font-bold mr-2">AÑO:</span>{item.modelo}</div>
            <div className="w-full md:w-auto"><span className="font-bold mr-2">ASESOR:</span>{item.asesor}</div>
            <div className="w-full md:w-auto"><span className="font-bold mr-2">SERIE:</span><span className="text-xs break-all">{item.vin}</span></div>
            <div className="w-full md:w-auto"><span className="font-bold mr-2">VERSIÓN:</span>{item.version}</div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-xs font-bold text-gray-700">Fecha de Avalúo</label>
              <input type="date" disabled={isLocked} value={data.fecha_avaluo || ''} onChange={e=>setData({...data, fecha_avaluo: e.target.value})} className="w-full p-2 border border-gray-300 rounded" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700">Unidad con Garantía</label>
              <select value={data.tiene_garantia} onChange={e=>setData({...data, tiene_garantia: e.target.value})} className="w-full p-2 border border-gray-300 rounded">
                <option value="NO">NO</option>
                <option value="SI">SI</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700">Valuador Técnico</label>
              <input type="text" disabled={isLocked} value={data.valuador_tecnico || ''} onChange={e=>setData({...data, valuador_tecnico: e.target.value})} className="w-full p-2 border border-gray-300 rounded uppercase" />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-xs font-bold text-gray-700">Estatus del Avalúo</label>
            <select value={data.estatus_avaluo} onChange={e=>setData({...data, estatus_avaluo: e.target.value})} className="w-full p-2 border border-gray-300 rounded max-w-xs">
              <option value="Avalúo Listo">AVALUO TERMINADO</option>
              <option value="Avalúo Rechazado">AUTO RECHAZADO</option>
            </select>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              {renderTable('Refacciones / Mecánica', 'mecanica')}
              {renderTable('Mano de Obra', 'mano_obra')}
            </div>
            <div>
              {renderTable('Hojalatería y Pintura (HYP)', 'hyp')}
              
              <div className="mt-4 bg-white border border-gray-200 p-4 rounded flex justify-end">
                <table className="text-right">
                  <tbody>
                    <tr><td className="pr-4 font-bold text-gray-600">Subtotal:</td><td className="w-32">${sub.toLocaleString('es-MX', {minimumFractionDigits:2, maximumFractionDigits:2})}</td></tr>
                    <tr><td className="pr-4 font-bold text-gray-600">I.V.A. (16%):</td><td className="w-32 border-b border-gray-400">${iva.toLocaleString('es-MX', {minimumFractionDigits:2, maximumFractionDigits:2})}</td></tr>
                    <tr><td className="pr-4 font-bold text-lg">TOTAL:</td><td className="w-32 font-bold text-lg">${data.gran_total?.toLocaleString('es-MX', {minimumFractionDigits:2, maximumFractionDigits:2})}</td></tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="mt-4">
            <label className="block font-bold text-gray-700 text-sm mb-1">Observaciones</label>
            <textarea disabled={isLocked} value={data.observaciones || ''} onChange={e=>setData({...data, observaciones: e.target.value})} className="w-full p-2 border border-gray-300 rounded h-32" />
          </div>
        </div>
        
        <div className="p-4 bg-white border-t border-gray-200 flex justify-end gap-3 shrink-0">
          <button onClick={onClose} className="px-5 py-2 border border-gray-300 rounded font-bold text-gray-700 hover:bg-gray-100">Cerrar</button>
          {!isLocked && <button disabled={saving} onClick={handleSave} className="px-5 py-2 bg-[#002c5f] text-white rounded font-bold hover:bg-[#001a3a] flex items-center">
            {saving ? <RefreshCw className="animate-spin mr-2" size={18} /> : <Save className="mr-2" size={18} />} Guardar
          </button>}
        </div>
      </div>
    </div>
  );
}
