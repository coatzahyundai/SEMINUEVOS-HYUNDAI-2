const url = 'https://script.google.com/macros/s/AKfycby-DRulQsogKBnxUEc924V7HyAxN-DoYRv0tOxABQhx5JWV-JL2hvPfg2i5QuFl6Nqnbg/exec';
async function run() {
  const writeRes = await fetch(url, { method: 'POST', body: JSON.stringify({ action: "update_status", vin: "MB2PB2B21MM094802   ", estatus: "TEST_ESTATUS_123" })}).then(r=>r.json());
  console.log("Write:", writeRes);
  const readRes = await fetch(url, { method: 'POST', body: JSON.stringify({ action: "get_cloud_data" })}).then(r=>r.json());
  const row2 = readRes.data.layout[2];
  console.log("Row2 V (index 21):", row2[21]);
  // also check where "TEST_ESTATUS_123" went
  const foundIdx = row2.indexOf("TEST_ESTATUS_123");
  console.log("Found at index:", foundIdx);
}
run();
