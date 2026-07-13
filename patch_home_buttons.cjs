const fs = require('fs');

// Section 1
let code1 = fs.readFileSync('src/components/Section1.tsx', 'utf8');
code1 = code1.replace(/import \{.*?\} from 'lucide-react';/, (match) => {
  if (!match.includes('Home')) return match.replace('{', '{ Home,');
  return match;
});
code1 = code1.replace(
  /<div className="flex justify-between items-center mb-4">\s*<h2 className="text-xl font-bold">1. AVALÚO: Inspección Física<\/h2>\s*<button onClick=\{\(\) => setCurrentSection\(0\)\} className="px-4 py-1\.5 border border-gray-300 rounded hover:bg-gray-50 text-sm">Inicio<\/button>\s*<\/div>/,
  `<div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-3">
          <button onClick={() => setCurrentSection(0)} className="text-gray-500 hover:text-gray-700 p-2 rounded hover:bg-gray-100 transition-colors" title="Volver al Inicio">
            <Home size={20} />
          </button>
          <h2 className="text-xl font-bold">1. AVALÚO: Inspección Física</h2>
        </div>
      </div>`
);
fs.writeFileSync('src/components/Section1.tsx', code1);

// Section 2
let code2 = fs.readFileSync('src/components/Section2.tsx', 'utf8');
code2 = code2.replace(/import \{.*?\} from 'lucide-react';/, (match) => {
  if (!match.includes('Home')) return match.replace('{', '{ Home,');
  return match;
});
code2 = code2.replace(
  /<button \s*onClick=\{\(\) => setCurrentSection\(0\)\} \s*className="hover:bg-white\/20 p-2 rounded transition-colors"\s*>\s*<ArrowLeft size=\{24\} \/>\s*<\/button>/,
  `<button 
            onClick={() => setCurrentSection(0)} 
            className="hover:bg-white/20 p-2 rounded transition-colors"
            title="Volver al Inicio"
          >
            <Home size={20} />
          </button>`
);
fs.writeFileSync('src/components/Section2.tsx', code2);

// Section 3
let code3 = fs.readFileSync('src/components/Section3.tsx', 'utf8');
code3 = code3.replace(/import \{.*?\} from 'lucide-react';/, (match) => {
  if (!match.includes('Home')) return match.replace('{', '{ Home,');
  return match;
});
code3 = code3.replace(
  /<button onClick=\{\(\) => setCurrentSection\('home'\)\} className="bg-white\/20 hover:bg-white\/30 text-white p-2 rounded transition-colors" title="Volver al Inicio">\s*<ArrowLeft size=\{20\} \/>\s*<\/button>/,
  `<button onClick={() => setCurrentSection(0)} className="bg-white/20 hover:bg-white/30 text-white p-2 rounded transition-colors" title="Volver al Inicio">
            <Home size={20} />
          </button>`
);
// Make sure to also replace if it's already setCurrentSection(0) but has ArrowLeft
code3 = code3.replace(
  /<button onClick=\{\(\) => setCurrentSection\(0\)\} className="bg-white\/20 hover:bg-white\/30 text-white p-2 rounded transition-colors" title="Volver al Inicio">\s*<ArrowLeft size=\{20\} \/>\s*<\/button>/,
  `<button onClick={() => setCurrentSection(0)} className="bg-white/20 hover:bg-white/30 text-white p-2 rounded transition-colors" title="Volver al Inicio">
            <Home size={20} />
          </button>`
);
fs.writeFileSync('src/components/Section3.tsx', code3);

