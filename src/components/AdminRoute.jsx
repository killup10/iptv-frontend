// src/components/AdminRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext.jsx'; // Usando alias

// Ya no se importa ni se instancia UploadManual aquí

const AdminRoute = ({ children }) => {
  const { user, isLoadingAuth } = useAuth();

  if (isLoadingAuth) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-black">
        <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    // Si no es admin, redirigir a la página de inicio o a una página de "no autorizado"
    return <Navigate to="/" replace />;
  }

  // Si es admin y la autenticación ha cargado, renderizar el contenido protegido
  return children;
};

export default AdminRoute;
