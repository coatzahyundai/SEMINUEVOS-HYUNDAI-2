const url = 'https://script.google.com/macros/s/AKfycby-DRulQsogKBnxUEc924V7HyAxN-DoYRv0tOxABQhx5JWV-JL2hvPfg2i5QuFl6Nqnbg/exec';
async function run() {
  const readRes = await fetch(url, { method: 'POST', body: JSON.stringify({ action: "get_cloud_data" })}).then(r=>r.json());
  const row2 = readRes.data.layout[2];
  
  // also get via get_inventory
  const res = await fetch(url, { method: 'POST', body: JSON.stringify({ action: "get_inventory", nivel: "gerencia", nombre: "Cristobal Galvan" })}).then(r=>r.json());
  const invRow = res.data.find(d => d.vin === row2[0]);
  console.log("From layout:", row2.slice(3, 20));
  console.log("From get_inventory:", invRow);
}
run();
