const fs = require('fs');
let code = fs.readFileSync('src/components/ValuationModal.tsx', 'utf8');

code = code.replace(
  /const formatToInput = \(dateString\?: string\) => \{/g,
  "const formatToInput = (dateString?: any) => {\n    if (!dateString) return '';\n    const str = String(dateString);\n    if (str.includes('T')) return str.split('T')[0];\n    if (str.includes('/')) {\n      const parts = str.split('/');\n      if (parts.length === 3) return `${parts[2]}-${parts[1]}-${parts[0]}`;\n    }\n    return str;"
);

// We need to also clean up the old body of formatToInput, so let's just replace the whole function
