import React, { useRef, useState } from "react";
import { useAppContext, fetchAPI } from "../store";
import * as XLSX from "xlsx";
import { UploadCloud, CheckCircle } from "lucide-react";

export default function Home() {
  const { user, cloudStatus, setCurrentSection, cloudData, refreshCloudData } =
    useAppContext();
  const [azulStatus, setAzulStatus] = useState("Esperando sincronización...");
  const [citasStatus, setCitasStatus] = useState("Esperando sincronización...");

  const fileAzulRef = useRef<HTMLInputElement>(null);
  const fileCitasRef = useRef<HTMLInputElement>(null);

  const isAdmin = user?.role === "gerencia";
  const hasAzul =
    !!cloudData?.dbInventario && Object.keys(cloudData.dbInventario).length > 0;
  const hasCitas =
    !!cloudData?.rawCitasExcel && cloudData.rawCitasExcel.length > 0;

  const saveToCloud = async (payload: any) => {
    try {
      const res = await fetchAPI("save_cloud_data", payload);
      if (res.status === "success") {
        await refreshCloudData();
        return true;
      }
      return false;
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  const handleAzulUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAzulStatus(`Cargado y procesando: ${file.name}`);

    const reader = new FileReader();
    reader.onload = async (evt) => {
      const data = evt.target?.result;
      const workbook = XLSX.read(data, { type: "array" });
      const rows: any[][] = XLSX.utils.sheet_to_json(
        workbook.Sheets[workbook.SheetNames[0]],
        { header: 1 },
      );

      const dbInventario: Record<string, any> = {};
      let anio: string | null = null;
      let modelo: string | null = null;

      rows.forEach((f) => {
        if (!f || f.length < 2) return;
        const c0 = String(f[0] || "").trim();
        const c1 = String(f[1] || "").trim();

        if (c0.toUpperCase() === "AÑO") {
          anio = String(f[1]).trim();
          if (!dbInventario[anio]) dbInventario[anio] = {};
          return;
        }
        if (c1.toUpperCase().includes("VENTA")) {
          modelo = c0;
          if (anio && !dbInventario[anio][modelo])
            dbInventario[anio][modelo] = [];
          return;
        }
        if (
          anio &&
          modelo &&
          f[1] &&
          !isNaN(parseFloat(String(f[1]).replace(/[$,\s]/g, "")))
        ) {
          let pToma = parseFloat(
            String(f[5] || f[2] || f[1]).replace(/[$,\s]/g, ""),
          );
          if (!isNaN(pToma)) {
            dbInventario[anio][modelo].push({ v: c0, p: pToma });
          }
        }
      });

      setAzulStatus(`Enviando a la nube...`);
      const success = await saveToCloud({ tipo: "azul", dbInventario });
      if (success) {
        setAzulStatus("Sincronizado (Nube)");
      } else {
        setAzulStatus("Error al guardar");
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleCitasUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const nameCitas = file.name;

    const pass = prompt(
      "Ingrese la contraseña para proteger el PDF de citas de hoy:",
    );
    if (!pass) return;

    setCitasStatus(`Cargado y procesando...`);
    const reader = new FileReader();
    reader.onload = async (evt) => {
      const data = evt.target?.result;
      const workbook = XLSX.read(data, { type: "array" });
      const rawCitasExcel = XLSX.utils.sheet_to_json(
        workbook.Sheets[workbook.SheetNames[0]],
        { header: 1 },
      );

      setCitasStatus(`Enviando a la nube...`);
      const success = await saveToCloud({
        tipo: "citas",
        rawCitasExcel,
        nameCitas,
        pdfPass: pass,
      });
      if (success) {
        setCitasStatus("Sincronizado (Nube)");
      } else {
        setCitasStatus("Error al guardar");
      }
    };
    reader.readAsArrayBuffer(file);
  };

  return (
    <div className="flex-1 flex justify-center items-center p-5 bg-[#f4f6f9] h-full">
      <div className="max-w-[850px] w-full bg-white py-[30px] px-[40px] rounded-lg shadow-[0_15px_40px_rgba(0,44,95,0.15)] border-t-[8px] border-[#002c5f] text-center">
        <h1 className="text-[#002c5f] text-2xl font-bold mb-2">
          ¡Bienvenido/a, {user?.name}! ({user?.role})
        </h1>
        <div
          className={`text-base mb-6 transition-colors ${cloudStatus.includes("Listo") ? "text-[#27ae60]" : "text-[#f39c12]"}`}
        >
          {cloudStatus}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
          <button
            disabled={!hasAzul}
            onClick={() => setCurrentSection(1)}
            className="bg-[#00aad2] disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-[#002c5f] text-white p-5 rounded-lg font-bold uppercase transition-all hover:-translate-y-1"
          >
            Sección Uno
            <br />
            <span className="text-[11px] font-normal normal-case">
              Cotizador de Toma
            </span>
          </button>

          <button
            disabled={!hasCitas}
            onClick={() => setCurrentSection(2)}
            className="bg-[#00aad2] disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-[#002c5f] text-white p-5 rounded-lg font-bold uppercase transition-all hover:-translate-y-1"
          >
            Sección Dos
            <br />
            <span className="text-[11px] font-normal normal-case">
              Citas de Servicio
            </span>
          </button>

          <button
            onClick={() => setCurrentSection(3)}
            className="bg-[#27ae60] hover:bg-[#1e8449] text-white p-5 rounded-lg font-bold uppercase transition-all hover:-translate-y-1"
          >
            Sección Tres
            <br />
            <span className="text-[11px] font-normal normal-case">
              Solicitud de Avalúos
            </span>
          </button>
        </div>

        {isAdmin && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-gray-200 text-left">
            <div className="bg-gray-50 p-3 rounded border border-dashed border-gray-300 text-center">
              <h3 className="text-xs text-gray-600 uppercase mb-2 font-bold">
                Actualizar Libro Azul
              </h3>
              <input
                type="file"
                ref={fileAzulRef}
                accept=".xlsx, .xls, .csv"
                className="hidden"
                onChange={handleAzulUpload}
              />
              <button
                onClick={() => fileAzulRef.current?.click()}
                className="text-[11px] px-3 py-1 bg-white border border-[#002c5f] text-[#002c5f] rounded hover:bg-gray-100 flex items-center justify-center mx-auto"
              >
                <UploadCloud size={14} className="mr-1" /> Cargar Excel
              </button>
              <div
                className={`text-[10px] mt-2 font-bold ${hasAzul ? "text-[#27ae60]" : "text-[#c0392b]"}`}
              >
                {hasAzul ? "Sincronizado (Nube)" : azulStatus}
              </div>
            </div>

            <div className="bg-gray-50 p-3 rounded border border-dashed border-gray-300 text-center">
              <h3 className="text-xs text-gray-600 uppercase mb-2 font-bold">
                Actualizar Base Citas
              </h3>
              <input
                type="file"
                ref={fileCitasRef}
                accept=".xlsx, .xls, .csv"
                className="hidden"
                onChange={handleCitasUpload}
              />
              <button
                onClick={() => fileCitasRef.current?.click()}
                className="text-[11px] px-3 py-1 bg-white border border-[#002c5f] text-[#002c5f] rounded hover:bg-gray-100 flex items-center justify-center mx-auto"
              >
                <UploadCloud size={14} className="mr-1" /> Cargar Excel
              </button>
              <div
                className={`text-[10px] mt-2 font-bold ${hasCitas ? "text-[#27ae60]" : "text-[#c0392b]"}`}
              >
                {hasCitas ? "Sincronizado (Nube)" : citasStatus}
              </div>
            </div>
          </div>
        )}
        {isAdmin && (
          <p className="text-[9px] text-gray-500 mt-4 text-center">
            Los archivos cargados se sincronizarán automáticamente con la nube
            para el resto del equipo.
          </p>
        )}
      </div>
    </div>
  );
}
