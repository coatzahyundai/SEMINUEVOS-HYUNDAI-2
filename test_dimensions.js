const url = 'https://script.google.com/macros/s/AKfycby-DRulQsogKBnxUEc924V7HyAxN-DoYRv0tOxABQhx5JWV-JL2hvPfg2i5QuFl6Nqnbg/exec';
async function run() {
  const readRes = await fetch(url, { method: 'POST', body: JSON.stringify({ action: "get_cloud_data" })}).then(r=>r.json());
  console.log("Layout length:", readRes.data.layout.length);
  if(readRes.data.layout.length > 2) {
    console.log("Row 2 length:", readRes.data.layout[2].length);
  }
}
run();
