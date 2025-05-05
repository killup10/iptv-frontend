  import React, { createContext, useContext, useState, useEffect } from "react";

  const AuthContext = createContext();

  export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    useEffect(() => {
      const stored = localStorage.getItem("user");
      if (stored) {
        setUser(JSON.parse(stored));
      }
    }, []);

    const login = (userData) => {
      console.log("USER:", userData);
      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData); // ✅ Asigna correctamente el rol aquí
    };

    const logout = () => {
      localStorage.removeItem("user");
      setUser(null);
    };

    return (
      <AuthContext.Provider value={{ user, login, logout }}>
        {children}
      </AuthContext.Provider>
    );
  };

  // ✅ Esta línea es fundamental, exporta el hook
  export const useAuth = () => useContext(AuthContext);
