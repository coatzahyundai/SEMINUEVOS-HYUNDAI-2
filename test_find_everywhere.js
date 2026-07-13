const url = 'https://script.google.com/macros/s/AKfycby-DRulQsogKBnxUEc924V7HyAxN-DoYRv0tOxABQhx5JWV-JL2hvPfg2i5QuFl6Nqnbg/exec';
async function run() {
  const ts = "FIND_ME_" + Date.now();
  await fetch(url, { method: 'POST', body: JSON.stringify({ action: "update_status", vin: "MB2PB2B21MM094802   ", estatus: ts })});
  const readRes = await fetch(url, { method: 'POST', body: JSON.stringify({ action: "get_cloud_data" })}).then(r=>r.json());
  const layout = readRes.data.layout;
  for(let i=0; i<layout.length; i++) {
    for(let j=0; j<layout[i].length; j++) {
      if(String(layout[i][j]).includes(ts)) {
         console.log("Found at row", i, "col", j, "header is", layout[1][j]);
      }
    }
  }
}
run();
