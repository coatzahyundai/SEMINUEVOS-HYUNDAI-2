const url = 'https://script.google.com/macros/s/AKfycbzqJY9Qo_YTME6JhMVwB2twqyF-tPTYtxWdvrCkTf0RHbTlcOC-zguahj5pio5Jm1oaGA/exec';
async function run() {
  const res = await fetch(url, { method: 'POST', body: JSON.stringify({ action: "get_inventory", nivel: "gerencia", nombre: "Cristobal Galvan" })}).then(r=>r.json());
  console.log("Keys in first item:", Object.keys(res.data[0]));
  console.log("Values:", res.data[0]);
}
run();
