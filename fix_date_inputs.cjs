const fs = require('fs');
let trackingCode = fs.readFileSync('src/components/TrackingModal.tsx', 'utf8');

const formatToInput = `const formatToInput = (dateString?: string) => {
    if (!dateString) return '';
    if (dateString.includes('T')) return dateString.split('T')[0];
    if (dateString.includes('/')) {
      const parts = dateString.split('/');
      if (parts.length === 3) return \`\${parts[2]}-\${parts[1]}-\${parts[0]}\`;
    }
    return dateString;
  };`;

trackingCode = trackingCode.replace(
  /const formatToInput = \([\s\S]*?return dateString;\n\s*\};/,
  formatToInput
);
fs.writeFileSync('src/components/TrackingModal.tsx', trackingCode);

let valCode = fs.readFileSync('src/components/ValuationModal.tsx', 'utf8');
valCode = valCode.replace(
  /const formatToInput = \([\s\S]*?return dateString;\n\s*\};/,
  formatToInput
);

valCode = valCode.replace(
  /fetchAPI\('save_valuation', \{ vin: item\.vin, data: data \}\)/,
  `fetchAPI('save_valuation', { vin: item.vin, data: { ...data, fecha_avaluo: data.fecha_avaluo ? data.fecha_avaluo.split('-').reverse().join('/') : '' } })`
);
fs.writeFileSync('src/components/ValuationModal.tsx', valCode);

let trackCode = fs.readFileSync('src/components/TrackingModal.tsx', 'utf8');
trackCode = trackCode.replace(
  /const payload = \{ \.\.\.item, \.\.\.data \};/,
  `const formattedData = { ...data };
      Object.keys(formattedData).forEach(key => {
        if (formattedData[key] && typeof formattedData[key] === 'string' && formattedData[key].includes('-')) {
           formattedData[key] = formattedData[key].split('-').reverse().join('/');
        }
      });
      const payload = { ...item, ...formattedData };`
);
fs.writeFileSync('src/components/TrackingModal.tsx', trackCode);
