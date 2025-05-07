import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';                      // Tailwind + global styles
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import { Login } from './pages/Login.jsx';
import { Home } from './pages/Home.jsx';
import { Watch } from './pages/Watch.jsx';
import AdminPanel from './pages/AdminPanel.jsx';
import IPTVApp from './pages/IPTVApp.jsx';
import PrivateRoute from './components/PrivateRoute.jsx';  // 🔒 Protected routes

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,   // Layout (Navbar + Outlet)
    children: [
      { path: "/", element: <Home /> },
      { path: "/login", element: <Login /> },
      {
        path: "/admin",
        element: (
          <PrivateRoute>
            <AdminPanel />
          </PrivateRoute>
        ),
      },
      { path: "/watch/:id", element: <Watch /> },
      // Rutas protegidas para contenido de usuario
      {
        path: "/tv",
        element: (
          <PrivateRoute>
            <IPTVApp />
          </PrivateRoute>
        ),
      },
      {
        path: "/movies",
        element: (
          <PrivateRoute>
            <IPTVApp defaultTab="vod" />
          </PrivateRoute>
        ),
      },
      {
        path: "/series",
        element: (
          <PrivateRoute>
            <IPTVApp defaultTab="series" />
          </PrivateRoute>
        ),
      },
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
