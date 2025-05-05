import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";

export const PrivateRoute = ({ children }) => {
  const { user } = useAuth();
  const location = useLocation();

  // Verificación más robusta - comprueba específicamente el token
  if (!user || !user.token) {
    // Guarda la ruta actual para redirigir después del inicio de sesión
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // Verifica si el token ha expirado (opcional, si tus tokens tienen una fecha de expiración)
  /* 
  const isTokenExpired = () => {
    try {
      // Si usas JWT, podrías decodificar el token y verificar exp
      const tokenData = JSON.parse(atob(user.token.split('.')[1]));
      return tokenData.exp * 1000 < Date.now();
    } catch (error) {
      return true; // Si hay algún error, mejor redirigir al login
    }
  };

  if (isTokenExpired()) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }
  */

  return children;
};