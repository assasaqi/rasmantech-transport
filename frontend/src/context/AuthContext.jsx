import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Mendapatkan token dengan mendukung semua variasi nama key
  const getInitialToken = () => {
    return (
      localStorage.getItem('clientToken') ||
      localStorage.getItem('client_token') ||
      localStorage.getItem('token') ||
      null
    );
  };

  // Mendapatkan user dengan mendukung semua variasi nama key
  const getInitialUser = () => {
    const savedUser =
      localStorage.getItem('clientUser') ||
      localStorage.getItem('client_user') ||
      localStorage.getItem('user');
    if (!savedUser) return null;
    try {
      return JSON.parse(savedUser);
    } catch {
      return null;
    }
  };

  const [token, setToken] = useState(getInitialToken);
  const [user, setUser] = useState(getInitialUser);

  useEffect(() => {
    const currentToken = getInitialToken();
    if (currentToken) {
      setToken(currentToken);
    }
  }, []);

  const login = (userData, authToken) => {
    setUser(userData);
    setToken(authToken);

    // Simpan ke nama key utama (clientToken & clientUser)
    localStorage.setItem('clientToken', authToken);
    localStorage.setItem('clientUser', JSON.stringify(userData));

    // Sinkronkan juga ke key sekunder agar kompatibel
    localStorage.setItem('client_token', authToken);
    localStorage.setItem('client_user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    setToken(null);

    // Hapus seluruh variasi key
    localStorage.removeItem('clientToken');
    localStorage.removeItem('clientUser');
    localStorage.removeItem('client_token');
    localStorage.removeItem('client_user');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
