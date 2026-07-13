const fs = require('fs');
let code = fs.readFileSync('vite.config.ts', 'utf8');

if (!code.includes("base:")) {
  code = code.replace(
    /export default defineConfig\(\(\) => \{\s*return \{/,
    "export default defineConfig(() => {\\n  return {\\n    base: './',"
  );
  fs.writeFileSync('vite.config.ts', code);
}
