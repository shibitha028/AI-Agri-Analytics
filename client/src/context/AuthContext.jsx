import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('agri_user');
    const token = localStorage.getItem('agri_token');
    if (storedUser && token) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem('agri_user');
      }
    }
    setLoading(false);
  }, []);

  const login = useCallback((token, userData, rememberMe = true) => {
    setUser(userData);
    localStorage.setItem('agri_token', token);
    localStorage.setItem('agri_user', JSON.stringify(userData));
    localStorage.setItem('agri_remember', rememberMe ? '1' : '0');
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('agri_token');
    localStorage.removeItem('agri_user');
    localStorage.removeItem('agri_remember');
  }, []);

  const value = { user, login, logout, loading, isAuthenticated: Boolean(user) };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
