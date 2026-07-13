const fs = require('fs');
let code = fs.readFileSync('src/components/ValuationModal.tsx', 'utf8');

code = code.replace(
  /const isLocked = item\.estatus === 'Poliza';/,
  `const { user } = useAppContext();\n  const isLocked = item.estatus === 'Poliza' && user?.role !== 'gerencia';`
);

code = code.replace(
  /import \{ fetchAPI \} from '\.\.\/store';/,
  `import { fetchAPI, useAppContext } from '../store';`
);

fs.writeFileSync('src/components/ValuationModal.tsx', code);
