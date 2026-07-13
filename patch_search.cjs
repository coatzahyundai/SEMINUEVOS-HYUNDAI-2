const fs = require('fs');
let code = fs.readFileSync('src/components/Section3.tsx', 'utf8');

code = code.replace(
  /const filteredInventory = inventory\.filter\(item =>\s*\(statusFilter === 'ALL' \|\| item\.estatus === statusFilter\) &&\s*\(\(item\.cliente \|\| ''\)\.toLowerCase\(\)\.includes\(search\.toLowerCase\(\)\) \|\|\s*\(item\.vin \|\| ''\)\.toLowerCase\(\)\.includes\(search\.toLowerCase\(\)\) \|\|\s*\(item\.marca \|\| ''\)\.toLowerCase\(\)\.includes\(search\.toLowerCase\(\)\)\)\s*\);/,
  `const filteredInventory = inventory.filter(item => {
    const matchesSearch = ((item.cliente || '').toLowerCase().includes(search.toLowerCase()) || 
     (item.vin || '').toLowerCase().includes(search.toLowerCase()) || 
     (item.marca || '').toLowerCase().includes(search.toLowerCase()));
    
    if (search.length > 0) {
      return matchesSearch; // If searching, ignore status filter and search everything
    }
    return (statusFilter === 'ALL' || item.estatus === statusFilter);
  });`
);

fs.writeFileSync('src/components/Section3.tsx', code);
