import React, { useState } from 'react';
import { InventoryItem } from '../types';
import { X, Save, RefreshCw } from 'lucide-react';
import { fetchAPI, useAppContext } from '../store';

interface Props {
  item: InventoryItem;
  onClose: () => void;
  onSaved: () => void;
}

export default function TrackingModal({ item, onClose, onSaved }: Props) {
  const formatToInput = (dateString?: any) => {
    if (!dateString) return '';
    const str = String(dateString);
    if (str.includes('T')) return str.split('T')[0];
    if (str.includes('/')) {
      const parts = str.split('/');
      if (parts.length === 3) {
        const day = parts[0].padStart(2, '0');
        const month = parts[1].padStart(2, '0');
        const year = parts[2];
        return `${year}-${month}-${day}`;
      }
    }
    return str;
  };
  const [data, setData] = useState<Partial<InventoryItem>>({
    fecha_contrato: formatToInput(item.fecha_contrato),
    fecha_envio_exp: formatToInput(item.fecha_envio_exp),
    fecha_poliza: formatToInput(item.fecha_poliza),
    fecha_pago_fin: formatToInput(item.fecha_pago_fin),
    fecha_dev_cliente: formatToInput(item.fecha_dev_cliente)
  });
  const [saving, setSaving] = useState(false);
  const { user } = useAppContext();
  const isLocked = (item.estatus === 'Poliza' || item.estatus === 'Liquidación') && user?.role !== 'gerencia';

  const handleSave = async () => {
    setSaving(true);
    try {
      const formattedData = { ...data };
      Object.keys(formattedData).forEach(key => {
        if (formattedData[key] && typeof formattedData[key] === 'string' && formattedData[key].includes('-')) {
           formattedData[key] = formattedData[key].split('-').reverse().join('/');
        }
      });
      const payload = { ...item, ...formattedData };
      await fetchAPI('update_record', { data: payload });
      onSaved();
    } catch(e) {
      console.error(e);
    }
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 bg-[#002c5f]/80 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md flex flex-col overflow-hidden">
        <div className="bg-[#002c5f] text-white p-4 flex justify-between items-center shrink-0">
          <h2 className="font-bold text-lg">Fechas de Seguimiento</h2>
          <button onClick={onClose} className="hover:bg-white/20 p-1 rounded"><X size={20} /></button>
        </div>
        
        <div className="p-5 flex-1 overflow-y-auto bg-gray-50 text-sm space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Fecha Contrato</label>
            <input type="date" disabled={isLocked} value={data.fecha_contrato || ''} onChange={e=>setData({...data, fecha_contrato: e.target.value})} className="w-full p-2 border border-gray-300 rounded disabled:bg-gray-200" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Fecha Envío Expediente</label>
            <input type="date" disabled={isLocked} value={data.fecha_envio_exp || ''} onChange={e=>setData({...data, fecha_envio_exp: e.target.value})} className="w-full p-2 border border-gray-300 rounded disabled:bg-gray-200" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Fecha Póliza</label>
            <input type="date" disabled={isLocked} value={data.fecha_poliza || ''} onChange={e=>setData({...data, fecha_poliza: e.target.value})} className="w-full p-2 border border-gray-300 rounded disabled:bg-gray-200" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Fecha Pago Fin {(!item.liq_financiera) && <span className="text-red-500">(Inactivo, falta Liq. Financiera)</span>}</label>
            <input type="date" value={data.fecha_pago_fin || ''} onChange={e=>setData({...data, fecha_pago_fin: e.target.value})} disabled={!item.liq_financiera || isLocked} className="w-full p-2 border border-gray-300 rounded disabled:bg-gray-200" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Fecha Dev Cliente {(!item.dev_cliente) && <span className="text-red-500">(Inactivo, falta Dev. Cliente)</span>}</label>
            <input type="date" value={data.fecha_dev_cliente || ''} onChange={e=>setData({...data, fecha_dev_cliente: e.target.value})} disabled={!item.dev_cliente || isLocked} className="w-full p-2 border border-gray-300 rounded disabled:bg-gray-200" />
          </div>
        </div>
        
        <div className="p-4 bg-white border-t border-gray-200 flex justify-end gap-3 shrink-0">
          <button onClick={onClose} className="px-5 py-2 border border-gray-300 rounded font-bold text-gray-700 hover:bg-gray-100">Cancelar</button>
          {!isLocked && <button disabled={saving} onClick={handleSave} className="px-5 py-2 bg-[#002c5f] text-white rounded font-bold hover:bg-[#001a3a] flex items-center">
            {saving ? <RefreshCw className="animate-spin mr-2" size={18} /> : <Save className="mr-2" size={18} />} Guardar
          </button>}
        </div>
      </div>
    </div>
  );
}
