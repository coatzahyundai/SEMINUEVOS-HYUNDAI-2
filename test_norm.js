function normalizeKey(str) {
  if (!str) return "";
  var s = str.toString().trim().toLowerCase()
    .replace(/\s+/g, "")
    .replace(/_/g, "")
    .replace(/ñ/g, "n")
    .replace(/[áäâ]/g, "a")
    .replace(/[éëê]/g, "e")
    .replace(/[íïî]/g, "i")
    .replace(/[óöô]/g, "o")
    .replace(/[úüû]/g, "u");
  s = s.replace("tenencias", "tenencia");
  s = s.replace("comprobantededomicilio", "compdedomicilio");
  s = s.replace("facturacopiaocartacompromisoorefactura", "facturacopia");
  s = s.replace("bajadeplacasocartacompromiso", "bajadeplacas");
  return s;
}
console.log(normalizeKey("ESTATUS"));
