import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import useAuth from '../../hooks/useAuth';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login({ email: email.trim(), password });
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-shell flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-5xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_32px_64px_-40px_rgba(20,27,52,0.7)] md:grid md:grid-cols-2">
        <div className="hidden bg-gradient-to-br from-[#132a66] via-[#1f3b8f] to-[#2f5cff] p-10 text-white md:block">
          <p className="mono-label text-xs text-blue-100">KRISHNA PG</p>
          <h1 className="mt-4 text-4xl font-bold leading-tight">Resident Management</h1>
          <p className="mt-4 text-sm text-blue-100">One place to manage rooms, bookings, and resident updates.</p>
          <div className="mt-8 h-2 w-14 rounded-full bg-white/60 glow-ring" />
        </div>

        <div className="p-6 sm:p-10">
          <h2 className="text-3xl font-bold text-slate-900">Sign In</h2>
          <p className="mt-1 text-sm text-slate-500">Access your dashboard</p>

          {error && <p className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <Input label="Email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
            <Input label="Password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} required />

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <p className="mt-6 text-sm text-slate-600">
            New user?{' '}
            <Link className="font-semibold text-[#2f5cff] hover:underline" to="/register">
              Create account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
