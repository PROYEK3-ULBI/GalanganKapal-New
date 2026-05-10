import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const login = (email, password) => {
    const demoUsers = {
      'admin@shipyard.co.id': { name: 'Ahmad Fauzi', role: 'admin', avatar: 'AF' },
      'supervisor@shipyard.co.id': { name: 'Budi Santoso', role: 'supervisor', avatar: 'BS' },
      'staff@shipyard.co.id': { name: 'Citra Dewi', role: 'staff', avatar: 'CD' },
    };
    const found = demoUsers[email];
    if (found && password === 'admin123') {
      setUser({ email, ...found });
      setIsAuthenticated(true);
      return { success: true };
    }
    return { success: false, error: 'Invalid email or password' };
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
