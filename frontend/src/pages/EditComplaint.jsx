import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../services/api';
import ComplaintForm from '../components/ComplaintForm';
import { useAuth } from '../hooks/useAuth';
import { RefreshCw, AlertCircle, ArrowLeft } from 'lucide-react';

const EditComplaint = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchComplaint = async () => {
      try {
        setLoading(true);
        setErrorMsg('');
        // GET /data/:id
        const response = await API.get(`/data/${id}`);
        const data = response.data.data;
        
        // Cek kepemilikan dan status laporan
        if (data.user_id !== user?.id && user?.role !== 'admin') {
          setErrorMsg('Anda tidak memiliki akses untuk mengubah laporan ini.');
        } else if (data.status !== 'pending' && user?.role !== 'admin') {
          setErrorMsg('Laporan tidak dapat diubah karena status sudah diproses atau selesai.');
        } else {
          setComplaint(data);
        }
      } catch (error) {
        console.error('Error fetching complaint for edit:', error);
        setErrorMsg('Gagal memuat detail pengaduan. Laporan tidak ditemukan atau server bermasalah.');
      } finally {
        setLoading(false);
      }
    };
    fetchComplaint();
  }, [id, user]);

  if (loading) {
    return (
      <div className="flex h-[40vh] items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <RefreshCw className="h-8 w-8 animate-spin text-violet-500" />
          <p className="text-sm text-slate-500">Memuat detail pengaduan...</p>
        </div>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="max-w-2xl mx-auto py-8">
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-rose-800 space-y-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-6 w-6 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-base">Akses Ditolak</h3>
              <p className="text-sm mt-1">{errorMsg}</p>
            </div>
          </div>
          <div className="pt-2 border-t border-rose-100 flex justify-end">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-rose-250 hover:bg-rose-100 rounded-xl text-xs font-semibold transition-all text-slate-700"
            >
              <ArrowLeft className="h-4 w-4" />
              Kembali
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-4">
      <ComplaintForm initialData={complaint} isEdit={true} />
    </div>
  );
};

export default EditComplaint;
