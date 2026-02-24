import { useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';

export default function Navbar({ onMenuClick }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const fullName = [user?.first_name, user?.last_name].filter(Boolean).join(' ') || 'Guest User';
  const roleLabel = user?.roles?.includes('ADMIN') ? 'Admin + Resident' : 'Resident';

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200/70 bg-white/75 backdrop-blur-xl">
      <div className="flex h-16 items-center justify-between px-4 md:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
            className="rounded-lg border border-slate-200 p-2 text-slate-700 hover:bg-slate-100 lg:hidden"
            aria-label="Open menu"
          >
            <span className="block h-0.5 w-4 bg-current" />
            <span className="mt-1 block h-0.5 w-4 bg-current" />
            <span className="mt-1 block h-0.5 w-4 bg-current" />
          </button>
          <div>
            <p className="mono-label text-[11px] uppercase text-slate-500">Operations</p>
            <h2 className="text-lg font-semibold text-slate-900">Krishna PG Dashboard</h2>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden rounded-xl border border-slate-200 bg-white px-3 py-2 text-right sm:block">
            <p className="text-xs text-slate-500">{roleLabel}</p>
            <p className="text-sm font-semibold text-slate-800">{fullName}</p>
          </div>
          <button
            onClick={handleLogout}
            className="rounded-xl bg-slate-900 px-3.5 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-slate-800"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
