const fs = require('fs');
let code = fs.readFileSync('src/components/Section3.tsx', 'utf8');

const regex = /const reader = new FileReader\(\);\n\s*reader\.onload = async \(evt\) => \{[\s\S]*?reader\.readAsDataURL\(file\);/m;

const replacement = `const compressImage = (file: File): Promise<string> => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            let width = img.width;
            let height = img.height;
            const MAX_SIZE = 1200;
            if (width > height && width > MAX_SIZE) {
              height *= MAX_SIZE / width;
              width = MAX_SIZE;
            } else if (height > MAX_SIZE) {
              width *= MAX_SIZE / height;
              height = MAX_SIZE;
            }
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx?.drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL('image/jpeg', 0.7).split(',')[1]);
          };
          img.onerror = reject;
          img.src = event.target?.result as string;
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    };

    if (file.type.startsWith('image/')) {
      try {
        const base64Data = await compressImage(file);
        const res = await fetchAPI('upload_file', {
          vin: selectedItem.vin,
          docType: selectedDocType,
          fileName: file.name,
          mimeType: 'image/jpeg',
          fileData: base64Data,
          folderName: \`\${selectedItem.cliente} - \${selectedItem.asesor || user?.name}\`
        });
        if (res.status === 'success') {
          setCustomAlert({ message: 'Documento subido correctamente a Google Drive.' });
          const folderName = \`\${selectedItem.cliente} - \${selectedItem.asesor || user?.name}\`;
          fetchAPI('get_files_for_vin', { vin: selectedItem.vin, folderName }).then(r => {
            if (r.status === 'success') setLoadedFiles(r.data || []);
          });
        } else {
          setCustomAlert({ message: 'Error: ' + res.message });
        }
      } catch (e) {
        setCustomAlert({ message: 'Error al subir la imagen.' });
      }
    } else {
      const reader = new FileReader();
      reader.onload = async (evt) => {
        const base64Data = (evt.target?.result as string).split(',')[1];
        try {
          const res = await fetchAPI('upload_file', {
            vin: selectedItem.vin,
            docType: selectedDocType,
            fileName: file.name,
            mimeType: file.type,
            fileData: base64Data,
            folderName: \`\${selectedItem.cliente} - \${selectedItem.asesor || user?.name}\`
          });
          if (res.status === 'success') {
            setCustomAlert({ message: 'Documento subido correctamente a Google Drive.' });
            const folderName = \`\${selectedItem.cliente} - \${selectedItem.asesor || user?.name}\`;
            fetchAPI('get_files_for_vin', { vin: selectedItem.vin, folderName }).then(r => {
              if (r.status === 'success') setLoadedFiles(r.data || []);
            });
          } else {
            setCustomAlert({ message: 'Error: ' + res.message });
          }
        } catch (e) {
          setCustomAlert({ message: 'Error de conexión.' });
        }
      };
      reader.readAsDataURL(file);
    }
    setUploading(false);
    setSelectedFileName('');
    setSelectedDocType('');
    if (fileInputRef.current) fileInputRef.current.value = '';`;

code = code.replace(regex, replacement);
fs.writeFileSync('src/components/Section3.tsx', code);
