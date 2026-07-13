const url = 'https://script.google.com/macros/s/AKfycby-DRulQsogKBnxUEc924V7HyAxN-DoYRv0tOxABQhx5JWV-JL2hvPfg2i5QuFl6Nqnbg/exec';
async function run() {
  const readRes = await fetch(url, { method: 'POST', body: JSON.stringify({ action: "get_cloud_data" })}).then(r=>r.json());
  let count = 0;
  for(let i=0; i<readRes.data.layout.length; i++) {
    if(readRes.data.layout[i][0] === "MB2PB2B21MM094802   ") {
       console.log("Found at row:", i);
       count++;
    }
  }
  console.log("Total:", count);
}
run();
