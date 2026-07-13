const url = 'https://script.google.com/macros/s/AKfycby-DRulQsogKBnxUEc924V7HyAxN-DoYRv0tOxABQhx5JWV-JL2hvPfg2i5QuFl6Nqnbg/exec';

const tests = ["request_valuation", "update_status", "save_valuation"];

async function run() {
  for(let a of tests) {
    const res = await fetch(url, { method: 'POST', body: JSON.stringify({ action: a, vin: "MB2PB2B21MM094802   ", estatus: "TEST" })}).then(r=>r.json());
    console.log(a, "->", res);
  }
}
run();
