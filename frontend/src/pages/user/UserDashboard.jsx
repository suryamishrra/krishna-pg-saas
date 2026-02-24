import { useEffect, useMemo, useState } from 'react';
import api from '../../api/axios';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import useAuth from '../../hooks/useAuth';

export default function UserDashboard() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const response = await api.get('/bookings/my');
        setBookings(response.data || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const approvedCount = useMemo(
    () => bookings.filter((entry) => entry.booking_status === 'APPROVED').length,
    [bookings]
  );

  const latestBooking = bookings[0] || null;

  return (
    <div className="space-y-6">
      <section className="glass-card overflow-hidden p-0 hover-lift">
        <div className="relative overflow-hidden bg-gradient-to-r from-[#14295f] via-[#1f3b8f] to-[#2f5cff] p-6 text-white md:p-8">
          <div className="absolute -right-10 -top-10 h-36 w-36 rounded-full bg-white/10 blur-2xl" />
          <p className="mono-label text-xs text-blue-100">RESIDENT OVERVIEW</p>
          <h1 className="mt-2 text-3xl font-bold">Welcome back, {user?.first_name || 'Resident'}</h1>
          <p className="mt-2 max-w-2xl text-sm text-blue-100">
            Track room activity, booking updates, and account status from one dashboard.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Badge type="neutral">Total Bookings: {bookings.length}</Badge>
            <Badge type="success">Approved: {approvedCount}</Badge>
            <Badge type="info">Role: {user?.roles?.join(', ') || 'USER'}</Badge>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <Card className="stagger-enter xl:col-span-1" title="Profile Snapshot" subtitle="Current session details">
          <div className="space-y-3 text-sm">
            <Row label="Full Name" value={[user?.first_name, user?.last_name].filter(Boolean).join(' ') || 'N/A'} />
            <Row label="Email" value={user?.email || 'N/A'} />
            <Row label="Roles" value={user?.roles?.join(', ') || 'N/A'} />
          </div>
        </Card>

        <Card className="stagger-enter xl:col-span-2" title="Latest Booking" subtitle="Most recent booking record">
          {loading && <p className="text-slate-500">Loading booking status...</p>}
          {!loading && error && <p className="text-rose-600">{error}</p>}
          {!loading && !error && latestBooking && (
            <div className="grid gap-4 sm:grid-cols-3">
              <InfoBlock label="Room" value={latestBooking.room_number} />
              <InfoBlock label="Bed" value={latestBooking.bed_number} />
              <InfoBlock
                label="Status"
                value={<Badge type={latestBooking.booking_status === 'APPROVED' ? 'success' : 'warning'}>{latestBooking.booking_status}</Badge>}
              />
            </div>
          )}
          {!loading && !error && !latestBooking && (
            <p className="text-slate-500">No bookings yet. Explore available rooms and create one booking request.</p>
          )}
        </Card>
      </div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
      <span className="text-slate-500">{label}</span>
      <span className="font-semibold text-slate-900">{value}</span>
    </div>
  );
}

function InfoBlock({ label, value }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-slate-300">
      <p className="mono-label text-[11px] text-slate-500">{label}</p>
      <div className="mt-2 text-lg font-semibold text-slate-900">{value}</div>
    </div>
  );
}
