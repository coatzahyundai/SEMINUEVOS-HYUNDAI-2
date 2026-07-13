const url = 'https://script.google.com/macros/s/AKfycby-DRulQsogKBnxUEc924V7HyAxN-DoYRv0tOxABQhx5JWV-JL2hvPfg2i5QuFl6Nqnbg/exec';
async function run() {
  const readRes = await fetch(url, { method: 'POST', body: JSON.stringify({ action: "get_cloud_data" })}).then(r=>r.json());
  console.log("Inventario keys:", Object.keys(readRes.data.dbInventario).length);
  console.log(readRes.data.dbInventario["MB2PB2B21MM094802   "]);
}
run();
