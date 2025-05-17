// iptv-frontend/src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  useEffect(() => {
    console.log("AuthContext: Verificando sesión almacenada...");
    try {
      const storedUserString = localStorage.getItem("user");
      const token = localStorage.getItem("token");

      if (storedUserString && token) {
        const storedUser = JSON.parse(storedUserString);
        // Asegúrate que todos los campos necesarios del usuario se carguen desde localStorage
        setUser({
          username: storedUser.username,
          role: storedUser.role,
          plan: storedUser.plan, // <--- CORRECCIÓN: Cargar plan desde localStorage
          token
        });
        console.log("AuthContext: Sesión restaurada desde localStorage.", {
          username: storedUser.username,
          role: storedUser.role,
          plan: storedUser.plan, // <--- CORRECCIÓN: Incluir plan en el log
          tokenLoaded: !!token
        });
      } else {
        console.log("AuthContext: No se encontró sesión almacenada.");
        setUser(null); // Asegurar que user sea null si no hay sesión
      }
    } catch (error) {
      console.error("AuthContext: Error al parsear datos de localStorage", error);
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      setUser(null);
    } finally {
      setIsLoadingAuth(false);
      console.log("AuthContext: Verificación inicial de auth completada. isLoadingAuth:", false);
    }
  }, []);

  // userDataFromBackend ahora se espera que sea { token: "...", user: { username: "...", role: "...", plan: "..." } }
  const login = (userDataFromBackend) => {
    console.log("AuthContext: login() llamado con:", userDataFromBackend); 
    if (
      !userDataFromBackend ||
      !userDataFromBackend.token ||
      !userDataFromBackend.user ||
      !userDataFromBackend.user.username ||
      typeof userDataFromBackend.user.role === 'undefined' ||
      typeof userDataFromBackend.user.plan === 'undefined' // <--- CORRECCIÓN: Añadida verificación para PLAN
    ) {
      console.error("AuthContext: Intento de login con datos incompletos desde el backend. Se esperaba {token, user:{username,role,plan}}", userDataFromBackend);
      return; 
    }

    const userToStoreInStateAndLocalStorage = {
      username: userDataFromBackend.user.username,
      role: userDataFromBackend.user.role,
      plan: userDataFromBackend.user.plan // <--- CORRECCIÓN: Almacenar PLAN
    };

    localStorage.setItem("user", JSON.stringify(userToStoreInStateAndLocalStorage));
    localStorage.setItem("token", userDataFromBackend.token);

    const userForState = { // Objeto que se pasará a setUser
      username: userToStoreInStateAndLocalStorage.username,
      role: userToStoreInStateAndLocalStorage.role,
      plan: userToStoreInStateAndLocalStorage.plan, // <--- CORRECCIÓN: Incluir PLAN
      token: userDataFromBackend.token
    };
    setUser(userForState); // <--- Aquí se establece el estado
    console.log("AuthContext: Usuario logueado y estado establecido:", userForState); // Este log debería ahora mostrar 'plan'
  };

  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
    console.log("AuthContext: Usuario deslogueado.");
  };

  const contextValue = {
    user, // user ahora contendrá { username, role, plan, token }
    login,
    logout,
    isLoadingAuth,
    token: user?.token 
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth debe ser usado dentro de un AuthProvider");
  }
  return context;
}