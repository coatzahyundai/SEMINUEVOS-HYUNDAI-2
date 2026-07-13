import React, { useState, useEffect, useRef } from 'react';
import { useAppContext, fetchAPI } from '../store';
import { InventoryItem, DriveFile } from '../types';
import { Home, Search, FileText, Upload, RefreshCw, Edit, FileDown, X, Save, Plus, Trash2, Calendar, ArrowLeft } from 'lucide-react';
import jsPDF from 'jspdf';
import { PDFDocument } from 'pdf-lib';
import autoTable from 'jspdf-autotable';
import ValuationModal from './ValuationModal';
import TrackingModal from './TrackingModal';

const DOCS_ASESOR = [
  "CARATULA DE DOCUMENTOS", "FACTURA ORIGINAL", "FACTURA COPIA O CARTA COMPROMISO O REFACTURA", 
  "TENENCIA 2019", "TENENCIA 2020", "TENENCIA 2021", "TENENCIA 2022", "TENENCIA 2023", 
  "TENENCIA 2024", "TENENCIA 2025", "TENENCIA 2026", "TENENCIA 2027", 
  "BAJA DE PLACAS O CARTA COMPROMISO", "TARJETA DE CIRCULACION", "VERIFICACION", 
  "VALUACION DE LA UNIDAD", "PRESUPUESTO DE REPARACION", "GUIA AZUL", "INE DEL CLIENTE", 
  "COMP DE DOMICILIO", "CURP", "CSF", "REPUVE", "TRANSUNION 1", "TRANSUNION 2", 
  "VERIFICACION DE FACTURA 1", "VERIFICACION DE FACTURA 2", "CONTRATO DE COMPRA-VENTA", 
  "IMAGEN ESCANER", "IMAGEN VIN", "REPORTE ESCANER"
];
const DOCS_SERVICIO = ["IMAGEN ESCANER", "REPORTE ESCANER", "IMAGEN VIN"];

const ESTATUS_ASESOR = ["Solicitud Avalúo", "Envío de Expediente"];
const ESTATUS_SERVICIO = ["Avalúo Listo", "Avalúo Rechazado"];
const ESTATUS_GERENCIA = ["Solicitud Avalúo", "Envío de Expediente", "Avalúo Listo", "Avalúo Rechazado", "Envío de Contrato", "Poliza", "Liquidación"];

export default function Section3() {
  const { user, setCurrentSection } = useAppContext();
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  
  const [showFormModal, setShowFormModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showValuationModal, setShowValuationModal] = useState(false);
  const [showTrackingModal, setShowTrackingModal] = useState(false);
  
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  
  const [formData, setFormData] = useState<Partial<InventoryItem>>({});
  const [savingForm, setSavingForm] = useState(false);
  
  const [selectedDocType, setSelectedDocType] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const [loadedFiles, setLoadedFiles] = useState<DriveFile[]>([]);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [mergingFiles, setMergingFiles] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [customAlert, setCustomAlert] = useState<{message: string, isConfirm?: boolean, onConfirm?: () => void} | null>(null);

  const [statusFilter, setStatusFilter] = useState(user.role === 'servicio' ? 'Solicitud Avalúo' : 'ALL');

  const formatToLocal = (dateString?: string) => {
    if (!dateString) return '';
    if (dateString.includes('T')) {
      const parts = dateString.split('T')[0].split('-');
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateString;
  };
  
  const parseFromLocal = (localString?: string) => {
    if (!localString) return '';
    if (localString.includes('/')) {
      const parts = localString.split('/');
      if (parts.length === 3) return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    return localString;
  };

  const loadInventory = async () => {
    setLoading(true);
    try {
      const res = await fetchAPI('get_inventory', { nivel: user.role, nombre: user.name });
      if (res.status === 'success') {
        const parsed = res.data.map((r: any) => ({
          ...r,
          fecha: formatToLocal(r.fecha)
        }));
        setInventory(parsed || []);
      } else {
        setCustomAlert({ message: 'Error al cargar inventario: ' + res.message });
      }
    } catch (e: any) {
      setCustomAlert({ message: 'Error de conexión.' });
    }
    setLoading(false);
  };

  useEffect(() => {
    loadInventory();
  }, []);

  
  const handleMergePDFs = async () => {
    if (!selectedItem) return;
    try {
      setMergingFiles(true);
      const res = await fetchAPI('getAllFilesBase64', { vin: selectedItem.vin });
      if (res.status === 'success' && res.data && res.data.length > 0) {
        const mergedPdf = await PDFDocument.create();
        for (const file of res.data) {
          try {
            const byteString = atob(file.base64);
            const bytes = new Uint8Array(byteString.length);
            for (let i = 0; i < byteString.length; i++) {
              bytes[i] = byteString.charCodeAt(i);
            }
            if (file.mimeType === 'application/pdf') {
              const pdf = await PDFDocument.load(bytes);
              const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
              copiedPages.forEach((page) => mergedPdf.addPage(page));
            } else if (file.mimeType.startsWith('image/')) {
              let image;
              if (file.mimeType === 'image/jpeg') {
                image = await mergedPdf.embedJpg(bytes);
              } else if (file.mimeType === 'image/png') {
                image = await mergedPdf.embedPng(bytes);
              }
              if (image) {
                const dims = image.scale(1);
                const page = mergedPdf.addPage([dims.width, dims.height]);
                page.drawImage(image, {
                  x: 0,
                  y: 0,
                  width: dims.width,
                  height: dims.height,
                });
              }
            }
          } catch(e) {
            console.error("Could not add file to merge", e);
          }
        }
        const mergedPdfBytes = await mergedPdf.save();
        const blob = new Blob([mergedPdfBytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Expediente_${selectedItem.vin}.pdf`;
        link.click();
        URL.revokeObjectURL(url);
      } else {
        setCustomAlert({ message: res.message || 'No hay archivos válidos para combinar o ocurrió un error del servidor.' });
      }
    } catch (e: any) {
      setCustomAlert({ message: 'Error al combinar archivos: ' + e.message });
    } finally {
      setMergingFiles(false);
    }
  };

  const fetchFiles = async (item: InventoryItem) => {
    setLoadingFiles(true);
    try {
      const folderName = `${item.cliente} - ${item.asesor || user?.name}`;
      const res = await fetchAPI('get_files_for_vin', { vin: item.vin, folderName });
      if (res.status === 'success') {
        setLoadedFiles(res.data || []);
      }
    } catch (e) {
      console.error(e);
    }
    setLoadingFiles(false);
  };

  const handleOpenForm = (item?: InventoryItem) => {
    if (item) {
      setSelectedItem(item);
      setFormData({ ...item, fecha: parseFromLocal(item.fecha) });
    } else {
      setSelectedItem(null);
      setFormData({ 
        fecha: new Date().toISOString().split('T')[0],
        asesor: user.name,
        estatus: 'EXPEDIENTE'
      });
    }
    setShowFormModal(true);
  };

  const handleFormChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const executeSave = async (payload: any) => {
    try {
      const res = await fetchAPI('save_record', { data: payload });
      if (res.status === 'success') {
        setCustomAlert({ message: 'Registro guardado exitosamente.' });
        setShowFormModal(false);
        loadInventory();
      } else {
        setCustomAlert({ message: 'Error: ' + res.message });
      }
    } catch (e) {
      setCustomAlert({ message: 'Error de conexión.' });
    }
  };

  const handleSaveForm = async () => {
    if (!formData.vin || !formData.marca) {
      setCustomAlert({ message: 'El VIN y la Marca son obligatorios.' });
      return;
    }
    
    setSavingForm(true);
    const payload = {
      ...formData,
      fecha: formatToLocal(formData.fecha)
    };
    
    try {
      if (selectedItem && selectedItem.vin === formData.vin) {
        const res = await fetchAPI('update_record', { data: payload });
        if (res.status === 'success') {
          setCustomAlert({ message: 'Registro actualizado.' });
          setShowFormModal(false);
          loadInventory();
        } else {
          setCustomAlert({ message: 'Error al actualizar: ' + res.message });
        }
      } else {
        const checkRes = await fetchAPI('check_vin', { vin: payload.vin });
        if (checkRes.exists) {
          setCustomAlert({ message: 'El VIN ya existe en la base de datos.' });
        } else {
          await executeSave(payload);
        }
      }
    } catch (e) {
      setCustomAlert({ message: 'Error al procesar la solicitud.' });
    }
    setSavingForm(false);
  };

  const handleStatusChange = async (vin: string, newStatus: string) => {
    try {
      const res = await fetchAPI('request_valuation', { vin, estatus: newStatus });
      if (res.status === 'success') {
        setInventory(prev => prev.map(i => i.vin === vin ? { ...i, estatus: newStatus } : i));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteClient = (vin: string) => {
    setCustomAlert({
      message: '¿Estás seguro de eliminar este registro y su carpeta en Google Drive? Esta acción no se puede deshacer.',
      isConfirm: true,
      onConfirm: async () => {
        setCustomAlert(null);
        try {
          const res = await fetchAPI('deleteRecord', { vin });
          if (res.status === 'success') {
            loadInventory();
            setCustomAlert({ message: 'Registro y archivos eliminados.' });
          } else {
            setCustomAlert({ message: 'Error al eliminar.' });
          }
        } catch(e) {
          setCustomAlert({ message: 'Error de conexión.' });
        }
      }
    });
  };

  const handleOpenUpload = (item: InventoryItem) => {
    setSelectedItem(item);
    setSelectedDocType('');
    setSelectedFileName('');
    setLoadedFiles([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
    setShowUploadModal(true);
    fetchFiles(item);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFileName(file.name);
    } else {
      setSelectedFileName('');
    }
  };

  const handleUploadAction = () => {
    const file = fileInputRef.current?.files?.[0];
    if (!file || !selectedItem || !selectedDocType) return;
    
    setUploading(true);
    const reader = new FileReader();
    reader.onload = async (evt) => {
      const base64Data = (evt.target?.result as string).split(',')[1];
      try {
        const res = await fetchAPI('upload_file', {
          vin: selectedItem.vin,
          docType: selectedDocType,
          fileName: file.name,
          mimeType: file.type,
          fileData: base64Data,
          folderName: `${selectedItem.cliente} - ${selectedItem.asesor || user?.name}`
        });
        if (res.status === 'success') {
          setCustomAlert({ message: 'Documento subido correctamente a Google Drive.' });
          const folderName = `${selectedItem.cliente} - ${selectedItem.asesor || user?.name}`;
          fetchAPI('get_files_for_vin', { vin: selectedItem.vin, folderName }).then(r => {
            if (r.status === 'success') setLoadedFiles(r.data || []);
          });
        } else {
          setCustomAlert({ message: 'Error: ' + res.message });
        }
      } catch (e) {
        setCustomAlert({ message: 'Error de conexión.' });
      }
      setUploading(false);
      setSelectedFileName('');
      setSelectedDocType('');
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsDataURL(file);
  };

  const generateAvaluoPDF = async (item: InventoryItem) => {
    try {
      const valRes = await fetchAPI('getValuationData', { vin: item.vin });
      const valData = valRes.status === 'success' ? valRes.data : null;

      const doc = new jsPDF();
      doc.setFontSize(16);
      doc.text("Presupuesto de Avalúo", 14, 20);
      
      doc.setFontSize(10);
      doc.text(`Cliente: ${item.cliente}`, 14, 30);
      doc.text(`VIN: ${item.vin}`, 14, 35);
      doc.text(`Vehículo: ${item.marca} ${item.linea} ${item.modelo}`, 14, 40);
      doc.text(`Asesor: ${item.asesor}`, 14, 45);
      
      if (valData) {
        doc.text(`Valuador Técnico: ${valData.valuador_tecnico || 'N/A'}`, 14, 55);
        doc.text(`Fecha Avalúo: ${valData.fecha_avaluo || 'N/A'}`, 14, 60);

        let startY = 70;

        const addSection = (title: string, items: any[], subtotal: number) => {
          if (!items || items.length === 0) return;
          doc.text(title, 14, startY);
          autoTable(doc, {
            startY: startY + 2,
            head: [['Descripción', 'Importe']],
            body: items.map(i => [i.descripcion, `${Number(i.importe).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`]),
            foot: [['Subtotal', `${Number(subtotal).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`]],
            theme: 'grid',
            headStyles: { fillColor: [0, 44, 95] },
            columnStyles: { 1: { halign: 'right' } }
          });
          startY = (doc as any).lastAutoTable.finalY + 10;
        };

        addSection('Mecánica', valData.mecanica, valData.subtotal_mecanica);
        addSection('Mano de Obra', valData.mano_obra, valData.subtotal_mo);
        addSection('Hojalatería y Pintura (HYP)', valData.hyp, valData.subtotal_hyp);

        const sub = (valData.subtotal_mecanica || 0) + (valData.subtotal_mo || 0) + (valData.subtotal_hyp || 0);
        const iva = sub * 0.16;
        
        doc.setFont("helvetica", "normal");
        doc.text("Subtotal General:", 140, startY);
        doc.text(`${sub.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`, 196, startY, { align: 'right' });
        doc.text("I.V.A (16%):", 140, startY + 5);
        doc.text(`${iva.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`, 196, startY + 5, { align: 'right' });
        doc.setFont("helvetica", "bold");
        doc.text("Gran Total:", 140, startY + 10);
        doc.text(`${(valData.gran_total || 0).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`, 196, startY + 10, { align: 'right' });
        
        if (valData.observaciones) {
          doc.setFontSize(11);
          doc.setFont("helvetica", "bold");
          doc.text("Observaciones:", 14, startY + 25);
          doc.setFontSize(9);
          doc.setFont("helvetica", "normal");
          const splitObs = doc.splitTextToSize(valData.observaciones, 180);
          doc.text(splitObs, 14, startY + 30);
        }
      } else {
        doc.text("No hay datos de presupuesto cargados.", 14, 60);
      }
      
      doc.save(`Presupuesto_${item.vin}.pdf`);
    } catch(e) {
      setCustomAlert({ message: 'Error al generar PDF' });
    }
  };

  

  const generateTomaPDF = async (item: InventoryItem) => {
    try {
      const valRes = await fetchAPI('getValuationData', { vin: item.vin });
      const valData = valRes.status === 'success' ? valRes.data : null;
      const granTotal = valData ? valData.gran_total : 0;

      const doc = new jsPDF('landscape'); // Landscape to fit all columns
      doc.setFontSize(10);
      doc.text("Anexo documentación para toma de unidad y formato requerido; favor de confirmar si faltase algún dato:", 14, 20);

      const formatCurrency = (val: any) => {
        if (!val) return '';
        const num = Number(val);
        if (isNaN(num)) return val.toString();
        return '$' + num.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2});
      };

      autoTable(doc, {
        startY: 30,
        head: [['Cliente', 'Marca', 'Modelo', 'Línea', 'Versión', 'Kilometraje', 'Serie', 'Precio\nCompra', 'Precio\nVenta', 'Precio\nToma', 'Agencia', 'Asesor', 'Tipo de\nCompra', 'Recompra']],
        body: [
          [
            { content: item.cliente, rowSpan: 3, styles: { valign: 'middle' } },
            { content: item.marca, rowSpan: 3, styles: { valign: 'middle' } },
            { content: item.modelo, rowSpan: 3, styles: { valign: 'middle' } },
            { content: item.linea || '', rowSpan: 3, styles: { valign: 'middle' } },
            { content: item.version || '', rowSpan: 3, styles: { valign: 'middle' } },
            { content: item.km || '', rowSpan: 3, styles: { valign: 'middle' } },
            { content: item.vin, rowSpan: 3, styles: { valign: 'middle' } },
            { content: formatCurrency(item.precio_compra), rowSpan: 3, styles: { valign: 'middle' } },
            { content: formatCurrency(item.precio_venta), rowSpan: 3, styles: { valign: 'middle' } },
            { content: formatCurrency(item.toma), rowSpan: 3, styles: { valign: 'middle' } },
            { content: 'HYUNDAI COATZACOALCOS', rowSpan: 3, styles: { valign: 'middle' } }, // Agencia
            { content: item.asesor, rowSpan: 3, styles: { valign: 'middle' } },
            { content: 'DACION ' + formatCurrency(item.dacion) },
            { content: 'MARCA\n' + (item.rec_marca || '') }
          ],
          [
            { content: 'FINANCIERA ' + formatCurrency(item.liq_financiera) },
            { content: 'MODELO\n' + (item.rec_modelo || '') }
          ],
          [
            { content: 'DEV CLIENTE ' + formatCurrency(item.dev_cliente) },
            { content: 'SERIE\n' + (item.rec_vin || '') }
          ]
        ],
        theme: 'grid',
        headStyles: { fillColor: [179, 0, 0], textColor: [255, 255, 255], halign: 'center', valign: 'middle', fontSize: 8 },
        bodyStyles: { textColor: [0, 0, 0], fontSize: 8, lineColor: [0, 0, 0], lineWidth: 0.1 },
        styles: { cellPadding: 1, overflow: 'linebreak' },
      });

      const finalY = (doc as any).lastAutoTable.finalY + 15;
      doc.text(`La unidad requiere acondicionamiento por ${formatCurrency(granTotal)}`, 14, finalY);
      doc.text("¡Saludos!", 14, finalY + 10);

      doc.save(`Toma_${item.vin}.pdf`);
    } catch(e) {
      setCustomAlert({ message: 'Error al generar PDF' });
    }
  };

const getStatusOptions = () => {
    if (user.role === 'servicio') return ESTATUS_SERVICIO;
    if (user.role === 'gerencia') return ESTATUS_GERENCIA;
    return ESTATUS_ASESOR;
  };

  const getDocOptions = () => {
    if (user.role === 'servicio') return DOCS_SERVICIO;
    return DOCS_ASESOR;
  };

  const getTrackingColor = (item: InventoryItem) => {
    if (!item.fecha_contrato) return "bg-red-500";
    if (!item.fecha_envio_exp) return "bg-orange-500";
    if (!item.fecha_poliza) return "bg-yellow-500";
    if (item.liq_financiera && !item.fecha_pago_fin) return "bg-blue-500";
    if (item.dev_cliente && !item.fecha_dev_cliente) return "bg-purple-500";
    return "bg-green-500";
  };
  
  const getTrackingTooltip = (item: InventoryItem) => {
    if (!item.fecha_contrato) return "Falta: Fecha Contrato";
    if (!item.fecha_envio_exp) return "Falta: Envío Expediente";
    if (!item.fecha_poliza) return "Falta: Póliza";
    if (item.liq_financiera && !item.fecha_pago_fin) return "Falta: Pago Financiera";
    if (item.dev_cliente && !item.fecha_dev_cliente) return "Falta: Dev Cliente";
    return "Seguimiento Completo";
  };

  const renderTrackingBar = (item: InventoryItem) => {
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
          <div key={i} className={`h-full flex-1 border-r border-white/50 last:border-0 ${step.done ? 'bg-green-500' : 'bg-red-400'}`}></div>
        ))}
      </div>
    );
  };

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = ((item.cliente || '').toLowerCase().includes(search.toLowerCase()) || 
     (item.vin || '').toLowerCase().includes(search.toLowerCase()) || 
     (item.marca || '').toLowerCase().includes(search.toLowerCase()));
    
    if (search.length > 0) {
      return matchesSearch; // If searching, ignore status filter and search everything
    }
    if (user.role === 'servicio' && (statusFilter === 'Avalúo Listo' || statusFilter === 'Avalúo Rechazado')) {
      // In historical view for Servicio, we check the estatus_avaluo from the Avaluos sheet, 
      // which we joined in the backend and passed down as estatus_avaluo
      const aVal = (item.estatus_avaluo || '').toUpperCase();
      if (statusFilter === 'Avalúo Listo' && (aVal === 'AVALÚO LISTO' || aVal === 'AVALUO LISTO' || aVal === 'AVALUO TERMINADO' || aVal === 'AVALÚO TERMINADO')) return true;
      if (statusFilter === 'Avalúo Rechazado' && (aVal === 'AVALÚO RECHAZADO' || aVal === 'AVALUO RECHAZADO' || aVal === 'AUTO RECHAZADO')) return true;
      return item.estatus === statusFilter;
    }
    return (statusFilter === 'ALL' || item.estatus === statusFilter);
  }).sort((a, b) => {
    const parseDate = (d) => {
      if (!d) return 0;
      if (d.includes('T')) return new Date(d).getTime();
      if (d.includes('/')) {
        const parts = d.split('/');
        if (parts.length === 3) return new Date(`${parts[2]}-${parts[1]}-${parts[0]}T00:00:00`).getTime();
      }
      return new Date(d).getTime() || 0;
    };
    return parseDate(b.fecha) - parseDate(a.fecha);
  });

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex flex-col h-full relative">
      {customAlert && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex justify-center items-center p-4">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm w-full">
            <p className="text-gray-800 mb-6 text-center">{customAlert.message}</p>
            <div className="flex justify-center gap-3">
              {customAlert.isConfirm && (
                <button onClick={() => setCustomAlert(null)} className="px-4 py-2 border border-gray-300 rounded font-bold text-gray-700 hover:bg-gray-50">Cancelar</button>
              )}
              <button 
                onClick={() => {
                  if(customAlert.onConfirm) customAlert.onConfirm();
                  else setCustomAlert(null);
                }} 
                className="px-4 py-2 bg-[#002c5f] text-white rounded font-bold hover:bg-[#001a3a]"
              >
                {customAlert.isConfirm ? 'Confirmar' : 'Aceptar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HEADER BAR */}
      <div className="bg-[#002c5f] p-4 flex flex-col sm:flex-row justify-between items-center shrink-0">
        <div className="flex items-center gap-3 mb-3 sm:mb-0">
          <button onClick={() => setCurrentSection(0)} className="bg-white/20 hover:bg-white/30 text-white p-2 rounded transition-colors" title="Volver al Inicio">
            <Home size={20} />
          </button>
          <h2 className="text-xl font-bold text-white">Expedientes Seminuevos</h2>
        </div>
        <div className="flex space-x-2 w-full sm:w-auto">
          {user.role !== 'servicio' && (
            <button 
              onClick={() => handleOpenForm()}
              className="bg-[#1e8449] hover:bg-[#166534] text-white px-4 py-2 rounded flex items-center font-bold text-sm transition-colors shadow-sm"
            >
              <Plus size={16} className="mr-1" /> Nuevo Registro
            </button>
          )}
          <button 
            onClick={loadInventory}
            disabled={loading}
            className="bg-white/20 hover:bg-white/30 text-white px-3 py-2 rounded flex items-center font-bold text-sm transition-colors"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>
      
      {/* TOOLBAR */}
      <div className="p-4 bg-gray-50 border-b border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4 shrink-0">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Buscar por cliente, VIN o marca..." 
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-full focus:outline-none focus:border-[#00aad2] focus:ring-1 focus:ring-[#00aad2] text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        { user.role === 'gerencia' && (
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
        )}
      </div>

      {/* TABLE */}
      <div className="flex-1 overflow-auto bg-white p-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500">
            <RefreshCw className="animate-spin mb-4 text-[#00aad2]" size={32} />
            <span className="font-medium">Cargando expedientes...</span>
          </div>
        ) : filteredInventory.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-400">
            <FileText size={48} className="mb-4 opacity-30" />
            <span className="font-medium text-lg">No se encontraron expedientes</span>
            {search && <span className="text-sm mt-1">Intenta con otros términos de búsqueda</span>}
          </div>
        ) : (
          <table className="w-full text-sm text-left whitespace-nowrap">
            <thead className="bg-gray-100 text-gray-600 sticky top-0 z-10">
              <tr>
                <th className="p-3 font-bold border-b-2 border-gray-200">Fecha</th>
                <th className="p-3 font-bold border-b-2 border-gray-200">Cliente</th>
                <th className="p-3 font-bold border-b-2 border-gray-200">VIN</th>
                <th className="p-3 font-bold border-b-2 border-gray-200">Vehículo</th>
                
                <th className="p-3 font-bold border-b-2 border-gray-200 text-center">Estatus</th>
                <th className="p-3 font-bold border-b-2 border-gray-200 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredInventory.map((item, idx) => {
                const isLocked = (item.estatus === 'Poliza' || item.estatus === 'Liquidación') && user.role !== 'gerencia';
                return (
                  <tr key={idx} className="hover:bg-gray-50 transition-colors">
                    <td className="p-3 text-gray-800">{item.fecha}</td>
                    <td className="p-3 font-medium text-gray-900">
                      {item.cliente}
                      {user.role === 'gerencia' && renderTrackingBar(item)}
                    </td>
                    <td className="p-3 text-gray-500 font-mono text-xs">{item.vin}</td>
                    <td className="p-3 text-gray-800">{item.marca} {item.linea} {item.modelo}</td>
                    
                    
                    
                    <td className="p-3 text-center">
                      <select 
                        value={item.estatus}
                        onChange={(e) => handleStatusChange(item.vin, e.target.value)}
                        disabled={isLocked || (user.role === 'servicio' && !ESTATUS_SERVICIO.includes(item.estatus) && item.estatus !== 'Solicitud Avalúo')}
                        className="p-1.5 border border-gray-300 rounded text-xs bg-white focus:outline-none focus:border-[#00aad2] w-full max-w-[150px] disabled:bg-gray-100"
                      >
                        <option value={item.estatus}>{item.estatus}</option>
                        {getStatusOptions().filter(o => o !== item.estatus).map(opt => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </td>
                    
                    <td className="p-3">
                      <div className="flex items-center justify-center space-x-2">
                        <button 
                            onClick={() => handleOpenForm(item)}
                            className="p-1.5 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded transition-colors disabled:opacity-30 disabled:bg-transparent"
                            title="Editar Datos"
                          >
                            <Edit size={16} />
                          </button>
                        
                        { (user.role === 'servicio' || user.role === 'gerencia') && (
                           <button 
                            onClick={() => { setSelectedItem(item); setShowValuationModal(true); }}
                            className="p-1.5 text-orange-600 bg-orange-50 hover:bg-orange-100 rounded transition-colors disabled:opacity-30 disabled:bg-transparent"
                            title="Presupuesto de Avalúo"
                          >
                            <FileText size={16} />
                          </button>
                        )}
                        
                        <button 
                          onClick={() => handleOpenUpload(item)}
                          className="p-1.5 text-green-600 bg-green-50 hover:bg-green-100 rounded transition-colors disabled:opacity-30 disabled:bg-transparent"
                          title="Cargar Archivos"
                        >
                          <Upload size={16} />
                        </button>
                        
                        {(user.role === 'servicio' || user.role === 'gerencia') && <button 
                            onClick={() => generateAvaluoPDF(item)}
                            className="p-1.5 text-red-600 bg-red-50 hover:bg-red-100 rounded transition-colors disabled:opacity-30"
                            title="Imprimir PDF Avalúo"
                          >
                            <FileDown size={16} />
                          </button>}
                          {(user.role === 'asesor' || user.role === 'gerencia') && <button 
                            onClick={() => generateTomaPDF(item)}
                            className="p-1.5 text-pink-600 bg-pink-50 hover:bg-pink-100 rounded transition-colors disabled:opacity-30"
                            title="Imprimir PDF Toma"
                          >
                            <FileDown size={16} />
                          </button>}
                        
                        {user.role === 'gerencia' && (
                          <>
                            <button 
                              onClick={() => { setSelectedItem(item); setShowTrackingModal(true); }}
                              className="p-1.5 text-purple-600 bg-purple-50 hover:bg-purple-100 rounded transition-colors disabled:opacity-30"
                              title="Seguimiento de Fechas"
                            >
                              <Calendar size={16} />
                            </button>
                            <button 
                              onClick={() => handleDeleteClient(item.vin)}
                              className="p-1.5 text-pink-600 bg-pink-50 hover:bg-pink-100 rounded transition-colors disabled:opacity-30"
                              title="Eliminar Cliente"
                            >
                              <Trash2 size={16} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {showValuationModal && selectedItem && (
        <ValuationModal 
          item={selectedItem} 
          onClose={() => setShowValuationModal(false)} 
          onSaved={() => {
            setShowValuationModal(false);
            setCustomAlert({ message: 'Presupuesto de Avalúo guardado exitosamente.' });
          }}
        />
      )}
      
      {showTrackingModal && selectedItem && (
        <TrackingModal
          item={selectedItem}
          onClose={() => setShowTrackingModal(false)}
          onSaved={() => {
            setShowTrackingModal(false);
            loadInventory();
            setCustomAlert({ message: 'Fechas de seguimiento actualizadas.' });
          }}
        />
      )}

      {/* FORM MODAL ... */}
      {showFormModal && (() => {
        const isFormLocked = selectedItem && (selectedItem.estatus === 'Poliza' || selectedItem.estatus === 'Liquidación') && user.role !== 'gerencia';
        return (
        <div className="fixed inset-0 bg-[#002c5f]/80 z-50 flex justify-center items-center p-4 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden my-auto">
            <div className="bg-[#002c5f] text-white p-4 flex justify-between items-center shrink-0">
              <h2 className="font-bold text-lg">{formData.vin && selectedItem ? 'Actualizar Información' : 'Alta de Nuevo Registro'}</h2>
              <button onClick={() => setShowFormModal(false)} className="hover:bg-white/20 p-1 rounded"><X size={20} /></button>
            </div>
            
            <div className="p-5 overflow-y-auto flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700">Serie (VIN) *</label>
                  <input type="text" value={formData.vin || ""} onChange={e => handleFormChange("vin", e.target.value)} disabled={!!selectedItem || isFormLocked} className="w-full p-2 border border-gray-300 rounded focus:border-[#00aad2] outline-none disabled:bg-gray-100 uppercase" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700">Marca *</label>
                  <input type="text" disabled={isFormLocked} value={formData.marca || ''} onChange={e => handleFormChange('marca', e.target.value)} className="w-full p-2 border border-gray-300 rounded focus:border-[#00aad2] outline-none" />
                </div>
                {/* Add rest of standard fields quickly */}
                <div className="space-y-1"><label className="text-xs font-bold text-gray-700">Cliente</label><input type="text" disabled={isFormLocked} value={formData.cliente || ''} onChange={e => handleFormChange('cliente', e.target.value)} className="w-full p-2 border border-gray-300 rounded" /></div>
                <div className="space-y-1"><label className="text-xs font-bold text-gray-700">Línea</label><input type="text" disabled={isFormLocked} value={formData.linea || ''} onChange={e => handleFormChange('linea', e.target.value)} className="w-full p-2 border border-gray-300 rounded" /></div>
                <div className="space-y-1"><label className="text-xs font-bold text-gray-700">Año (Modelo)</label><input type="text" disabled={isFormLocked} value={formData.modelo || ''} onChange={e => handleFormChange('modelo', e.target.value)} className="w-full p-2 border border-gray-300 rounded" /></div>
                <div className="space-y-1"><label className="text-xs font-bold text-gray-700">Versión</label><input type="text" disabled={isFormLocked} value={formData.version || ''} onChange={e => handleFormChange('version', e.target.value)} className="w-full p-2 border border-gray-300 rounded" /></div>
                <div className="space-y-1"><label className="text-xs font-bold text-gray-700">Kilometraje</label><input type="text" disabled={isFormLocked} value={formData.km || ''} onChange={e => handleFormChange('km', e.target.value)} className="w-full p-2 border border-gray-300 rounded" /></div>
                <div className="space-y-1"><label className="text-xs font-bold text-gray-700">Placa</label><input type="text" disabled={isFormLocked} value={formData.placa || ''} onChange={e => handleFormChange('placa', e.target.value)} className="w-full p-2 border border-gray-300 rounded" /></div>
                <div className="space-y-1"><label className="text-xs font-bold text-gray-700">Precio Compra ($)</label><input type="number" value={formData.precio_compra || ''} onChange={e => handleFormChange('precio_compra', Number(e.target.value))} className="w-full p-2 border border-gray-300 rounded" /></div>
                <div className="space-y-1"><label className="text-xs font-bold text-gray-700">Precio Venta ($)</label><input type="number" value={formData.precio_venta || ''} onChange={e => handleFormChange('precio_venta', Number(e.target.value))} className="w-full p-2 border border-gray-300 rounded" /></div>
                <div className="space-y-1"><label className="text-xs font-bold text-gray-700">Toma Avalúo ($)</label><input type="number" value={formData.toma || ''} onChange={e => handleFormChange('toma', Number(e.target.value))} className="w-full p-2 border border-gray-300 rounded" /></div>
                <div className="space-y-1"><label className="text-xs font-bold text-gray-700">Dación en Pago ($)</label><input type="number" value={formData.dacion || ''} onChange={e => handleFormChange('dacion', Number(e.target.value))} className="w-full p-2 border border-gray-300 rounded" /></div>
                <div className="space-y-1"><label className="text-xs font-bold text-gray-700">Liq. Financiera ($)</label><input type="number" value={formData.liq_financiera || ''} onChange={e => handleFormChange('liq_financiera', Number(e.target.value))} className="w-full p-2 border border-gray-300 rounded" /></div>
                <div className="space-y-1"><label className="text-xs font-bold text-gray-700">Devolución Cliente ($)</label><input type="number" value={formData.dev_cliente || ''} onChange={e => handleFormChange('dev_cliente', Number(e.target.value))} className="w-full p-2 border border-gray-300 rounded" /></div>
              </div>
              <h3 className="font-bold text-gray-700 mt-6 mb-3 border-b pb-1 border-gray-200">Datos Unidad Nueva a Entregar</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1"><label className="text-xs font-bold text-gray-700">Rec Marca</label><input type="text" disabled={isFormLocked} value={formData.rec_marca || ''} onChange={e => handleFormChange('rec_marca', e.target.value)} className="w-full p-2 border border-gray-300 rounded" /></div>
                <div className="space-y-1"><label className="text-xs font-bold text-gray-700">Rec Modelo</label><input type="text" disabled={isFormLocked} value={formData.rec_modelo || ''} onChange={e => handleFormChange('rec_modelo', e.target.value)} className="w-full p-2 border border-gray-300 rounded" /></div>
                <div className="space-y-1 md:col-span-2"><label className="text-xs font-bold text-gray-700">Rec VIN</label><input type="text" disabled={isFormLocked} value={formData.rec_vin || ''} onChange={e => handleFormChange('rec_vin', e.target.value)} className="w-full p-2 border border-gray-300 rounded uppercase" /></div>
              </div>
            </div>
            
            <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3 shrink-0">
              <button onClick={() => setShowFormModal(false)} className="px-5 py-2 border border-gray-300 rounded font-bold text-gray-700 hover:bg-gray-100">Cancelar</button>
              {!isFormLocked && <button disabled={savingForm} onClick={handleSaveForm} className="px-5 py-2 bg-[#002c5f] text-white rounded font-bold hover:bg-[#001a3a] flex items-center">
                {savingForm ? <RefreshCw className="animate-spin mr-2" size={18} /> : <Save className="mr-2" size={18} />} Guardar
              </button>}
            </div>
          </div>
        </div>
      );})()}

      {/* UPLOAD MODAL */}
      {showUploadModal && selectedItem && (
        <div className="fixed inset-0 bg-[#002c5f]/80 z-50 flex justify-center items-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="bg-white p-4 flex justify-between items-center shrink-0 border-b border-gray-200">
              <h2 className="font-bold text-[#002c5f] text-lg flex items-center">Expediente: {selectedItem.cliente} ({selectedItem.vin})</h2>
              <button onClick={() => setShowUploadModal(false)} className="text-gray-500 hover:text-gray-800 p-1 rounded"><X size={20} /></button>
            </div>
            
            <div className="p-5 flex-1 overflow-y-auto bg-gray-50">
              <div className="flex flex-col md:flex-row gap-5">
                <div className="w-full md:w-5/12">
                  <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-gray-100">
                      <h3 className="font-bold text-gray-800 text-sm">Subir Documento Nuevo</h3>
                    </div>
                    <div className="p-4 space-y-4">
                      <select 
                        className="w-full p-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-[#00aad2]"
                        value={selectedDocType}
                        onChange={e => setSelectedDocType(e.target.value)}
                        disabled={uploading}
                      >
                        <option value="">-- Seleccionar --</option>
                        {getDocOptions().map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                      <div className="flex border border-gray-300 rounded overflow-hidden">
                        <button 
                          onClick={() => fileInputRef.current?.click()}
                          className="bg-gray-100 px-3 py-2 text-sm text-gray-700 border-r border-gray-300 hover:bg-gray-200 shrink-0 font-medium"
                        >
                          Seleccionar
                        </button>
                        <div className="px-3 py-2 text-sm text-gray-500 truncate flex-1 bg-white">
                          {selectedFileName || 'Ningún archivo'}
                        </div>
                      </div>
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        className="hidden" 
                        accept=".pdf,image/*" 
                        onChange={handleFileChange} 
                      />
                      <button 
                        disabled={!selectedDocType || !selectedFileName || uploading || ((selectedItem?.estatus === 'Poliza' || selectedItem?.estatus === 'Liquidación') && user.role !== 'gerencia')}
                        onClick={handleUploadAction}
                        className="w-full py-2.5 bg-[#1e8449] disabled:bg-gray-400 text-white rounded font-bold hover:bg-[#166534] flex items-center justify-center transition-colors shadow-sm"
                      >
                        {uploading ? <RefreshCw className="animate-spin mr-2" size={18} /> : null}
                        Subir a Drive
                      </button>
                    </div>
                  </div>
                </div>
                <div className="w-full md:w-7/12">
                  <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden flex flex-col h-full min-h-[300px]">
                    <div className="p-4 border-b border-gray-100 flex justify-between items-center shrink-0">
                      <h3 className="font-bold text-[#1e8449] text-sm">Documentos Cargados</h3>
                      <div className="flex gap-2">
                            <button disabled={mergingFiles} onClick={handleMergePDFs} className="flex items-center gap-1 bg-[#1e8449] hover:bg-[#166534] text-white px-2 py-1 rounded text-xs font-bold transition-colors disabled:opacity-50">
                              {mergingFiles ? <RefreshCw size={14} className="animate-spin" /> : <FileDown size={14} />} Combinar PDF
                            </button>
                            <button onClick={() => fetchFiles(selectedItem!)} className="text-gray-400 hover:text-[#00aad2] p-1">
                              <RefreshCw size={16} className={loadingFiles ? "animate-spin" : ""} />
                            </button>
                          </div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-0">
                      {loadingFiles ? (
                        <div className="flex flex-col items-center justify-center h-40 text-gray-500">
                          <RefreshCw className="animate-spin mb-2 text-[#00aad2]" size={24} />
                          <span className="text-sm">Cargando documentos...</span>
                        </div>
                      ) : loadedFiles.length > 0 ? (
                        <div className="divide-y divide-gray-100">
                          {loadedFiles.map((f, i) => (
                            <div key={i} className="flex justify-between items-center p-3 hover:bg-gray-50">
                              <div className="overflow-hidden pr-4 flex-1">
                                <div className="font-bold text-sm text-gray-800">{f.type}</div>
                                <div className="text-xs text-gray-500 truncate" title={f.name}>{f.name}</div>
                              </div>
                              <a 
                                href={f.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="px-4 py-1.5 border border-[#3b82f6] text-[#3b82f6] rounded text-sm hover:bg-blue-50 bg-white shrink-0 font-medium transition-colors"
                              >
                                Abrir
                              </a>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center h-40 text-gray-400">
                          <FileText size={32} className="mb-2 opacity-30" />
                          <span className="text-sm">No hay documentos cargados.</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
