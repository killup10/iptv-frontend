// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import AppLayout from './App.jsx';
import './index.css';
// Cambiamos createBrowserRouter por createHashRouter para Electron
import { createHashRouter, RouterProvider } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';

// Importar Páginas
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
// import Register from './pages/Register.jsx'; // Si tienes registro
import AdminPanel from './pages/AdminPanel.jsx';
import Watch from './pages/Watch.jsx'; // Página de reproducción
import LiveTVPage from './pages/LiveTVPage.jsx';
import MoviesPage from './pages/MoviesPage.jsx';
import SeriesPage from './pages/SeriesPage.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
// import NotFoundPage from './pages/NotFoundPage.jsx'; // Descomenta si tienes una página 404 personalizada

// Usamos createHashRouter en lugar de createBrowserRouter
// Esto es más adecuado para aplicaciones Electron cargadas con file://
// ya que no requiere configuración del lado del servidor para manejar rutas.
const router = createHashRouter([
  {
    path: "/", // En HashRouter, esto se traduce a la ruta base (ej. index.html#/)
    element: <AppLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: "login", element: <Login /> },
      // { path: "register", element: <Register /> },
      {
        path: "admin",
        element: (
          <ProtectedRoute adminOnly={true}>
            <AdminPanel />
          </ProtectedRoute>
        ),
      },
      {
        path: "watch/:itemType/:itemId",
        element: (
          <ProtectedRoute>
            <Watch />
          </ProtectedRoute>
        ),
      },
      {
        path: "tv",
        element: (
          <ProtectedRoute>
            <LiveTVPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "movies",
        element: (
          <ProtectedRoute>
            <MoviesPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "series",
        element: (
          <ProtectedRoute>
            <SeriesPage />
          </ProtectedRoute>
        ),
      },
      // Ruta catch-all para 404 (opcional, pero recomendada)
      // Asegúrate de que esta sea la última ruta dentro de los children de AppLayout
      // { path: "*", element: <NotFoundPage /> }, // Descomenta si tienes NotFoundPage
    ],
  },
  // Puedes tener otras rutas de nivel superior aquí si es necesario,
  // aunque generalmente con AppLayout como raíz es suficiente.
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </React.StrictMode>
);
