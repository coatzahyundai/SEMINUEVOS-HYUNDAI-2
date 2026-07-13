const url = 'https://script.google.com/macros/s/AKfycby-DRulQsogKBnxUEc924V7HyAxN-DoYRv0tOxABQhx5JWV-JL2hvPfg2i5QuFl6Nqnbg/exec';
async function run() {
  const ts = "TES_" + Date.now().toString().slice(-4);
  const writeRes = await fetch(url, { method: 'POST', body: JSON.stringify({ action: "update_record", data: { vin: "MB2PB2B21MM094802   ", modelo: ts } })}).then(r=>r.json());
  console.log("Write res:", writeRes);
}
run();
