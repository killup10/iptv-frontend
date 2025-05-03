import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { AuthProvider, useAuth } from "./utils/AuthContext.jsx";
import PrivateRoute from "./utils/PrivateRoute.jsx";
import AdminRoute from "./components/AdminRoute.jsx";

import { Login } from "./pages/Login.jsx";
import { Register } from "./pages/Register.jsx";
import Catalog from "./pages/Catalog.jsx";
import Player from "./pages/Player.jsx";
import IPTVApp from "./pages/IPTVApp.jsx";
import AdminPanel from "./pages/AdminPanel.jsx";

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
              <Link to="/admin" className="hover:underline">Admin</Link>
            )}
          </nav>
        </div>
      </header>

      <main className="p-4">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="/" element={<PrivateRoute><Catalog /></PrivateRoute>} />
          <Route path="/movies" element={<PrivateRoute><Catalog type="movie"/></PrivateRoute>} />
          <Route path="/series" element={<PrivateRoute><Catalog type="series"/></PrivateRoute>} />
          <Route path="/player/:id" element={<PrivateRoute><Player/></PrivateRoute>} />
          <Route path="/iptv" element={<PrivateRoute><IPTVApp/></PrivateRoute>} />

          <Route path="/admin" element={<AdminRoute><AdminPanel/></AdminRoute>} />
          <Route path="*" element={<PrivateRoute><Catalog/></PrivateRoute>} />
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