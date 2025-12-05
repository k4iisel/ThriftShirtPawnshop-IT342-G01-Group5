import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { NotificationProvider } from './contexts/NotificationContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CreatePawn from './pages/CreatePawn';
import PawnStatus from './pages/PawnStatus';
import History from './pages/History';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import DeveloperAdminApprove from './pages/DeveloperAdminApprove';
import DeveloperAdminValidate from './pages/DeveloperAdminValidate';
import DeveloperAdminLoanManager from './pages/DeveloperAdminLoanManager';
import NotificationContainer from './components/NotificationContainer';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRouteProtection from './components/AdminRouteProtection';
import useAdminAccessGuard from './hooks/useAdminAccessGuard';
import './App.css';
import './styles/Notification.css';

function AppContent() {
  // Global admin access guard - monitors all navigation
  useAdminAccessGuard();

  return (
    <>
      <NotificationContainer />
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/create" element={<CreatePawn />} />
          <Route path="/status" element={<PawnStatus />} />
          <Route path="/history" element={<History />} />
        </Route>

        {/* Admin Routes with Protection */}
        <Route path="/admin" element={<Navigate to="/admin/login" replace />} />
        <Route path="/admin/login" element={
          <AdminRouteProtection>
            <AdminLogin />
          </AdminRouteProtection>
        } />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/developer_admin_approve" element={
          <AdminRouteProtection>
            <DeveloperAdminApprove />
          </AdminRouteProtection>
        } />
        <Route path="/developer_admin_validate" element={
          <AdminRouteProtection>
            <DeveloperAdminValidate />
          </AdminRouteProtection>
        } />
        <Route path="/developer_admin_loan_manager" element={
          <AdminRouteProtection>
            <DeveloperAdminLoanManager />
          </AdminRouteProtection>
        } />
      </Routes>
    </>
  );
}

function App() {
  return (
    <NotificationProvider>
      <Router>
        <AppContent />
      </Router>
    </NotificationProvider>
  );
}

export default App;
