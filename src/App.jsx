import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { AuthProvider, useAuth } from "./utils/AuthContext.jsx";
import { PrivateRoute } from './utils/PrivateRoute.jsx';
import AdminRoute from "./components/AdminRoute.jsx";

import { Login } from "./pages/Login.jsx";
import { Register } from "./pages/Register.jsx";
import Catalogo from "./pages/Catalogo.jsx";
import Player from "./pages/Player.jsx";
import IPTVApp from './IPTVApp.jsx';
import AdminPanel from "./pages/AdminPanel.jsx";
import SubirM3U from "./pages/SubirM3U.jsx";
import ContenidoAdmin from "./pages/ContenidoAdmin.jsx"; // 👈 Import nuevo

function AppContent() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-blue-700 text-white py-4 shadow">
        <div className="max-w-6xl mx-auto px-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">TeamG Play</h1>
          <nav className="space-x-4">
            <Link to="/" className="hover:underline">Home</Link>
            <Link to="/movies" className="hover:underline">Movies</Link>
            <Link to="/series" className="hover:underline">Series</Link>
            <Link to="/iptv" className="hover:underline">IPTV</Link>
            {user?.role === "admin" && (
              <>
                <Link to="/admin" className="hover:underline">Admin</Link>
                <Link to="/subir-m3u" className="hover:underline">Subir M3U</Link>
                <Link to="/contenido-admin" className="hover:underline">Contenido</Link> {/* 👈 Nuevo link */}
              </>
            )}
          </nav>
        </div>
      </header>

      <main className="p-4">
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
          <Route path="/contenido-admin" element={<AdminRoute><ContenidoAdmin /></AdminRoute>} /> {/* 👈 Nueva ruta */}

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
