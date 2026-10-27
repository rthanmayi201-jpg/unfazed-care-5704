import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi, therapistApi } from '../api/index.js';
import { DEMO_CREDENTIALS } from '../utils/constants.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check localStorage
    const savedToken = localStorage.getItem('unfazed_token');
    const savedUser = localStorage.getItem('unfazed_user');

    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error('Failed to parse saved user', e);
        localStorage.removeItem('unfazed_token');
        localStorage.removeItem('unfazed_user');
      }
    } else {
      // Default to demo therapist on first launch for seamless evaluator experience
      const defaultTherapistUser = {
        id: 'therapist_sharma',
        name: DEMO_CREDENTIALS.therapist.name,
        email: DEMO_CREDENTIALS.therapist.email,
        slug: DEMO_CREDENTIALS.therapist.slug,
        role: 'therapist',
        tier: 'pro',
        avatar: '/src/assets/images/dr_sharma_avatar_1792946450077.jpg'
      };
      const demoToken = 'mock_jwt_therapist_sharma_init';
      localStorage.setItem('unfazed_token', demoToken);
      localStorage.setItem('unfazed_user', JSON.stringify(defaultTherapistUser));
      setUser(defaultTherapistUser);
      setToken(demoToken);
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const data = await authApi.login({ email, password });
      setUser(data.user);
      setToken(data.token);
      localStorage.setItem('unfazed_token', data.token);
      localStorage.setItem('unfazed_user', JSON.stringify(data.user));
      return data;
    } finally {
      setLoading(false);
    }
  };

  const register = async (registerData) => {
    setLoading(true);
    try {
      const data = await authApi.register(registerData);
      setUser(data.user);
      setToken(data.token);
      localStorage.setItem('unfazed_token', data.token);
      localStorage.setItem('unfazed_user', JSON.stringify(data.user));
      return data;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('unfazed_token');
    localStorage.removeItem('unfazed_user');
  };

  const updateUser = (updates) => {
    setUser(prev => {
      const updated = { ...prev, ...updates };
      localStorage.setItem('unfazed_user', JSON.stringify(updated));
      return updated;
    });
  };

  const switchAccount = (role = 'therapist') => {
    if (role === 'therapist') {
      const therapistUser = {
        id: 'therapist_sharma',
        name: DEMO_CREDENTIALS.therapist.name,
        email: DEMO_CREDENTIALS.therapist.email,
        slug: DEMO_CREDENTIALS.therapist.slug,
        role: 'therapist',
        tier: 'pro',
        avatar: '/src/assets/images/dr_sharma_avatar_1792946450077.jpg'
      };
      const token = 'mock_jwt_therapist_sharma_' + Date.now();
      localStorage.setItem('unfazed_token', token);
      localStorage.setItem('unfazed_user', JSON.stringify(therapistUser));
      setUser(therapistUser);
      setToken(token);
    } else {
      const clientUser = {
        id: 'client_1',
        name: DEMO_CREDENTIALS.client.name,
        email: DEMO_CREDENTIALS.client.email,
        role: 'client',
        therapistId: 'therapist_sharma'
      };
      const token = 'mock_jwt_client_aarav_' + Date.now();
      localStorage.setItem('unfazed_token', token);
      localStorage.setItem('unfazed_user', JSON.stringify(clientUser));
      setUser(clientUser);
      setToken(token);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        role: user?.role || null,
        tier: user?.tier || 'free',
        isAuthenticated: Boolean(token && user),
        loading,
        login,
        register,
        logout,
        updateUser,
        switchAccount
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
