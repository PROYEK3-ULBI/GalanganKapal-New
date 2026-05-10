import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { hasAccess, PERMISSIONS } from './config/permissions';
import MainLayout from './components/layout/MainLayout';
import Login from './pages/Login/Login';
import Dashboard from './pages/Dashboard/Dashboard';
import MasterMaterialCatalog from './pages/MasterData/MasterMaterialCatalog';
import MaterialForm from './pages/MasterData/MaterialForm';
import GoodsReceipt from './pages/Inventory/GoodsReceipt';
import GoodsIssue from './pages/Inventory/GoodsIssue';
import ScrapReturn from './pages/Inventory/ScrapReturn';
import Traceability from './pages/Traceability/Traceability';
import ToolsManagement from './pages/ToolsManagement/ToolsManagement';
import MaterialRequest from './pages/MaterialRequest/MaterialRequest';
import Procurement from './pages/Procurement/Procurement';
import Reports from './pages/Reports/Reports';
import SettingsPage from './pages/Settings/Settings';
import Support from './pages/Support/Support';
import AccessDenied from './pages/AccessDenied';
import './styles/global.css';

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
}

function RoleGuard({ children, requiredRoute }) {
  const { role } = useApp();
  if (!hasAccess(role, requiredRoute)) {
    return <AccessDenied />;
  }
  return children;
}

function AppRoutes() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={isAuthenticated ? <Navigate to="/" replace /> : <Login />} />
      <Route path="/" element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="master-data" element={<RoleGuard requiredRoute="/master-data"><MasterMaterialCatalog /></RoleGuard>} />
        <Route path="master-data/new" element={<RoleGuard requiredRoute="/master-data/new"><MaterialForm /></RoleGuard>} />
        <Route path="master-data/:id/edit" element={<RoleGuard requiredRoute="/master-data/new"><MaterialForm /></RoleGuard>} />
        <Route path="inventory/goods-receipt" element={<RoleGuard requiredRoute="/inventory/goods-receipt"><GoodsReceipt /></RoleGuard>} />
        <Route path="inventory/goods-issue" element={<RoleGuard requiredRoute="/inventory/goods-issue"><GoodsIssue /></RoleGuard>} />
        <Route path="inventory/scrap-return" element={<RoleGuard requiredRoute="/inventory/scrap-return"><ScrapReturn /></RoleGuard>} />
        <Route path="material-request" element={<RoleGuard requiredRoute="/material-request"><MaterialRequest /></RoleGuard>} />
        <Route path="traceability" element={<RoleGuard requiredRoute="/traceability"><Traceability /></RoleGuard>} />
        <Route path="tools" element={<RoleGuard requiredRoute="/tools"><ToolsManagement /></RoleGuard>} />
        <Route path="procurement" element={<RoleGuard requiredRoute="/procurement"><Procurement /></RoleGuard>} />
        <Route path="reports" element={<RoleGuard requiredRoute="/reports"><Reports /></RoleGuard>} />
        <Route path="settings" element={<RoleGuard requiredRoute="/settings"><SettingsPage /></RoleGuard>} />
        <Route path="support" element={<RoleGuard requiredRoute="/support"><Support /></RoleGuard>} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppProvider>
          <AppRoutes />
        </AppProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
