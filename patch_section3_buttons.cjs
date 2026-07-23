const fs = require('fs');
let code = fs.readFileSync('src/components/Section3.tsx', 'utf8');

code = code.replace(
  '<FileDown size={16} />\n                          </button>}',
  `<FileDown size={16} />
                          </button>}
                          {(user.role === 'servicio' || user.role === 'gerencia') && <button 
                            onClick={() => copyAvaluoEmail(item)}
                            className="p-1.5 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded transition-colors disabled:opacity-30"
                            title="Copiar Avalúo para Correo"
                          >
                            <Copy size={16} />
                          </button>}`
);

code = code.replace(
  '<FileDown size={16} />\n                          </button>}\n                        \n                        {user.role === \'gerencia\' && (',
  `<FileDown size={16} />
                          </button>}
                          {(user.role === 'asesor' || user.role === 'gerencia') && <button 
                            onClick={() => copyTomaEmail(item)}
                            className="p-1.5 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded transition-colors disabled:opacity-30"
                            title="Copiar Toma para Correo"
                          >
                            <Copy size={16} />
                          </button>}
                        
                        {user.role === 'gerencia' && (`
);

fs.writeFileSync('src/components/Section3.tsx', code);
