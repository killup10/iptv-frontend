// src/main.jsx
import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './utils/AuthContext.jsx';
import PrivateRoute from './utils/PrivateRoute';
import AdminRoute from './components/AdminRoute.jsx';

import { Login } from './pages/Login';
import { Register } from './pages/Register';
import Catalog from './pages/Catalogo';
import Player from './pages/Player';
import IPTVApp from './pages/IPTVApp';
import AdminPanel from './pages/AdminPanel';
import './index.css';

const container = document.getElementById('root');
const root = createRoot(container);

root.render(
  <AuthProvider>
    <Router>
      <Routes>
        {/* Rutas públicas */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Rutas protegidas */}
        <Route path="/" element={<PrivateRoute><Catalog /></PrivateRoute>} />
        <Route path="/movies" element={<PrivateRoute><Catalog type="movie"/></PrivateRoute>} />
        <Route path="/series" element={<PrivateRoute><Catalog type="series"/></PrivateRoute>} />
        <Route path="/player/:id" element={<PrivateRoute><Player/></PrivateRoute>} />
        <Route path="/iptv" element={<PrivateRoute><IPTVApp/></PrivateRoute>} />

        {/* Ruta /admin solo para admins */}
        <Route path="/admin" element={<AdminRoute><AdminPanel/></AdminRoute>} />

        {/* Fallback */}
        <Route path="*" element={<PrivateRoute><Catalog/></PrivateRoute>} />
      </Routes>
    </Router>
  </AuthProvider>
);
