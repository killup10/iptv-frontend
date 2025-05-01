import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './utils/AuthContext';
import { PrivateRoute } from './utils/PrivateRoute';
import './index.css';

import { Home } from './pages/Home';
import { Movies } from './pages/Movies';
import { Series } from './pages/Series';
import { Player } from './pages/Player';
import { Login } from './pages/Login';
import { Register } from './pages/Register';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Rutas públicas */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Rutas privadas (protegidas) */}
          <Route path="/" element={<App />}>
            <Route index element={<Home />} />
            <Route path="movies" element={<PrivateRoute><Movies /></PrivateRoute>} />
            <Route path="series" element={<PrivateRoute><Series /></PrivateRoute>} />
            <Route path="player/:id" element={<PrivateRoute><Player /></PrivateRoute>} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>
);
