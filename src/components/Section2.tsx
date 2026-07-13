import React, { useState } from 'react';
import { Home, ArrowLeft } from 'lucide-react';
import { useAppContext } from '../store';
import { normalizeString } from '../lib/utils';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function Section2() {
  const { cloudData, setCurrentSection } = useAppContext();
  const rawCitasExcel = cloudData?.rawCitasExcel || [];
  const dbInventario = cloudData?.dbInventario || {};
  const currentPass = cloudData?.pdfPass || "";
  
  const [observaciones, setObservaciones] = useState<Record<string, string>>({});
  const [showModal, setShowModal] = useState(false);
  const [inputPass, setInputPass] = useState('');

  const handleObsChange = (vin: string, val: string) => {
    setObservaciones(prev => ({ ...prev, [vin]: val }));
  };

  const getCitasData = () => {
    const data = [];
    for (let i = 0; i < rawCitasExcel.length; i++) {
      let f = rawCitasExcel[i];
      let vin = f[7];
      let anio = String(f[5] || '').trim();
      
      if (vin && vin.length > 10 && !isNaN(Number(anio))) {
        let servicio = "No especificado";
        for (let j = 1; j <= 3; j++) {
          let fAbajo = rawCitasExcel[i+j];
          if (fAbajo && fAbajo[4] && fAbajo[4].length > 5) { 
            servicio = fAbajo[4]; 
            break; 
          }
        }
        
        let pRef = "Ver S1";
        let maxScore = -500; 
        let mejorMatch: number | null = null;
        let dUniNorm = normalizeString(String(f[3] || '') + " " + String(f[4] || ''));
        let tokensCitas = dUniNorm.split(' ').filter(x => x);

        if (dbInventario[anio]) {
          for (let m in dbInventario[anio]) {
            let mNorm = normalizeString(m);
            if (dUniNorm.includes("GRAND") !== mNorm.includes("GRAND")) continue;
            let modelTokens = mNorm.split(' ').filter(x => x);
            if (modelTokens.every(t => tokensCitas.includes(t))) {
              dbInventario[anio][m].forEach(ver => {
                let vNorm = normalizeString(ver.v);
                let score = 0;
                let motores = ["1.0", "1.2", "1.4", "1.5", "1.6", "2.0", "2.4", "2.5"];
                let mC = motores.find(mot => dUniNorm.includes(mot));
                let mL = motores.find(mot => vNorm.includes(mot));
                if (mC && mL && mC !== mL) score -= 1000;
                else if (mC && mL && mC === mL) score += 200;
                
                vNorm.split(' ').filter(x => x).forEach(t => { 
                  if (tokensCitas.includes(t)) score += 20; 
                  else score -= 5; 
                });
                
                if (score > maxScore) { 
                  maxScore = score; 
                  mejorMatch = ver.p; 
                }
              });
            }
          }
        }
        
        if (mejorMatch !== null && maxScore > 0) {
          pRef = new Intl.NumberFormat('es-MX', {style: 'currency', currency: 'MXN'}).format(mejorMatch);
        }

        data.push({
          hora: f[1] || '-',
          cliente: f[8] || '-',
          unidad: f[4] || '-',
          anio: anio,
          vin: vin,
          placa: f[6] || '-',
          servicio: servicio,
          asesor: f[10] || '-',
          toma: pRef,
          obs: observaciones[vin] || ''
        });
      }
    }
    return data;
  };

  const citas = getCitasData();

  const handleDownload = () => {
    if (!currentPass) {
      alert("Aún no hay asignada una contraseña PDF desde la nube para el día de hoy.");
      return;
    }
    setShowModal(true);
  };

  const generatePDF = () => {
    if (inputPass === currentPass) {
      const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'letter' });
      doc.text("PLANIFICADOR DE CITAS - HYUNDAI COATZACOALCOS", 14, 15);
      
      const rows = citas.map(c => [
        c.hora, c.cliente, c.unidad, c.anio, c.vin, c.placa, c.servicio, c.asesor, c.toma, c.obs
      ]);

      autoTable(doc, {
        head: [["HORA", "CLIENTE", "UNIDAD", "AÑO", "VIN", "PLACA", "SERVICIO", "ASESOR", "TOMA", "OBS"]],
        body: rows,
        startY: 25,
        theme: 'grid',
        styles: { fontSize: 7 }
      });
      
      doc.save("Citas_Hyundai.pdf");
      setShowModal(false);
      setInputPass('');
    } else {
      alert("Contraseña incorrecta. Pida autorización a Gerencia.");
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#f4f6f9] p-3 md:p-5 box-border overflow-hidden">
      <div className="bg-[#002c5f] text-white px-5 py-2 mb-3 flex justify-between items-center rounded-md shadow-sm shrink-0">
        <span className="font-bold truncate max-w-[200px] md:max-w-md flex items-center gap-3">
          <button onClick={() => setCurrentSection(0)} className="p-2 bg-white/20 hover:bg-white/30 rounded transition-colors" title="Volver al Inicio">
            <Home size={20} />
          </button>
          BASE CITAS: {cloudData?.nameCitas || 'Sin Cargar'}
        </span>
        <div className="flex space-x-2">
          <button 
            onClick={handleDownload}
            className="bg-[#c0392b] text-white px-4 py-1.5 rounded text-sm font-bold hover:bg-[#922b21] transition-colors"
          >
            Descargar PDF
          </button>
          
        </div>
      </div>
      
      <div className="flex-grow bg-white rounded-lg shadow overflow-hidden flex flex-col">
        <div className="flex-1 overflow-auto">
          <table className="w-full text-[10px] text-left border-collapse">
            <thead className="bg-[#002c5f] text-white sticky top-0 z-10 shadow-sm">
              <tr>
                <th className="p-2 w-[5%]">HORA</th>
                <th className="p-2 w-[15%]">CLIENTE</th>
                <th className="p-2 w-[15%]">UNIDAD</th>
                <th className="p-2 w-[5%]">AÑO</th>
                <th className="p-2 w-[10%]">VIN</th>
                <th className="p-2 w-[7%]">PLACA</th>
                <th className="p-2 w-[15%]">SERVICIO</th>
                <th className="p-2 w-[10%]">ASESOR</th>
                <th className="p-2 w-[10%]">TOMA REF.</th>
                <th className="p-2 w-[8%]">OBSERVACIONES</th>
              </tr>
            </thead>
            <tbody>
              {citas.map((c, i) => (
                <tr key={i} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="p-2">{c.hora}</td>
                  <td className="p-2">{c.cliente}</td>
                  <td className="p-2">{c.unidad}</td>
                  <td className="p-2">{c.anio}</td>
                  <td className="p-2">{c.vin}</td>
                  <td className="p-2">{c.placa}</td>
                  <td className="p-2 text-[#00aad2] font-bold">{c.servicio}</td>
                  <td className="p-2">{c.asesor}</td>
                  <td className="p-2 text-[#27ae60] font-bold">{c.toma}</td>
                  <td className="p-2">
                    <input 
                      type="text"
                      className="w-full p-1 border border-gray-300 rounded text-[10px]"
                      value={observaciones[c.vin] || ''}
                      onChange={(e) => handleObsChange(c.vin, e.target.value)}
                    />
                  </td>
                </tr>
              ))}
              {citas.length === 0 && (
                <tr>
                  <td colSpan={10} className="p-4 text-center text-gray-500">No hay citas sincronizadas para mostrar.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-[#002c5f]/80 z-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg w-[320px] text-center shadow-lg">
            <h3 className="text-[#002c5f] font-bold text-lg mb-2">Descarga Autorizada</h3>
            <p className="text-[11px] text-gray-600 mb-4">Ingrese la clave designada hoy por gerencia para exportar.</p>
            <input 
              type="password" 
              placeholder="Contraseña de gerente PDF"
              value={inputPass}
              onChange={(e) => setInputPass(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && generatePDF()}
              className="w-full p-2 mb-4 border border-gray-300 rounded focus:outline-none focus:border-[#002c5f]"
            />
            <div className="flex gap-2">
              <button onClick={() => setShowModal(false)} className="flex-1 bg-gray-200 text-gray-800 py-2 rounded font-bold hover:bg-gray-300">
                Cancelar
              </button>
              <button onClick={generatePDF} className="flex-1 bg-[#002c5f] text-white py-2 rounded font-bold hover:bg-[#001a3a]">
                Generar PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
