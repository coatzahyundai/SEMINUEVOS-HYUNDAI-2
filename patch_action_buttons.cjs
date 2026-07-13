const fs = require('fs');
let code = fs.readFileSync('src/components/Section3.tsx', 'utf8');

code = code.replace(
  /className="p-1\.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors disabled:opacity-30 disabled:hover:bg-transparent"/g,
  `className="p-1.5 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded transition-colors disabled:opacity-30 disabled:bg-transparent"`
);

code = code.replace(
  /className="p-1\.5 text-gray-500 hover:text-orange-600 hover:bg-orange-50 rounded transition-colors disabled:opacity-30 disabled:hover:bg-transparent"/g,
  `className="p-1.5 text-orange-600 bg-orange-50 hover:bg-orange-100 rounded transition-colors disabled:opacity-30 disabled:bg-transparent"`
);

code = code.replace(
  /className="p-1\.5 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded transition-colors disabled:opacity-30 disabled:hover:bg-transparent"/g,
  `className="p-1.5 text-green-600 bg-green-50 hover:bg-green-100 rounded transition-colors disabled:opacity-30 disabled:bg-transparent"`
);

code = code.replace(
  /className="p-1\.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"/g,
  `className="p-1.5 text-red-600 bg-red-50 hover:bg-red-100 rounded transition-colors disabled:opacity-30"`
);

code = code.replace(
  /className="p-1\.5 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded transition-colors"/g,
  `className="p-1.5 text-purple-600 bg-purple-50 hover:bg-purple-100 rounded transition-colors disabled:opacity-30"`
);

code = code.replace(
  /className="p-1\.5 text-gray-500 hover:text-red-700 hover:bg-red-100 rounded transition-colors"/g,
  `className="p-1.5 text-pink-600 bg-pink-50 hover:bg-pink-100 rounded transition-colors disabled:opacity-30"`
);

fs.writeFileSync('src/components/Section3.tsx', code);
