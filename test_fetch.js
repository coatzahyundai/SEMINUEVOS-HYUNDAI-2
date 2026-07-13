const url = "https://script.google.com/macros/s/AKfycbwVx_W6UuDChge5BliCiixLCH_z6gYTDiRwNx2isaeNcK5S1rFYRc9UUlQ4BARmRG1P8Q/exec";

async function run() {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "text/plain" },
    body: JSON.stringify({ action: "get_cloud_data" })
  });
  const text = await response.text();
  console.log("TEXT:", text.substring(0, 500));
  try {
    const json = JSON.parse(text);
    console.log("JSON status:", json.status);
    if (json.data && json.data.usuarios) {
      console.log("Usuarios:", json.data.usuarios);
    }
  } catch(e) {
    console.error(e);
  }
}
run();
