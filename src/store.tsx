import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { User, CloudData } from "./types";

export const GAS_URL =
  "https://script.google.com/macros/s/AKfycbyROWom_Xl04iWJP7qU5niG_pobp7pIS3Fv9B4K2i_UwD-IabfxU264v32CkcrE_aplHQ/exec";

export const fetchAPI = async (action: string, payload: any = {}) => {
  try {
    const response = await fetch(GAS_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain" },
      body: JSON.stringify({ action, ...payload }),
    });

    const text = await response.text();
    try {
      return JSON.parse(text);
    } catch (e) {
      console.error(
        "El servidor devolvió una respuesta no válida (no es JSON):",
        text,
      );
      return {
        status: "error",
        message:
          "Respuesta no válida del servidor. Verifique que la URL de Google Apps Script esté publicada como Aplicación Web con acceso para 'Cualquier persona'.",
      };
    }
  } catch (error) {
    console.error("Error de red al conectar con Google Apps Script:", error);
    return {
      status: "error",
      message: "Error de red al contactar con el servidor.",
    };
  }
};

interface AppContextType {
  user: User | null;
  setUser: (u: User | null) => void;
  baseUsuarios: any[];
  setBaseUsuarios: (users: any[]) => void;
  cloudData: CloudData | null;
  setCloudData: (data: CloudData) => void;
  currentSection: number;
  setCurrentSection: (section: number) => void;
  refreshCloudData: () => Promise<any>;
  cloudStatus: string;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [baseUsuarios, setBaseUsuarios] = useState<any[]>([]);
  const [cloudData, setCloudData] = useState<CloudData | null>(null);
  const [currentSection, setCurrentSection] = useState<number>(0);
  const [cloudStatus, setCloudStatus] = useState<string>(
    "Sincronizando información de la nube...",
  );

  const refreshCloudData = async () => {
    try {
      setCloudStatus("Sincronizando información de la nube...");
      const res = await fetchAPI("get_cloud_data");
      if (res.status === "success" && res.data) {
        setCloudData({
          dbInventario: res.data.dbInventario || {},
          rawCitasExcel: res.data.rawCitasExcel || [],
          nameCitas: res.data.nameCitas || "Base Nube",
          pdfPass: res.data.pdfPass || "",
        });

        if (res.data.usuarios) {
          const matriz = res.data.usuarios;
          if (matriz.length > 1) {
            const headers = matriz[0];
            let objectsTemp = [];
            for (let i = 1; i < matriz.length; i++) {
              let obj: any = {};
              for (let j = 0; j < headers.length; j++) {
                obj[headers[j]] = matriz[i][j];
              }
              objectsTemp.push(obj);
            }
            setBaseUsuarios(objectsTemp);
          }
        }
        setCloudStatus("Panel de Seminuevos y Servicio (Listo)");
        return { success: true };
      } else {
        const errorMsg = res.message || "Datos incorrectos de la nube.";
        throw new Error(errorMsg);
      }
    } catch (e: any) {
      setCloudStatus("Error de conexión");
      console.error(e);
      return { success: false, message: e.message };
    }
  };

  useEffect(() => {
    refreshCloudData();
  }, []);

  return (
    <AppContext.Provider
      value={{
        user,
        setUser,
        baseUsuarios,
        setBaseUsuarios,
        cloudData,
        setCloudData,
        currentSection,
        setCurrentSection,
        refreshCloudData,
        cloudStatus,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context)
    throw new Error("useAppContext must be used within AppProvider");
  return context;
};
