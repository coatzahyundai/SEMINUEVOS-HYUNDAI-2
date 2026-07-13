import React, { useState } from 'react';
import { useAppContext } from '../store';
import { Lock } from 'lucide-react';

export default function Login() {
  const { baseUsuarios, setUser, refreshCloudData } = useAppContext();
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!pin) {
      alert("Por favor ingrese su PIN de acceso.");
      return;
    }

    let usuarios = baseUsuarios;

    if (usuarios.length === 0) {
      setLoading(true);
      const res = await refreshCloudData();
      setLoading(false);
      
      if (!res?.success) {
        alert("Error al conectar con la Nube de Google:\n\n" + (res?.message || "Revise la URL y permisos del App Script."));
        return;
      }
      
      // Si fue exitoso pero no ha actualizado el estado local en este render,
      // pedimos al usuario que intente de nuevo.
      alert("Sincronización exitosa con la matriz. Por favor, de clic en Iniciar Sesión nuevamente.");
      return;
    }

    const matchedUser = usuarios.find(u => {
      const uPass = u.Contraseña || u.contraseña || u.pin || u.password || (Array.isArray(u) ? u[0] : "");
      return String(uPass).trim().toUpperCase() === String(pin).trim().toUpperCase();
    });

    if (matchedUser) {
      const name = matchedUser.Nombre_Asesor || matchedUser.nombre_asesor || matchedUser.name || matchedUser.nombre || "Usuario";
      const role = matchedUser.Nivel || matchedUser.nivel || matchedUser.role || matchedUser.rol || "asesor";
      
      setUser({
        name,
        role: String(role).trim().toLowerCase(),
        original: matchedUser
      });
    } else {
      alert("PIN incorrecto o no autorizado.");
    }
  };

  return (
    <div className="fixed inset-0 bg-[#f4f6f9] z-50 flex justify-center items-center">
      <div className="max-w-[350px] w-full bg-white p-8 rounded-lg shadow-[0_15px_40px_rgba(0,44,95,0.15)] border-t-[8px] border-[#002c5f] text-center">
        <h1 className="text-[#002c5f] text-xl font-bold mb-1">HYUNDAI COATZACOALCOS</h1>
        <p className="text-[#00aad2] text-[13px] mb-6 font-bold">Acceso Restringido - Inicie Sesión</p>
        
        <div className="relative">
          <input 
            type="password" 
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            placeholder="Ingrese su PIN (Contraseña)" 
            className="w-full p-3 mb-4 border border-gray-300 rounded focus:outline-none focus:border-[#00aad2] text-center"
          />
        </div>
        
        <button 
          onClick={handleLogin}
          className="w-full bg-[#002c5f] text-white font-bold py-3 rounded hover:bg-[#001a3a] transition-colors"
        >
          Ingresar al Sistema
        </button>

        {loading && (
          <div className="text-[11px] mt-3 text-[#f39c12]">Autenticando usuarios con la nube...</div>
        )}
      </div>
    </div>
  );
}
