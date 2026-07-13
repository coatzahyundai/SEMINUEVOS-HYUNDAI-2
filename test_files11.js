fetch('https://script.google.com/macros/s/AKfycby-DRulQsogKBnxUEc924V7HyAxN-DoYRv0tOxABQhx5JWV-JL2hvPfg2i5QuFl6Nqnbg/exec', {
  method: 'POST',
  body: JSON.stringify({ action: "request_valuation", vin: "MB2PB2B21MM094802   ", estatus: "TEST" })
}).then(res => res.json()).then(res => console.log(res));
