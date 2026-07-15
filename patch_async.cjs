const fs = require('fs');
let code = fs.readFileSync('src/components/Section3.tsx', 'utf8');

code = code.replace(
  /const handleUploadAction = \(\) => \{/g,
  'const handleUploadAction = async () => {'
);

fs.writeFileSync('src/components/Section3.tsx', code);
