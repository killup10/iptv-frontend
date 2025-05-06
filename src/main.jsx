import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { AuthProvider } from './utils/AuthContext.jsx'
import { Login } from './pages/Login.jsx'
import { Home } from './pages/Home.jsx'
import { Watch } from './pages/Watch.jsx'
import AdminPanel from './pages/AdminPanel.jsx'
import IPTVApp from './IPTVApp.jsx'

// Crear el router con todas las rutas necesarias
const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "/",
        element: <Home />,
      },
      {
        path: "/login",
        element: <Login />,
      },
      {
        path: "/admin",
        element: <AdminPanel />,
      },
      {
        path: "/watch/:id",
        element: <Watch />,
      },
      {
        path: "/tv",
        element: <IPTVApp />,
      },
      {
        path: "/movies",
        element: <IPTVApp defaultTab="vod" />,
      },
      {
        path: "/series",
        element: <IPTVApp defaultTab="series" />,
      }
    ]
  }
])

// Añadir estilos globales para el tema Netflix
const globalStyles = `
  body {
    background-color: #000;
    color: #fff;
    font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
  }
  
  /* Ocultar scrollbar pero mantener funcionalidad */
  .hide-scrollbar::-webkit-scrollbar {
    display: none;
  }
  .hide-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
`;

// Inyectar estilos globales
const styleElement = document.createElement('style');
styleElement.innerHTML = globalStyles;
document.head.appendChild(styleElement);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </React.StrictMode>,
)