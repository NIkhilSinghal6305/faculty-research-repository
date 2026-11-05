import { createContext, useContext, useEffect, useState } from 'react';
import { api, getToken, saveToken, clearToken } from '../services/api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On page load, if a token exists, ask the server who we are
  useEffect(() => {
    if (!getToken()) {
      setLoading(false);
      return;
    }
    api('/auth/me')
      .then((res) => setUser(res.data.user))
      .catch(() => clearToken())
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    const res = await api('/auth/login', { method: 'POST', body: { email, password } });
    saveToken(res.data.token);
    setUser(res.data.user);
    return res.data.user;
  };

  const register = async (form) => {
    const res = await api('/auth/register', { method: 'POST', body: form });
    saveToken(res.data.token);
    setUser(res.data.user);
    return res.data.user;
  };

  const logout = () => {
    clearToken();
    setUser(null);
  };

  return <AuthContext.Provider value={{ user, loading, login, register, logout }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
