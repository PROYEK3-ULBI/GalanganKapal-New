import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { authApi } from '../lib/api/auth';
import { ApiError, getToken, onUnauthorized, setToken } from '../lib/apiClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  // bootstrapping: true while we attempt to restore session from a stored token.
  const [bootstrapping, setBootstrapping] = useState(true);

  const handleAuthenticated = useCallback((nextUser, token) => {
    if (token !== undefined) setToken(token);
    setUser(nextUser);
    setIsAuthenticated(true);
  }, []);

  const handleSignedOut = useCallback(() => {
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  // On mount, try restoring the session from a stored token.
  useEffect(() => {
    let cancelled = false;
    async function bootstrap() {
      const token = getToken();
      if (!token) {
        setBootstrapping(false);
        return;
      }
      try {
        const data = await authApi.me();
        if (!cancelled) handleAuthenticated(data.user);
      } catch {
        if (!cancelled) handleSignedOut();
      } finally {
        if (!cancelled) setBootstrapping(false);
      }
    }
    bootstrap();
    return () => { cancelled = true; };
  }, [handleAuthenticated, handleSignedOut]);

  // Sign out automatically when any API call returns 401.
  useEffect(() => onUnauthorized(handleSignedOut), [handleSignedOut]);

  const login = useCallback(async (email, password) => {
    try {
      const data = await authApi.login(email, password);
      handleAuthenticated(data.user, data.token);
      return { success: true, user: data.user };
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Tidak dapat terhubung ke server';
      return { success: false, error: message };
    }
  }, [handleAuthenticated]);

  const logout = useCallback(() => {
    handleSignedOut();
  }, [handleSignedOut]);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, bootstrapping, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
