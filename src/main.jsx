import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './utils/AuthContext.jsx';
import { PrivateRoute } from './utils/PrivateRoute.jsx';
import AdminRoute from './components/AdminRoute.jsx';

import { Login } from './pages/Login.jsx';
import { Register } from './pages/Register.jsx';
import { Catalogo } from './pages/Catalogo.jsx';
import { Player } from './pages/Player.jsx';
import IPTVApp      from './IPTVApp.jsx';
import AdminPanel from './pages/AdminPanel.jsx';
import './index.css';

const container = document.getElementById('root');
const root = createRoot(container);

root.render(
  <AuthProvider>
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/"       element={<PrivateRoute><Catalogo /></PrivateRoute>} />
        <Route path="/movies" element={<PrivateRoute><Catalogo type="movie" /></PrivateRoute>} />
        <Route path="/series" element={<PrivateRoute><Catalogo type="series" /></PrivateRoute>} />
        <Route path="/player/:id" element={<PrivateRoute><Player /></PrivateRoute>} />
        <Route path="/iptv" element={<PrivateRoute><IPTVApp /></PrivateRoute>} />

        <Route path="/admin"  element={<AdminRoute><AdminPanel /></AdminRoute>} />
        <Route path="*"       element={<PrivateRoute><Catalogo /></PrivateRoute>} />
      </Routes>
    </Router>
  </AuthProvider>
);