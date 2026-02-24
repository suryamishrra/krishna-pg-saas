import { useEffect, useState } from 'react';
import Card from '../../components/common/Card';
import api from '../../api/axios';

const statsConfig = [
  { key: 'totalRooms', label: 'Total Rooms' },
  { key: 'totalBeds', label: 'Total Beds' },
  { key: 'availableBeds', label: 'Available Beds' },
  { key: 'occupiedBeds', label: 'Occupied Beds' },
  { key: 'activeResidents', label: 'Active Residents' },
  { key: 'activeMessSubscribers', label: 'Mess Subscribers' },
  { key: 'todayMealsCount', label: 'Meals Today' },
  { key: 'pendingPayments', label: 'Pending Payments' },
  { key: 'totalVerifiedRevenue', label: 'Verified Revenue' },
];

export default function AdminOverview() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadStats = async () => {
      try {
        const res = await api.get('/admin/dashboard');
        setStats(res.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load admin stats.');
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  return (
    <div className="space-y-5">
      <div>
        <p className="mono-label text-xs text-slate-500">ADMIN CONTROL</p>
        <h2 className="text-3xl font-bold text-slate-900">Operations Overview</h2>
      </div>

      {loading && <p className="text-slate-500">Loading dashboard...</p>}
      {!loading && error && <p className="text-rose-600">{error}</p>}

      {!loading && !error && stats && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {statsConfig.map((item) => (
            <Card key={item.key} className="stagger-enter">
              <p className="mono-label text-xs text-slate-500">{item.label}</p>
              <p className="mt-2 text-3xl font-bold text-slate-900">{stats[item.key]}</p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
