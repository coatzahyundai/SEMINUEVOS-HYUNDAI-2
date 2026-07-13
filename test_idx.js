const url = 'https://script.google.com/macros/s/AKfycby-DRulQsogKBnxUEc924V7HyAxN-DoYRv0tOxABQhx5JWV-JL2hvPfg2i5QuFl6Nqnbg/exec';
async function run() {
  const readRes = await fetch(url, { method: 'POST', body: JSON.stringify({ action: "get_cloud_data" })}).then(r=>r.json());
  const headers = readRes.data.layout[1];
  console.log(headers);
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
    return s;
  }
  const norm = headers.map(normalizeKey);
  console.log(norm);
}
run();
