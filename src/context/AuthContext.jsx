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
        // Asegúrate que el 'role' también se cargue desde localStorage
        setUser({ 
            username: storedUser.username, 
            role: storedUser.role, // <--- IMPORTANTE AL CARGAR
            token 
        });
        console.log("AuthContext: Sesión restaurada desde localStorage.", { username: storedUser.username, role: storedUser.role, token });
      } else {
        console.log("AuthContext: No se encontró sesión almacenada.");
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

  const login = (userDataFromBackend) => { // userDataFromBackend es { token, user: { username, role } }
    if (!userDataFromBackend || !userDataFromBackend.token || !userDataFromBackend.user || !userDataFromBackend.user.username || typeof userDataFromBackend.user.role === 'undefined') {
      console.error("AuthContext: Intento de login con datos incompletos desde el backend.", userDataFromBackend);
      // Podrías lanzar un error o establecer un estado de error aquí
      return;
    }
    
    const userToStoreInStateAndLocalStorage = { 
        username: userDataFromBackend.user.username, 
        role: userDataFromBackend.user.role // <--- Asegúrate que el rol viene del backend
    };

    localStorage.setItem("user", JSON.stringify(userToStoreInStateAndLocalStorage)); // Solo username y role
    localStorage.setItem("token", userDataFromBackend.token);
    
    setUser({ ...userToStoreInStateAndLocalStorage, token: userDataFromBackend.token });
    console.log("AuthContext: Usuario logueado y estado establecido:", { ...userToStoreInStateAndLocalStorage, token: userDataFromBackend.token });
  };

  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
    console.log("AuthContext: Usuario deslogueado.");
  };

  const contextValue = {
    user,
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