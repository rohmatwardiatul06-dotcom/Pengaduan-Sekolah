import React, { useState, useEffect } from 'react';
import API from '../services/api';
import ComplaintTable from '../components/ComplaintTable';
import { AlertCircle, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

const MyComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      setErrorMsg('');
      const response = await API.get('/data');
      setComplaints(response.data.data);
    } catch (error) {
      console.error('Error fetching own complaints:', error);
      setErrorMsg('Gagal memuat data pengaduan Anda. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus laporan pengaduan ini?')) return;

    try {
      await API.delete(`/data/${id}`);
      // Refresh list
      fetchComplaints();
    } catch (error) {
      console.error('Error deleting complaint:', error);
      alert(error.response?.data?.message || 'Gagal menghapus pengaduan.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Daftar Pengaduan Saya</h1>
          <p className="text-sm text-slate-500 mt-1">
            Melihat status dan mengelola laporan pengaduan yang Anda buat.
          </p>
        </div>
        <Link
          to="/create"
          className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold rounded-xl transition-all shadow-md shadow-violet-600/10 self-start"
        >
          <Plus className="h-4 w-4" />
          Buat Laporan Baru
        </Link>
      </div>

      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-sm flex items-start gap-2.5">
          <AlertCircle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Complaints Table Component */}
      <ComplaintTable
        complaints={complaints}
        onDelete={handleDelete}
        loading={loading}
        showReporter={false}
      />
    </div>
  );
};

export default MyComplaints;
