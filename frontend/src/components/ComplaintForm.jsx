import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import { AlertCircle, CheckCircle2, Loader2, ArrowLeft, Camera, X } from 'lucide-react';

const ComplaintForm = ({ initialData = null, isEdit = false, onSuccess = null, onCancel = null }) => {
  // JavaScript Dasar: Object state
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: ''
  });
  
  // JavaScript Dasar: Array
  const categories = [
    'Fasilitas',
    'Akademik',
    'Disiplin & Bullying',
    'Administrasi & Keuangan',
    'Lainnya'
  ];

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverMsg, setServerMsg] = useState({ type: '', text: '' });
  const navigate = useNavigate();

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        content: initialData.content || '',
        category: initialData.category || ''
      });
      if (initialData.image_url) {
        setImagePreview(initialData.image_url);
      }
    }
  }, [initialData]);

  // JavaScript Dasar: Event Handling untuk File
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validasi Ukuran File (Maksimal 2MB)
      if (file.size > 2 * 1024 * 1024) {
        setErrors((prev) => ({ ...prev, image: 'Ukuran file terlalu besar. Maksimal 2MB!' }));
        e.target.value = '';
        return;
      }
      
      // Validasi Format File
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
      if (!allowedTypes.includes(file.type)) {
        setErrors((prev) => ({ ...prev, image: 'Format file tidak didukung. Gunakan JPG, JPEG, atau PNG!' }));
        e.target.value = '';
        return;
      }

      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setErrors((prev) => ({ ...prev, image: '' }));
    }
  };

  const handleRemoveFile = () => {
    setImageFile(null);
    setImagePreview(null);
    // Reset file input value
    const fileInput = document.getElementById('image');
    if (fileInput) fileInput.value = '';
  };

  // JavaScript Dasar: Event Handling untuk Input Text
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
    // Clear validation error on type
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  // JavaScript Dasar: Validation
  const validateForm = () => {
    const tempErrors = {};
    if (!formData.title.trim()) {
      tempErrors.title = 'Judul laporan wajib diisi.';
    } else if (formData.title.trim().length < 5) {
      tempErrors.title = 'Judul laporan minimal 5 karakter.';
    }

    if (!formData.content.trim()) {
      tempErrors.content = 'Detail laporan wajib diisi.';
    } else if (formData.content.trim().length < 15) {
      tempErrors.content = 'Detail laporan minimal 15 karakter agar mudah dipahami.';
    }

    if (!formData.category) {
      tempErrors.category = 'Kategori laporan wajib dipilih.';
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  // JavaScript Dasar: Function (Asynchronous handling)
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    setServerMsg({ type: '', text: '' });

    // Menggunakan FormData untuk pengiriman file biner
    const data = new FormData();
    data.append('title', formData.title.trim());
    data.append('content', formData.content.trim());
    data.append('category', formData.category);
    if (imageFile) {
      data.append('image', imageFile);
    }

    try {
      if (isEdit) {
        // Asynchronous request: PUT /data/:id
        await API.put(`/data/${initialData.id}`, data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        setServerMsg({ type: 'success', text: 'Laporan pengaduan berhasil diperbarui!' });
      } else {
        // Asynchronous request: POST /data
        await API.post('/data', data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        setServerMsg({ type: 'success', text: 'Laporan pengaduan berhasil dikirim! Kami akan segera memprosesnya.' });
        // Reset form
        setFormData({ title: '', content: '', category: '' });
        setImageFile(null);
        setImagePreview(null);
      }
      
      setTimeout(() => {
        if (onSuccess) {
          onSuccess();
        } else {
          navigate(isEdit ? `/my-complaints` : '/');
        }
      }, 1500);

    } catch (error) {
      const errMsg = error.response?.data?.message || 'Terjadi kesalahan sistem. Silakan coba lagi.';
      setServerMsg({ type: 'error', text: errMsg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm max-w-2xl mx-auto">
      <div className="flex items-center gap-2 mb-6">
        <button 
          onClick={() => onCancel ? onCancel() : navigate(-1)} 
          className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h3 className="text-xl font-bold text-slate-800">
          {isEdit ? 'Edit Laporan Pengaduan' : 'Buat Laporan Pengaduan Baru'}
        </h3>
      </div>

      {serverMsg.text && (
        <div className={`mb-6 p-4 rounded-xl flex items-start gap-3 text-sm ${
          serverMsg.type === 'success' 
            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
            : 'bg-rose-50 text-rose-850 border border-rose-200'
        }`}>
          {serverMsg.type === 'success' ? (
            <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600 mt-0.5" />
          ) : (
            <AlertCircle className="h-5 w-5 shrink-0 text-rose-600 mt-0.5" />
          )}
          <span>{serverMsg.text}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-semibold text-slate-700 mb-1.5">
            Judul Pengaduan <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Contoh: Lampu Kelas XI IPS 1 Padam"
            className={`w-full px-4 py-2.5 rounded-xl border bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 transition-all duration-200 text-sm ${
              errors.title 
                ? 'border-rose-300 focus:ring-rose-250 focus:border-rose-450' 
                : 'border-slate-200 focus:ring-violet-200 focus:border-violet-400'
            }`}
          />
          {errors.title && (
            <p className="mt-1 text-xs text-rose-600 flex items-center gap-1">
              <AlertCircle className="h-3.5 w-3.5" /> {errors.title}
            </p>
          )}
        </div>

        {/* Category */}
        <div>
          <label htmlFor="category" className="block text-sm font-semibold text-slate-700 mb-1.5">
            Kategori Laporan <span className="text-rose-500">*</span>
          </label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            className={`w-full px-4 py-2.5 rounded-xl border bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 transition-all duration-200 text-sm ${
              errors.category 
                ? 'border-rose-300 focus:ring-rose-250 focus:border-rose-450' 
                : 'border-slate-200 focus:ring-violet-200 focus:border-violet-400'
            }`}
          >
            <option value="">Pilih Kategori</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          {errors.category && (
            <p className="mt-1 text-xs text-rose-600 flex items-center gap-1">
              <AlertCircle className="h-3.5 w-3.5" /> {errors.category}
            </p>
          )}
        </div>

        {/* Content */}
        <div>
          <label htmlFor="content" className="block text-sm font-semibold text-slate-700 mb-1.5">
            Detail Laporan Pengaduan <span className="text-rose-500">*</span>
          </label>
          <textarea
            id="content"
            name="content"
            rows="5"
            value={formData.content}
            onChange={handleChange}
            placeholder="Jelaskan secara detail mengenai laporan pengaduan Anda, sertakan lokasi kejadian dan kendala yang dihadapi..."
            className={`w-full px-4 py-2.5 rounded-xl border bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 transition-all duration-200 text-sm ${
              errors.content 
                ? 'border-rose-300 focus:ring-rose-250 focus:border-rose-450' 
                : 'border-slate-200 focus:ring-violet-200 focus:border-violet-400'
            }`}
          ></textarea>
          {errors.content && (
            <p className="mt-1 text-xs text-rose-600 flex items-center gap-1">
              <AlertCircle className="h-3.5 w-3.5" /> {errors.content}
            </p>
          )}
        </div>

        {/* Image Upload Input */}
        <div>
          <label htmlFor="image" className="block text-sm font-semibold text-slate-700 mb-1.5">
            Foto Bukti Kejadian <span className="text-slate-400 font-normal">(Opsional, Maksimal 2MB)</span>
          </label>
          
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 rounded-xl bg-slate-50 text-slate-700 hover:bg-slate-100 cursor-pointer text-xs font-semibold transition-colors">
              <Camera className="h-4 w-4 text-slate-500" />
              Pilih Foto Bukti
              <input
                type="file"
                id="image"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
            
            {imagePreview && (
              <div className="relative h-20 w-20 rounded-xl overflow-hidden border border-slate-200 bg-slate-50 group">
                <img 
                  src={imagePreview} 
                  alt="Bukti Laporan" 
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={handleRemoveFile}
                  className="absolute top-1 right-1 p-1 bg-slate-900/60 hover:bg-rose-600/90 rounded-full text-white transition-colors"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
          </div>
          
          {errors.image && (
            <p className="mt-1.5 text-xs text-rose-600 flex items-center gap-1">
              <AlertCircle className="h-3.5 w-3.5" /> {errors.image}
            </p>
          )}
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={() => onCancel ? onCancel() : navigate(-1)}
            disabled={loading}
            className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-medium text-sm hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2.5 rounded-xl bg-violet-600 text-white font-medium text-sm hover:bg-violet-700 transition-colors shadow-md shadow-violet-600/10 flex items-center gap-2 disabled:opacity-70"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {isEdit ? 'Simpan Perubahan' : 'Kirim Laporan'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ComplaintForm;
