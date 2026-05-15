import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { approvals as initialApprovals } from '../data/mockData';
import { useAuth } from './AuthContext';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const { user, isAuthenticated } = useAuth();
  const [role, setRole] = useState('admin');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [toasts, setToasts] = useState([]);

  // Keep role in sync with the authenticated user. The role switcher in the
  // header still works for demos by overriding this until the next login/logout.
  useEffect(() => {
    if (isAuthenticated && user?.role) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setRole(user.role);
    }
  }, [isAuthenticated, user?.role]);

  // Shared request/approval state — Staff submits, Supervisor approves
  const [requests, setRequests] = useState(initialApprovals);

  const addRequest = useCallback((request) => {
    const newReq = {
      id: `REQ-${String(Date.now()).slice(-4)}`,
      ...request,
      date: new Date().toISOString().split('T')[0],
      status: 'pending',
    };
    setRequests(prev => [newReq, ...prev]);
    return newReq;
  }, []);

  const updateRequestStatus = useCallback((id, status, approver) => {
    setRequests(prev => prev.map(r =>
      r.id === id ? { ...r, status, approvedBy: approver, approvedDate: new Date().toISOString().split('T')[0] } : r
    ));
  }, []);

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
      requests, addRequest, updateRequestStatus
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
