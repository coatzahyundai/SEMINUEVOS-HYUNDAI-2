const fs = require('fs');
let code = fs.readFileSync('src/components/Section3.tsx', 'utf8');

const target = `doc.text(\`Subtotal General: \${sub.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}\`, 140, startY);
        doc.text(\`I.V.A (16%): \${iva.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}\`, 140, startY + 5);
        doc.setFont("helvetica", "bold");
        doc.text(\`Gran Total: \${(valData.gran_total || 0).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}\`, 140, startY + 10);`;

const replacement = `doc.setFont("helvetica", "normal");
        doc.text("Subtotal General:", 140, startY);
        doc.text(\`\${sub.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}\`, 196, startY, { align: 'right' });
        doc.text("I.V.A (16%):", 140, startY + 5);
        doc.text(\`\${iva.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}\`, 196, startY + 5, { align: 'right' });
        doc.setFont("helvetica", "bold");
        doc.text("Gran Total:", 140, startY + 10);
        doc.text(\`\${(valData.gran_total || 0).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}\`, 196, startY + 10, { align: 'right' });`;

code = code.replace(target, replacement);
fs.writeFileSync('src/components/Section3.tsx', code);
