import React, { createContext, useState, useEffect, useCallback } from 'react';
import AuthService from '../services/AuthService';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const authenticated = await AuthService.isAuthenticated();
      setIsAuthenticated(authenticated);

      if (authenticated) {
        const userData = await AuthService.getUser();
        setUser(userData);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = useCallback(async (email, password) => {
    const response = await AuthService.login(email, password);
    setUser({
      id: response.id,
      userName: response.userName,
      displayName: response.displayName,
      email: response.email,
      role: response.role,
      avatarUrl: response.avatarUrl,
      aboutMe: response.aboutMe,
      websiteUrl: response.websiteUrl,
    });
    setIsAuthenticated(true);
    return response;
  }, []);

  const register = useCallback(async (userName, displayName, email, password) => {
    const response = await AuthService.register(userName, displayName, email, password);
    setUser({
      id: response.id,
      userName: response.userName,
      displayName: response.displayName,
      email: response.email,
      role: response.role,
      avatarUrl: response.avatarUrl,
      aboutMe: response.aboutMe,
      websiteUrl: response.websiteUrl,
    });
    setIsAuthenticated(true);
    return response;
  }, []);

  const logout = useCallback(async () => {
    await AuthService.logout();
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const userData = await AuthService.getUser();
      setUser(userData);
    } catch (error) {
      console.error('Failed to refresh user:', error);
    }
  }, []);

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
