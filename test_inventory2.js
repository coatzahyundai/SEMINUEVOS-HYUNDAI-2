const url = 'https://script.google.com/macros/s/AKfycby-DRulQsogKBnxUEc924V7HyAxN-DoYRv0tOxABQhx5JWV-JL2hvPfg2i5QuFl6Nqnbg/exec';
async function run() {
  const res = await fetch(url, { method: 'POST', body: JSON.stringify({ action: "get_inventory", nivel: "gerencia", nombre: "Cristobal Galvan" })}).then(r=>r.json());
  console.log(res.data[0]);
}
run();
