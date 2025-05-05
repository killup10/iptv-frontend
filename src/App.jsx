import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./utils/AuthContext.jsx";
import { Login } from "./pages/Login.jsx";

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-900 text-white">
          <main className="p-4">
            <Routes>
              <Route path="/" element={<div>Página principal</div>} />
              <Route path="/login" element={<Login />} />
              <Route path="*" element={<div>Página no encontrada</div>} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;