import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider, useAuth } from "./utils/AuthContext.jsx";
import { PrivateRoute } from './utils/PrivateRoute.jsx';
import AdminRoute from "./components/AdminRoute.jsx";
import { NavBar } from "./components/NavBar.jsx"; // Importar el NavBar mejorado

import { Login } from "./pages/Login.jsx";
import { Register } from "./pages/Register.jsx";
import Catalogo from "./pages/Catalogo.jsx";
import Player from "./pages/Player.jsx";
import IPTVApp from './IPTVApp.jsx';
import AdminPanel from "./pages/AdminPanel.jsx";
import SubirM3U from "./pages/SubirM3U.jsx";
import ContenidoAdmin from "./pages/ContenidoAdmin.jsx";

function AppContent() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Reemplazamos el header por el NavBar mejorado */}
      <NavBar />

      <main className="p-4 pt-20"> {/* Ajustamos el padding para dejar espacio para la barra */}
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="/" element={<PrivateRoute><Catalogo /></PrivateRoute>} />
          <Route path="/movies" element={<PrivateRoute><Catalogo type="movie" /></PrivateRoute>} />
          <Route path="/series" element={<PrivateRoute><Catalogo type="series" /></PrivateRoute>} />
          <Route path="/player/:id" element={<PrivateRoute><Player /></PrivateRoute>} />
          <Route path="/iptv" element={<PrivateRoute><IPTVApp /></PrivateRoute>} />

          <Route path="/admin" element={<AdminRoute><AdminPanel /></AdminRoute>} />
          <Route path="/subir-m3u" element={<AdminRoute><SubirM3U /></AdminRoute>} />
          <Route path="/contenido-admin" element={<AdminRoute><ContenidoAdmin /></AdminRoute>} />

          <Route path="*" element={<PrivateRoute><Catalogo /></PrivateRoute>} />
        </Routes>
      </main>
    </div>
  );
}

export const App = () => (
  <AuthProvider>
    <Router>
      <AppContent />
    </Router>
  </AuthProvider>
);

export default App;