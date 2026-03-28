import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import client from '../api/client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const bootstrap = async () => {
      const token = localStorage.getItem('gods_eye_token');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const { data } = await client.get('/auth/me');
        setUser(data.user);
      } catch (error) {
        localStorage.removeItem('gods_eye_token');
      } finally {
        setLoading(false);
      }
    };

    bootstrap();
  }, []);

  const login = (token, profile) => {
    localStorage.setItem('gods_eye_token', token);
    setUser(profile);
  };

  const logout = () => {
    localStorage.removeItem('gods_eye_token');
    setUser(null);
  };

  const value = useMemo(() => ({ user, login, logout, loading }), [user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
