fetch('https://script.google.com/macros/s/AKfycbw6029Z69GVzy8vgl7G28ZJ56hNQ7lE2NIFtyBdqVzeeFmqNc50l2mn6vTTZk67m4Q6wQ/exec', {
  method: 'POST',
  body: JSON.stringify({ action: "get_inventory", nivel: "admin", nombre: "" })
}).then(res => res.json()).then(console.log);
