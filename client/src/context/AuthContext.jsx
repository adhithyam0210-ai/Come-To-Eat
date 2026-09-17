import React, { createContext, useContext, useState, useEffect } from 'react';
import { getToken, getUser, setAuth, clearAuth, api } from '../utils/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getUser());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      const token = getToken();
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await api.get('/auth/me');
        if (res.success && res.user) {
          setUser(res.user);
          localStorage.setItem('cte_user', JSON.stringify(res.user));
        } else {
          clearAuth();
          setUser(null);
        }
      } catch (e) {
        clearAuth();
        setUser(null);
      } finally {
        setLoading(false);
      }
    }
    checkAuth();
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.success && res.token) {
      setAuth(res.token, res.user);
      setUser(res.user);
      return res;
    }
    throw new Error(res.message || 'Login failed');
  };

  const register = async (userData) => {
    const res = await api.post('/auth/register', userData);
    if (res.success && res.token) {
      setAuth(res.token, res.user);
      setUser(res.user);
      return res;
    }
    throw new Error(res.message || 'Registration failed');
  };

  const logout = () => {
    clearAuth();
    setUser(null);
  };

  const isAdmin = Boolean(user && user.role === 'admin');
  const isEmployee = Boolean(user && user.role === 'employee');
  const isStaff = Boolean(isAdmin || isEmployee);
  const isCustomer = Boolean(user && user.role === 'user');

  return (
    <AuthContext.Provider value={{
      user,
      isAdmin,
      isEmployee,
      isStaff,
      isCustomer,
      loading,
      login,
      register,
      logout,
      setUser
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
