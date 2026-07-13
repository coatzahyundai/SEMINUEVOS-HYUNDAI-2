const fs = require('fs');
let code = fs.readFileSync('src/components/UploadModal.tsx', 'utf8');

code = code.replace(
  /const \[uploading, setUploading\] = useState\(false\);/,
  `const [uploading, setUploading] = useState(false);\n  const isLocked = item.estatus === 'Poliza';`
);

code = code.replace(
  /<button\s*onClick=\{handleUpload\}\s*disabled=\{!selectedDocType \|\| !file \|\| uploading\}\s*className="px-4 py-2 bg-\[\#002c5f\] text-white rounded font-bold hover:bg-\[\#001a3a\] disabled:opacity-50 flex items-center"\s*>/,
  `<button 
            onClick={handleUpload}
            disabled={!selectedDocType || !file || uploading || isLocked}
            className="px-4 py-2 bg-[#002c5f] text-white rounded font-bold hover:bg-[#001a3a] disabled:opacity-50 flex items-center"
          >`
);

fs.writeFileSync('src/components/UploadModal.tsx', code);
