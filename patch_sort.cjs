const fs = require('fs');
let code = fs.readFileSync('src/components/Section3.tsx', 'utf8');

code = code.replace(
  /return \(statusFilter === 'ALL' \|\| item\.estatus === statusFilter\);\s*\}\);/,
  `return (statusFilter === 'ALL' || item.estatus === statusFilter);
  }).sort((a, b) => {
    const parseDate = (d) => {
      if (!d) return 0;
      if (d.includes('T')) return new Date(d).getTime();
      if (d.includes('/')) {
        const parts = d.split('/');
        if (parts.length === 3) return new Date(\`\${parts[2]}-\${parts[1]}-\${parts[0]}T00:00:00\`).getTime();
      }
      return new Date(d).getTime() || 0;
    };
    return parseDate(b.fecha) - parseDate(a.fecha);
  });`
);

fs.writeFileSync('src/components/Section3.tsx', code);
