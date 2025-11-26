import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { NotificationProvider } from './contexts/NotificationContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Browse from './pages/Browse';
import CreatePawn from './pages/CreatePawn';
import PawnStatus from './pages/PawnStatus';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import NotificationContainer from './components/NotificationContainer';
import './App.css';
import './styles/Notification.css';

function App() {
  return (
    <NotificationProvider>
      <Router>
        <NotificationContainer />
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          
          {/* User Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/browse" element={<Browse />} />
          
          {/* Pawn-related routes */}
          <Route path="/create" element={<CreatePawn />} />
          <Route path="/status" element={<PawnStatus />} />
          <Route path="/notifications" element={<Dashboard />} />

          {/* Admin Routes */}
          <Route path="/admin" element={<Navigate to="/admin/login" replace />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
        </Routes>
      </Router>
    </NotificationProvider>
  );
}

export default App;
