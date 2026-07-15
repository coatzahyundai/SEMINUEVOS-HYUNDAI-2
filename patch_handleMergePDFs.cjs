const fs = require('fs');
let code = fs.readFileSync('src/components/Section3.tsx', 'utf8');

const regex = /const mergedPdfBytes = await mergedPdf\.save\(\);/g;
const replacement = `
        if (mergedPdf.getPageCount() === 0) {
          throw new Error('Ninguno de los archivos pudo ser procesado o no hay contenido para combinar.');
        }
        const mergedPdfBytes = await mergedPdf.save();`;

code = code.replace(regex, replacement);

const loadRegex = /const pdf = await PDFDocument\.load\(bytes\);/g;
code = code.replace(loadRegex, "const pdf = await PDFDocument.load(bytes, { ignoreEncryption: true });");

fs.writeFileSync('src/components/Section3.tsx', code);
