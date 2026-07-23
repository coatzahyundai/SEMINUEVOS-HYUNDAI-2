const fs = require('fs');
let code = fs.readFileSync('src/components/Section3.tsx', 'utf8');

code = code.replace(
  "Home, Search, FileText, Upload, RefreshCw, Edit, FileDown, X, Save, Plus, Trash2, Calendar, ArrowLeft",
  "Home, Search, FileText, Upload, RefreshCw, Edit, FileDown, X, Save, Plus, Trash2, Calendar, ArrowLeft, Copy"
);

fs.writeFileSync('src/components/Section3.tsx', code);
