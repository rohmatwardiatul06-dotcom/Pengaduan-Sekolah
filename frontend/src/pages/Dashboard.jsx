import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import API from '../services/api';
import StatCard from '../components/StatCard';
import ComplaintTable from '../components/ComplaintTable';
import { ClipboardList, AlertCircle, RefreshCw, CheckCircle, XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ total: 0, pending: 0, proses: 0, selesai: 0, ditolak: 0 });
  const [loading, setLoading] = useState(true);
  const [recent, setRecent] = useState([]);
  const [allComplaints, setAllComplaints] = useState([]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // GET /stats
      const statsRes = await API.get('/stats');
      setStats(statsRes.data.data);

      // GET /data
      const complaintsRes = await API.get('/data');
      if (user?.role === 'admin') {
        setAllComplaints(complaintsRes.data.data);
      } else {
        setRecent(complaintsRes.data.data.slice(0, 3));
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [user?.role]);

  const handleStatusChange = async (id, newStatus) => {
    try {
      await API.put(`/data/${id}`, { status: newStatus });
      // Refresh stats and data
      const statsRes = await API.get('/stats');
      setStats(statsRes.data.data);
      const complaintsRes = await API.get('/data');
      setAllComplaints(complaintsRes.data.data);
    } catch (error) {
      console.error('Error updating complaint status:', error);
      alert(error.response?.data?.message || 'Gagal merubah status pengaduan.');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <RefreshCw className="h-8 w-8 animate-spin text-violet-500" />
          <p className="text-sm text-slate-500">Memuat statistik dashboard...</p>
        </div>
      </div>
    );
  }

  // Admin Dashboard
  if (user?.role === 'admin') {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Dashboard Administrator</h1>
          <p className="text-sm text-slate-500 mt-1">
            Pantau statistik ringkas dan kelola seluruh pengaduan siswa secara real-time.
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <StatCard
            title="Total Laporan"
            value={stats.total}
            icon={ClipboardList}
            colorClass="bg-slate-100 text-slate-700"
            borderClass="border-slate-200"
            ringClass="hover:ring-slate-100"
          />
          <StatCard
            title="Menunggu (Pending)"
            value={stats.pending}
            icon={AlertCircle}
            colorClass="bg-amber-50 text-amber-600"
            borderClass="border-amber-100"
            ringClass="hover:ring-amber-50"
          />
          <StatCard
            title="Sedang Diproses"
            value={stats.proses}
            icon={RefreshCw}
            colorClass="bg-blue-50 text-blue-600"
            borderClass="border-blue-100"
            ringClass="hover:ring-blue-50"
          />
          <StatCard
            title="Laporan Selesai"
            value={stats.selesai}
            icon={CheckCircle}
            colorClass="bg-emerald-50 text-emerald-600"
            borderClass="border-emerald-100"
            ringClass="hover:ring-emerald-50"
          />
          <StatCard
            title="Laporan Ditolak"
            value={stats.ditolak}
            icon={XCircle}
            colorClass="bg-rose-50 text-rose-600"
            borderClass="border-rose-100"
            ringClass="hover:ring-rose-50"
          />
        </div>

        {/* Management Table Component for Admin */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-800">Kelola Seluruh Pengaduan</h2>
          </div>
          <ComplaintTable
            complaints={allComplaints}
            onStatusChange={handleStatusChange}
            loading={loading}
            showReporter={true}
          />
        </div>
      </div>
    );
  }

  // User Dashboard (remains the same)
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Ringkasan Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1">
          Pantau status laporan pengaduan sekolah hari ini.
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
        <StatCard
          title="Total Laporan"
          value={stats.total}
          icon={ClipboardList}
          colorClass="bg-slate-100 text-slate-700"
          borderClass="border-slate-200"
          ringClass="hover:ring-slate-100"
        />
        <StatCard
          title="Menunggu (Pending)"
          value={stats.pending}
          icon={AlertCircle}
          colorClass="bg-amber-50 text-amber-600"
          borderClass="border-amber-100"
          ringClass="hover:ring-amber-50"
        />
        <StatCard
          title="Sedang Diproses"
          value={stats.proses}
          icon={RefreshCw}
          colorClass="bg-blue-50 text-blue-600"
          borderClass="border-blue-100"
          ringClass="hover:ring-blue-50"
        />
        <StatCard
          title="Laporan Selesai"
          value={stats.selesai}
          icon={CheckCircle}
          colorClass="bg-emerald-50 text-emerald-600"
          borderClass="border-emerald-100"
          ringClass="hover:ring-emerald-50"
        />
        <StatCard
          title="Laporan Ditolak"
          value={stats.ditolak}
          icon={XCircle}
          colorClass="bg-rose-50 text-rose-600"
          borderClass="border-rose-100"
          ringClass="hover:ring-rose-50"
        />
      </div>

      {/* Main Grid Content */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Side: Recent Complaints */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-800 text-base">Laporan Terbaru</h3>
              <Link
                to={user?.role === 'admin' ? '/all-complaints' : '/my-complaints'}
                className="text-xs font-semibold text-violet-600 hover:text-violet-500"
              >
                Lihat Semua
              </Link>
            </div>

            <div className="space-y-4">
              {recent.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-6">Belum ada laporan pengaduan.</p>
              ) : (
                recent.map((item) => (
                  <div key={item.id} className="flex items-start justify-between p-3.5 rounded-xl border border-slate-100 hover:bg-slate-50/50 transition-colors">
                    <div>
                      <h4 className="text-sm font-semibold text-slate-800 line-clamp-1">{item.title}</h4>
                      <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-400">
                        <span className="font-medium bg-slate-100 px-2 py-0.5 rounded text-[10px] text-slate-600">{item.category}</span>
                        <span>{formatDate(item.created_at)}</span>
                        {user?.role === 'admin' && (
                          <span className="font-medium text-slate-500">Oleh: {item.username}</span>
                        )}
                      </div>
                    </div>
                    <div>
                      {item.status === 'pending' && (
                        <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-[10px] font-semibold text-amber-700 border border-amber-100">Tertunda</span>
                      )}
                      {item.status === 'proses' && (
                        <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-[10px] font-semibold text-blue-700 border border-blue-100">Diproses</span>
                      )}
                      {item.status === 'selesai' && (
                        <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-700 border border-emerald-100">Selesai</span>
                      )}
                      {item.status === 'ditolak' && (
                        <span className="rounded-full bg-rose-50 px-2.5 py-0.5 text-[10px] font-semibold text-rose-700 border border-rose-100">Ditolak</span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Quick Action info box */}
        <div className="bg-gradient-to-br from-violet-600 to-indigo-700 rounded-2xl p-6 text-white shadow-md shadow-violet-600/10 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-lg font-display">SIPEKAN Portal</h3>
            <p className="mt-3 text-sm text-violet-100 leading-relaxed">
              Selamat datang di portal pengaduan internal sekolah. Kami berkomitmen untuk mendengar aspirasi Anda demi menciptakan lingkungan sekolah yang nyaman dan berprestasi.
            </p>

            <div className="mt-6 space-y-3">
              <div className="flex items-center gap-3 text-xs text-violet-100 bg-white/10 px-3 py-2 rounded-xl border border-white/10">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Proses verifikasi responsif</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-violet-100 bg-white/10 px-3 py-2 rounded-xl border border-white/10">
                <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
                <span>Kerahasiaan pelapor terjamin</span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-white/10">
            {user?.role === 'user' ? (
              <Link
                to="/create"
                className="w-full inline-flex justify-center items-center gap-1.5 px-4 py-2.5 bg-white text-violet-750 font-semibold rounded-xl text-sm transition-all hover:bg-violet-50 text-center"
              >
                Buat Laporan Baru
              </Link>
            ) : (
              <Link
                to="/all-complaints"
                className="w-full inline-flex justify-center items-center gap-1.5 px-4 py-2.5 bg-white text-violet-750 font-semibold rounded-xl text-sm transition-all hover:bg-violet-50 text-center"
              >
                Kelola Pengaduan
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
