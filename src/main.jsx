// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import AppLayout from './App.jsx'; // Renombramos App.jsx a AppLayout.jsx o lo dejamos como App.jsx si prefieres
import './index.css';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';

// Importar Páginas
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
// import Register from './pages/Register.jsx'; // Si tienes registro
import AdminPanel from './pages/AdminPanel.jsx';
import Watch from './pages/Watch.jsx'; // Página de reproducción
import LiveTVPage from './pages/LiveTVPage.jsx'; // Nueva página para TV
import MoviesPage from './pages/MoviesPage.jsx'; // Nueva página para Películas
import SeriesPage from './pages/SeriesPage.jsx'; // Nueva página para Series
import ProtectedRoute from './components/ProtectedRoute.jsx'; // Asumiendo que tienes este componente

const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />, // AppLayout es tu App.jsx actual que contiene Header, Footer y Outlet
    children: [
      { index: true, element: <Home /> }, // HomePage será pública y mostrará contenido destacado
      { path: "login", element: <Login /> },
      // { path: "register", element: <Register /> },
      {
        path: "admin",
        element: (
          <ProtectedRoute adminOnly={true}> {/* Asumiendo que ProtectedRoute puede verificar roles */}
            <AdminPanel />
          </ProtectedRoute>
        ),
      },
      {
        path: "watch/:itemType/:itemId", // Ruta más descriptiva para la reproducción
        element: (
          <ProtectedRoute>
            <Watch/>
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
      // Podrías añadir una ruta catch-all para 404 si quieres
      // { path: "*", element: <NotFoundPage /> },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </React.StrictMode>
);