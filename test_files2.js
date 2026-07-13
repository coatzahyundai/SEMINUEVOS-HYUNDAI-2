fetch('https://script.google.com/macros/s/AKfycby-DRulQsogKBnxUEc924V7HyAxN-DoYRv0tOxABQhx5JWV-JL2hvPfg2i5QuFl6Nqnbg/exec', {
  method: 'POST',
  body: JSON.stringify({ action: "get_cloud_data" })
}).then(res => res.json()).then(res => console.log(res.data.layout[2].slice(0, 5)));
