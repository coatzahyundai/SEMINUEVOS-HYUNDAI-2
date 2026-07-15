export interface User {
  name: string;
  role: string;
  original: any;
}

export interface CloudData {
  dbInventario: Record<string, Record<string, { v: string; p: number }[]>>;
  rawCitasExcel: any[][];
  nameCitas: string;
  pdfPass: string;
}

export interface InventoryItem {
  vin: string;
  fecha?: string;
  cliente: string;
  marca: string;
  linea?: string;
  modelo: string;
  version?: string;
  km?: string;
  placa?: string;
  precio_compra?: number;
  precio_venta?: number;
  toma: number;
  dacion?: number;
  liq_financiera?: number;
  dev_cliente?: number;
  rec_marca?: string;
  rec_modelo?: string;
  rec_vin?: string;
  asesor: string;
  color?: string;
  estatus: string;
  estatus_avaluo?: string;
  fecha_contrato?: string;
  fecha_envio_exp?: string;
  fecha_poliza?: string;
  fecha_pago_fin?: string;
  fecha_dev_cliente?: string;
}

export interface ValuationRow {
  descripcion: string;
  importe: number;
}

export interface ValuationData {
  vin?: string;
  estatus_avaluo?: string;
  fecha_avaluo?: string;
  observaciones?: string;
  mecanica: ValuationRow[];
  subtotal_mecanica: number;
  mano_obra: ValuationRow[];
  subtotal_mo: number;
  hyp: ValuationRow[];
  subtotal_hyp: number;
  gran_total: number;
  tiene_garantia: string;
  valuador_tecnico: string;
}

export interface DriveFile {
  type: string;
  name: string;
  url?: string;
  error?: boolean;
}
