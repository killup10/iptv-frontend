// src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true); // <--- NUEVO ESTADO: true al inicio

  useEffect(() => {
    // Este efecto se ejecuta solo una vez al montar el AuthProvider
    console.log("AuthContext: Verificando sesión almacenada...");
    try {
      const storedUserString = localStorage.getItem("user");
      const token = localStorage.getItem("token");

      if (storedUserString && token) {
        const storedUser = JSON.parse(storedUserString);
        setUser({ ...storedUser, token });
        console.log("AuthContext: Sesión restaurada desde localStorage.", { ...storedUser, token });
      } else {
        console.log("AuthContext: No se encontró sesión almacenada.");
      }
    } catch (error) {
      console.error("AuthContext: Error al parsear datos de localStorage", error);
      // Limpiar localStorage si los datos están corruptos
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      setUser(null);
    } finally {
      setIsLoadingAuth(false); // <--- IMPORTANTE: Marcar como finalizada la carga/verificación inicial
      console.log("AuthContext: Verificación inicial de auth completada.");
    }
  }, []); // El array vacío [] asegura que se ejecute solo una vez al montar

  const login = (userData) => { // userData debe ser { username, role, token }
    if (!userData || !userData.token || !userData.username) {
      console.error("AuthContext: Intento de login con datos incompletos.", userData);
      return;
    }
    const userToStore = { username: userData.username, role: userData.role };
    localStorage.setItem("user", JSON.stringify(userToStore));
    localStorage.setItem("token", userData.token);
    setUser({ ...userToStore, token: userData.token }); // Guardar el objeto completo en el estado
    console.log("AuthContext: Usuario logueado:", { ...userToStore, token: userData.token });
  };

  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
    console.log("AuthContext: Usuario deslogueado.");
    // Opcional: podrías querer redirigir a /login aquí usando useNavigate,
    // pero es mejor manejar la redirección en el componente que llama a logout.
  };

  // El valor que se provee al contexto
  const contextValue = {
    user,
    login,
    logout,
    isLoadingAuth, // <--- Exponer el nuevo estado
    token: user?.token // <--- Exponer el token directamente por conveniencia
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {/* Renderiza children solo después de la carga inicial si prefieres,
          aunque ProtectedRoute ya maneja esto. */}
      {/* {isLoadingAuth ? <SpinnerGlobal/> : children} */}
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