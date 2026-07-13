fetch('https://script.google.com/macros/s/AKfycbzqMLrYKu-AustdxU_u0IuWSbd1RvKDb0idgf7S_KQMf3E9Qhu5NJAuGJpQdkpwdMqABw/exec', {
  method: 'POST',
  body: JSON.stringify({ action: "test_layout" }) // Wait, I don't have a test_layout action.
}).then(res => res.json()).then(console.log);
