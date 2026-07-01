import React, { useState, useEffect } from 'react';
import API from '../services/api';
import ComplaintTable from '../components/ComplaintTable';
import { AlertCircle } from 'lucide-react';

const AllComplaints = () => {
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
      console.error('Error fetching all complaints:', error);
      setErrorMsg('Gagal memuat data pengaduan. Pastikan server terhubung.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const handleStatusChange = async (id, newStatus, comment) => {
    try {
      const payload = { status: newStatus };
      if (comment !== undefined) {
        payload.admin_comment = comment;
      }
      await API.put(`/data/${id}`, payload);
      // Refresh complaints list
      fetchComplaints();
    } catch (error) {
      console.error('Error updating complaint status:', error);
      alert(error.response?.data?.message || 'Gagal merubah status pengaduan.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Kelola Seluruh Pengaduan</h1>
        <p className="text-sm text-slate-500 mt-1">
          Halaman khusus Administrator untuk memproses dan menanggapi laporan pengaduan siswa.
        </p>
      </div>

      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-sm flex items-start gap-2.5">
          <AlertCircle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Complaints Table Component for Admin */}
      <ComplaintTable
        complaints={complaints}
        onStatusChange={handleStatusChange}
        loading={loading}
        showReporter={true}
      />
    </div>
  );
};

export default AllComplaints;
