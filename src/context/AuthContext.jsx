// src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from "react";
// Asume que tienes estas funciones definidas en tu api.js
// import { loginUser as apiLoginUser, registerUser as apiRegisterUser } from '../utils/api'; 

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true); // Para saber si se está verificando la sesión inicial

  useEffect(() => {
    console.log("AuthContext: Verificando sesión almacenada...");
    try {
      const storedUserString = localStorage.getItem("user");
      const token = localStorage.getItem("token");

      if (storedUserString && token) {
        const storedUser = JSON.parse(storedUserString);
        // Reconstruye el estado del usuario asegurando que todos los campos necesarios estén presentes
        setUser({
          username: storedUser.username,
          role: storedUser.role,
          plan: storedUser.plan, // Asegúrate que el plan se carga
          token: token // Añade el token al estado del usuario
        });
        console.log("AuthContext: Sesión restaurada desde localStorage.", { user: storedUser, tokenLoaded: !!token });
      } else {
        console.log("AuthContext: No se encontró sesión almacenada.");
        setUser(null); 
      }
    } catch (error) {
      console.error("AuthContext: Error al parsear datos de localStorage o token inválido", error);
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      setUser(null);
    } finally {
      setIsLoadingAuth(false);
      console.log("AuthContext: Verificación inicial de auth completada.");
    }
  }, []);

  // userDataFromBackend se espera que sea { token: "...", user: { username: "...", role: "...", plan: "..." } }
  // tal como lo devuelve tu backend en /api/auth/login
  const login = (userDataFromBackend) => {
    console.log("AuthContext: login() llamado con:", userDataFromBackend); 
    
    if (
      !userDataFromBackend ||
      !userDataFromBackend.token ||
      !userDataFromBackend.user ||
      !userDataFromBackend.user.username ||
      typeof userDataFromBackend.user.role === 'undefined' ||
      typeof userDataFromBackend.user.plan === 'undefined' // Verificación explícita para plan
    ) {
      console.error(
        "AuthContext: Intento de login con datos incompletos. Se esperaba {token, user:{username,role,plan}}", 
        userDataFromBackend
      );
      // Podrías lanzar un error o manejarlo de otra forma
      return Promise.reject(new Error("Datos de login incompletos desde el backend."));
    }

    const userToStoreInLocalStorage = { // Solo la parte 'user' del backend
      username: userDataFromBackend.user.username,
      role: userDataFromBackend.user.role,
      plan: userDataFromBackend.user.plan 
    };

    localStorage.setItem("user", JSON.stringify(userToStoreInLocalStorage));
    localStorage.setItem("token", userDataFromBackend.token);

    const userForState = { // El objeto completo para el estado, incluyendo el token
      ...userToStoreInLocalStorage,
      token: userDataFromBackend.token
    };
    setUser(userForState);
    console.log("AuthContext: Usuario logueado y estado establecido:", userForState);
    return Promise.resolve(userForState); // Devuelve el usuario para posible encadenamiento
  };

  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
    console.log("AuthContext: Usuario deslogueado.");
    // Opcional: Redirigir al login
    // window.location.href = '/login'; 
  };

  const contextValue = {
    user, // user ahora contendrá { username, role, plan, token } o null
    login,
    logout,
    // register, // Si tienes una función de registro, inclúyela aquí
    isLoadingAuth,
    isAuthenticated: !!user && !!user.token, // Una forma más robusta de verificar autenticación
    token: user?.token // Acceso directo al token si es necesario fuera del contexto
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