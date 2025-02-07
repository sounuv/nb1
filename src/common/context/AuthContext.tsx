import React, { createContext, useState, useContext } from "react";

// Criação do contexto
const AuthContext = createContext(
  {} as {
    isAuthenticated: boolean;
    toggleAuth: (value: boolean) => void;
  },
);

// Criação do provider
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false); // Estado inicial é false

  // Função para alternar o valor do isAuthenticated
  const toggleAuth = (value: boolean) => setIsAuthenticated(value);

  return (
    <AuthContext.Provider value={{ isAuthenticated, toggleAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom Hook para consumir o contexto
export const useAuth = () => {
  return useContext(AuthContext);
};
