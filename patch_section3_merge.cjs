const fs = require('fs');
let code = fs.readFileSync('src/components/Section3.tsx', 'utf8');

code = code.replace(
  /import \{ jsPDF \} from 'jspdf';/,
  `import { jsPDF } from 'jspdf';
import { PDFDocument } from 'pdf-lib';`
);

code = code.replace(
  /const \[loadingFiles, setLoadingFiles\] = useState\(false\);/,
  `const [loadingFiles, setLoadingFiles] = useState(false);
  const [mergingFiles, setMergingFiles] = useState(false);`
);

const mergeFunction = `
  const handleMergePDFs = async () => {
    if (!selectedItem) return;
    try {
      setMergingFiles(true);
      const res = await fetchAPI('getAllFilesBase64', { vin: selectedItem.vin });
      if (res.status === 'success' && res.data && res.data.length > 0) {
        const mergedPdf = await PDFDocument.create();
        for (const file of res.data) {
          try {
            const byteString = atob(file.base64);
            const bytes = new Uint8Array(byteString.length);
            for (let i = 0; i < byteString.length; i++) {
              bytes[i] = byteString.charCodeAt(i);
            }
            if (file.mimeType === 'application/pdf') {
              const pdf = await PDFDocument.load(bytes);
              const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
              copiedPages.forEach((page) => mergedPdf.addPage(page));
            } else if (file.mimeType.startsWith('image/')) {
              let image;
              if (file.mimeType === 'image/jpeg') {
                image = await mergedPdf.embedJpg(bytes);
              } else if (file.mimeType === 'image/png') {
                image = await mergedPdf.embedPng(bytes);
              }
              if (image) {
                const dims = image.scale(1);
                const page = mergedPdf.addPage([dims.width, dims.height]);
                page.drawImage(image, {
                  x: 0,
                  y: 0,
                  width: dims.width,
                  height: dims.height,
                });
              }
            }
          } catch(e) {
            console.error("Could not add file to merge", e);
          }
        }
        const mergedPdfBytes = await mergedPdf.save();
        const blob = new Blob([mergedPdfBytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = \`Expediente_\${selectedItem.vin}.pdf\`;
        link.click();
        URL.revokeObjectURL(url);
      } else {
        setCustomAlert({ message: 'No hay archivos válidos para combinar o ocurrió un error.' });
      }
    } catch (e: any) {
      setCustomAlert({ message: 'Error al combinar archivos: ' + e.message });
    } finally {
      setMergingFiles(false);
    }
  };
`;

code = code.replace(
  /const fetchFiles = async \(item: InventoryItem\) => \{/,
  mergeFunction + '\n  const fetchFiles = async (item: InventoryItem) => {'
);

code = code.replace(
  /<button onClick=\{\(\) => fetchFiles\(selectedItem!\)\} className="text-gray-400 hover:text-\[\#00aad2\]">\s*<RefreshCw size=\{16\} className=\{loadingFiles \? "animate-spin" : ""\} \/>\s*<\/button>/,
  `<div className="flex gap-2">
                            <button disabled={mergingFiles} onClick={handleMergePDFs} className="flex items-center gap-1 bg-[#1e8449] hover:bg-[#166534] text-white px-2 py-1 rounded text-xs font-bold transition-colors disabled:opacity-50">
                              {mergingFiles ? <RefreshCw size={14} className="animate-spin" /> : <FileDown size={14} />} Combinar PDF
                            </button>
                            <button onClick={() => fetchFiles(selectedItem!)} className="text-gray-400 hover:text-[#00aad2] p-1">
                              <RefreshCw size={16} className={loadingFiles ? "animate-spin" : ""} />
                            </button>
                          </div>`
);

fs.writeFileSync('src/components/Section3.tsx', code);
