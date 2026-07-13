const fs = require('fs');
let code = fs.readFileSync('src/components/ValuationModal.tsx', 'utf8');

code = code.replace(
  /<table className="w-full text-sm text-left">/g,
  '<div className="overflow-x-auto w-full"><table className="w-full text-sm text-left min-w-[300px]">'
);

code = code.replace(
  /<\/table>\s*<\/div>\s*\);\s*return \(/,
  '</table></div></div>\n  );\n\n  return ('
);

fs.writeFileSync('src/components/ValuationModal.tsx', code);
