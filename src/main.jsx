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
import IPTVApp from './IPTVApp.jsx' // Añadido

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
        path: "/tv", // Nueva ruta para IPTV/canales
        element: <IPTVApp />,
      }
    ]
  }
])

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </React.StrictMode>,
)