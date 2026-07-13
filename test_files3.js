fetch('https://script.google.com/macros/s/AKfycby-DRulQsogKBnxUEc924V7HyAxN-DoYRv0tOxABQhx5JWV-JL2hvPfg2i5QuFl6Nqnbg/exec', {
  method: 'POST',
  body: JSON.stringify({ action: "get_files_for_vin", vin: "MB2PB2B21MM094802   " })
}).then(res => res.json()).then(res => console.log(res));
