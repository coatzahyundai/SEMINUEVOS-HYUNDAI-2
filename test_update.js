const payload = {
  action: "update_record",
  data: {
    vin: "TESTINGVIN123",
    fecha: "08/07/2026",
    cliente: "John Doe Updated",
    marca: "Toyota",
    linea: "Corolla",
    version: "SE",
    modelo: "2024",
    km: "10000",
    placa: "XYZ123",
    precio_compra: "200000",
    precio_venta: "250000",
    toma: "200000"
  }
};
console.log(JSON.stringify(payload));
