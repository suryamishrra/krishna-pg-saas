import { NavLink, useLocation } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';

const residentItems = [
  { to: '/dashboard', label: 'Dashboard', icon: '01' },
  { to: '/rooms', label: 'Rooms', icon: '02' },
  { to: '/bookings', label: 'Bookings', icon: '03' },
  { to: '/mess', label: 'Mess', icon: '04' },
  { to: '/payments', label: 'Payments', icon: '05' },
  { to: '/settlement', label: 'Settlement', icon: '06' },
];

const adminItems = [
  { to: '/admin/overview', label: 'Overview', icon: 'A1' },
  { to: '/admin/bookings', label: 'Bookings', icon: 'A2' },
  { to: '/admin/payments', label: 'Payments', icon: 'A3' },
  { to: '/admin/mess', label: 'Mess Ops', icon: 'A4' },
  { to: '/admin/checkout', label: 'Checkout', icon: 'A5' },
];

export default function Sidebar({ open, onNavigate }) {
  const { user } = useAuth();
  const location = useLocation();

  const isAdminArea = location.pathname.startsWith('/admin');
  const isAdmin = user?.roles?.includes('ADMIN');
  const navItems = isAdminArea && isAdmin ? adminItems : residentItems;

  return (
    <aside
      className={`fixed left-0 top-0 z-40 h-full w-[280px] transform border-r border-slate-200/70 bg-[#111a3a] text-white transition-transform duration-300 lg:translate-x-0 ${
        open ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <div className="flex h-full flex-col p-6">
        <div className="glass-card mb-8 border-white/20 bg-white/10 p-4 text-white">
          <p className="mono-label text-xs text-blue-100">KRISHNA PG</p>
          <h1 className="mt-2 text-2xl font-bold">Resident Hub</h1>
          <p className="mt-1 text-sm text-blue-100">Daily operations, streamlined.</p>
        </div>

        <nav className="space-y-2 overflow-y-auto">
          {navItems.map((item, index) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onNavigate}
              style={{ animationDelay: `${70 + index * 70}ms` }}
              className={({ isActive }) =>
                `stagger-enter flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all duration-300 ${
                  isActive
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-blue-100 hover:translate-x-1 hover:bg-white/10 hover:text-white'
                }`
              }
            >
              <span className="mono-label text-xs opacity-80">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto rounded-xl border border-white/20 bg-white/10 p-4 text-sm text-blue-100">
          {isAdminArea && isAdmin ? 'Admin panel active' : 'Resident panel active'}
          <p className="mt-1 text-xs">All core services are available.</p>
        </div>
      </div>
    </aside>
  );
}
