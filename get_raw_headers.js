fetch('https://script.google.com/macros/s/AKfycbzqMLrYKu-AustdxU_u0IuWSbd1RvKDb0idgf7S_KQMf3E9Qhu5NJAuGJpQdkpwdMqABw/exec', {
  method: 'POST',
  body: JSON.stringify({ action: "get_cloud_data" })
}).then(res => res.json()).then(console.log);
