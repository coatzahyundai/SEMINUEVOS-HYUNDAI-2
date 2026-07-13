const fs = require('fs');
let code = fs.readFileSync('src/components/ValuationModal.tsx', 'utf8');

code = code.replace(
  /className="bg-white rounded-lg shadow-xl w-full max-w-5xl my-8 flex flex-col"/,
  'className="bg-white rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden"'
);

fs.writeFileSync('src/components/ValuationModal.tsx', code);
