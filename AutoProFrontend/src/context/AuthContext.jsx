/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

function isTokenExpired(token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('authUser');
      const token = localStorage.getItem('authToken');
      if (!stored || !token || isTokenExpired(token)) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('authUser');
        return null;
      }
      return JSON.parse(stored);
    } catch {
      return null;
    }
  });

  const navigate = useNavigate();

  const login = (responseData) => {
    const userData = {
      userId: responseData.userId,
      name: responseData.name,
      email: responseData.email,
      role: responseData.role,
      profileId: responseData.profileId,
    };
    localStorage.setItem('authToken', responseData.token);
    localStorage.setItem('authUser', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
    setUser(null);
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
