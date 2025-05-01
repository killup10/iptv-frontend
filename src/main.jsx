// src/main.jsx
// Este archivo arranca tu aplicación React Router + IPTVApp
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './utils/AuthContext.jsx';
import { PrivateRoute } from './utils/PrivateRoute.jsx';
import IPTVApp from './IPTVApp.jsx';
import { Login } from './pages/Login.jsx';
import { Register } from './pages/Register.jsx';

import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Rutas públicas */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Ruta principal IPTV, protegida */}
          <Route
            path="/*"
            element={
              <PrivateRoute>
                <IPTVApp />
              </PrivateRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>
);
