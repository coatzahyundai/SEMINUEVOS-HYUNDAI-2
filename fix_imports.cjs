const fs = require('fs');

let code1 = fs.readFileSync('src/components/Section1.tsx', 'utf8');
code1 = code1.replace(/import React.*?;\n/, "import React, { useState, useMemo } from 'react';\nimport { Home } from 'lucide-react';\n");
fs.writeFileSync('src/components/Section1.tsx', code1);

let code2 = fs.readFileSync('src/components/Section2.tsx', 'utf8');
code2 = code2.replace(/import React.*?;\n/, "import React, { useState } from 'react';\nimport { Home, ArrowLeft } from 'lucide-react';\n");
fs.writeFileSync('src/components/Section2.tsx', code2);

