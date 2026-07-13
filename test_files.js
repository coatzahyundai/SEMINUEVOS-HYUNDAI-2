fetch('https://script.google.com/macros/s/AKfycby-DRulQsogKBnxUEc924V7HyAxN-DoYRv0tOxABQhx5JWV-JL2hvPfg2i5QuFl6Nqnbg/exec', {
  method: 'POST',
  body: JSON.stringify({ action: "get_files_for_vin", vin: "1RAKLOX7xR9pFCUJ6YXG5WvyxqzBeyWBJ" })
}).then(res => res.json()).then(console.log);
