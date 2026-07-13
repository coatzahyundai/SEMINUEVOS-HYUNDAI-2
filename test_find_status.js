const url = 'https://script.google.com/macros/s/AKfycby-DRulQsogKBnxUEc924V7HyAxN-DoYRv0tOxABQhx5JWV-JL2hvPfg2i5QuFl6Nqnbg/exec';
async function run() {
  const readRes = await fetch(url, { method: 'POST', body: JSON.stringify({ action: "get_cloud_data" })}).then(r=>r.json());
  for(let i=0; i<readRes.data.layout.length; i++) {
    const foundIdx = readRes.data.layout[i].indexOf("TEST_ESTATUS_123");
    if(foundIdx !== -1) {
      console.log("Found at row:", i, "index:", foundIdx);
    }
  }
}
run();
