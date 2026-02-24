import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import DashboardLayout from './components/layout/DashboardLayout';
import UserDashboard from './pages/user/UserDashboard';
import Rooms from './pages/user/Rooms';
import Bookings from './pages/user/Bookings';
import Mess from './pages/user/Mess';
import Payments from './pages/user/Payments';
import Settlement from './pages/user/Settlement';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import TenantOnboarding from './pages/auth/TenantOnboarding';
import AdminOverview from './pages/admin/AdminOverview';
import AdminBookings from './pages/admin/AdminBookings';
import AdminPayments from './pages/admin/AdminPayments';
import AdminMess from './pages/admin/AdminMess';
import AdminCheckout from './pages/admin/AdminCheckout';
import ProtectedRoute from './routes/ProtectedRoute';
import useAuth from './hooks/useAuth';

function AuthLanding() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (user) {
    const from = location.state?.from?.pathname;
    return <Navigate to={from || '/dashboard'} replace />;
  }

  return <Navigate to="/onboarding" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<AuthLanding />} />
      <Route path="/onboarding" element={<TenantOnboarding />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<UserDashboard />} />
        <Route path="/rooms" element={<Rooms />} />
        <Route path="/bookings" element={<Bookings />} />
        <Route path="/mess" element={<Mess />} />
        <Route path="/payments" element={<Payments />} />
        <Route path="/settlement" element={<Settlement />} />
      </Route>

      <Route
        element={
          <ProtectedRoute requiredRole="ADMIN">
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/admin" element={<Navigate to="/admin/overview" replace />} />
        <Route path="/admin/overview" element={<AdminOverview />} />
        <Route path="/admin/bookings" element={<AdminBookings />} />
        <Route path="/admin/payments" element={<AdminPayments />} />
        <Route path="/admin/mess" element={<AdminMess />} />
        <Route path="/admin/checkout" element={<AdminCheckout />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
