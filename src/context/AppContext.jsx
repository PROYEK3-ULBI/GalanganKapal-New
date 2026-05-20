import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useAuth } from './AuthContext';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const { user, isAuthenticated } = useAuth();
  const [role, setRole] = useState('admin');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [toasts, setToasts] = useState([]);
  // Shared search query that the header input writes into and that
  // opt-in pages may forward to their DataTable as the controlled value.
  const [globalSearch, setGlobalSearch] = useState('');

  // Keep role in sync with the authenticated user. The role switcher in the
  // header still works for demos by overriding this until the next login/logout.
  useEffect(() => {
    if (isAuthenticated && user?.role) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setRole(user.role);
    }
  }, [isAuthenticated, user?.role]);

  const addToast = useCallback((message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3500);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <AppContext.Provider value={{
      role, setRole,
      sidebarCollapsed, setSidebarCollapsed,
      mobileMenuOpen, setMobileMenuOpen,
      toasts, addToast, removeToast,
      globalSearch, setGlobalSearch,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
