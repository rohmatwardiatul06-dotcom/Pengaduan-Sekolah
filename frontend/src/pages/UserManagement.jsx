import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { 
  User, 
  Search, 
  Shield, 
  RefreshCw, 
  AlertCircle,
  CheckCircle,
  Users
} from 'lucide-react';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setErrorMsg('');
      const response = await API.get('/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
      setErrorMsg('Gagal mengambil daftar pengguna. Pastikan Anda masuk sebagai Admin Utama.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    try {
      setErrorMsg('');
      setSuccessMsg('');
      const response = await API.put(`/users/${userId}/role`, { role: newRole });
      setSuccessMsg(response.data.message);
      // Update local state
      setUsers(prevUsers => 
        prevUsers.map(u => u.id === userId ? { ...u, role: newRole } : u)
      );
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (error) {
      console.error('Error updating user role:', error);
      setErrorMsg(error.response?.data?.message || 'Gagal memperbarui peran pengguna.');
    }
  };

  const filteredUsers = users.filter(u => 
    u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <Users className="h-7 w-7 text-violet-600" />
          Kelola Hak Akses Pengguna
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Halaman eksklusif Admin Utama untuk menetapkan guru, memantau akun terdaftar, dan mengelola hak akses sistem.
        </p>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-sm flex items-start gap-2.5 animate-in fade-in slide-in-from-top-2 duration-200">
          <CheckCircle className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-sm flex items-start gap-2.5">
          <AlertCircle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Content Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Search header */}
        <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari nama pengguna atau email..."
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl bg-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-200 focus:border-violet-400 transition-all"
            />
          </div>
          <button 
            onClick={fetchUsers} 
            className="p-2 border border-slate-200 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors"
            title="Refresh Data"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm text-slate-600">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 font-semibold text-slate-700">
                <th className="px-6 py-4 w-12">No.</th>
                <th className="px-6 py-4">Username</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Tanggal Daftar</th>
                <th className="px-6 py-4">Peran (Role)</th>
                <th className="px-6 py-4 text-right">Aksi Penetapan Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    <div className="flex justify-center items-center gap-2">
                      <RefreshCw className="h-5 w-5 animate-spin text-violet-500" />
                      <span>Memuat data pengguna...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    Tidak ditemukan data pengguna.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((item, index) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-semibold text-slate-700">{index + 1}</td>
                    <td className="px-6 py-4 font-medium text-slate-900">
                      <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
                          <User className="h-4 w-4" />
                        </div>
                        <span>{item.username}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">{item.email}</td>
                    <td className="px-6 py-4 text-xs text-slate-500">{formatDate(item.created_at)}</td>
                    <td className="px-6 py-4">
                      {item.role === 'admin' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-xs font-semibold text-emerald-700 border border-emerald-200">
                          Admin Utama
                        </span>
                      ) : item.role === 'guru' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 text-xs font-semibold text-amber-700 border border-amber-200">
                          Guru
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-50 text-xs font-semibold text-blue-700 border border-blue-200">
                          Siswa / User
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {item.role === 'admin' ? (
                        <span className="text-xs text-slate-400 italic">Hak Akses Utama</span>
                      ) : (
                        <div className="flex items-center justify-end gap-2">
                          <Shield className="h-4 w-4 text-slate-400" />
                          <select
                            value={item.role}
                            onChange={(e) => handleRoleChange(item.id, e.target.value)}
                            className="text-xs font-semibold rounded-lg bg-slate-50 border border-slate-200 px-2.5 py-1 text-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-200"
                          >
                            <option value="user">Siswa / User</option>
                            <option value="guru">Guru</option>
                          </select>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
