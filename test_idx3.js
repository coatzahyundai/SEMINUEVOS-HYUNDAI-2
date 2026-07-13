const url = 'https://script.google.com/macros/s/AKfycbzqJY9Qo_YTME6JhMVwB2twqyF-tPTYtxWdvrCkTf0RHbTlcOC-zguahj5pio5Jm1oaGA/exec';
async function run() {
  const readRes = await fetch(url, { method: 'POST', body: JSON.stringify({ action: "get_cloud_data" })}).then(r=>r.json());
  console.log("Headers:", readRes.data.layout[1]);
}
run();
