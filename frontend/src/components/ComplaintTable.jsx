import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Edit2, Trash2, Calendar, Folder, User, Search, RefreshCw } from 'lucide-react';

const ComplaintTable = ({ 
  complaints, 
  onDelete, 
  onStatusChange, 
  loading = false,
  showReporter = false 
}) => {
  const { user } = useAuth();
  
  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const categories = [
    'Fasilitas',
    'Akademik',
    'Disiplin & Bullying',
    'Administrasi & Keuangan'
  ];

  // Reset pagination on search/filter change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleCategoryChange = (e) => {
    setCategoryFilter(e.target.value);
    setCurrentPage(1);
  };

  const handleStatusChangeFilter = (e) => {
    setStatusFilter(e.target.value);
    setCurrentPage(1);
  };

  // Filter complaints list
  const filteredComplaints = complaints.filter((item) => {
    const matchesSearch = 
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.username && item.username.toLowerCase().includes(searchTerm.toLowerCase()));
      
    const matchesCategory = categoryFilter === '' || item.category === categoryFilter;
    const matchesStatus = statusFilter === '' || item.status === statusFilter;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Pagination calculation
  const totalPages = Math.ceil(filteredComplaints.length / itemsPerPage) || 1;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredComplaints.slice(indexOfFirstItem, indexOfLastItem);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 border border-amber-200">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse"></span>
            Tertunda
          </span>
        );
      case 'proses':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 border border-blue-200">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse"></span>
            Diproses
          </span>
        );
      case 'selesai':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
            Selesai
          </span>
        );
      case 'ditolak':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-700 border border-rose-200">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-500"></span>
            Ditolak
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Table Filters header */}
      <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row gap-4 justify-between items-center bg-slate-50/50">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="Cari laporan..."
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl bg-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-200 focus:border-violet-400 transition-all"
          />
        </div>
        
        <div className="flex flex-wrap w-full md:w-auto gap-3">
          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={handleCategoryChange}
            className="px-3 py-2 border border-slate-200 rounded-xl bg-white text-xs font-medium text-slate-600 focus:outline-none focus:ring-2 focus:ring-violet-200 transition-all"
          >
            <option value="">Semua Kategori</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={handleStatusChangeFilter}
            className="px-3 py-2 border border-slate-200 rounded-xl bg-white text-xs font-medium text-slate-600 focus:outline-none focus:ring-2 focus:ring-violet-200 transition-all"
          >
            <option value="">Semua Status</option>
            <option value="pending">Tertunda (Pending)</option>
            <option value="proses">Diproses</option>
            <option value="selesai">Selesai</option>
            <option value="ditolak">Ditolak</option>
          </select>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-sm text-slate-600">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 font-semibold text-slate-700">
              {showReporter && <th className="px-6 py-4">Pelapor</th>}
              <th className="px-6 py-4">Detail Laporan</th>
              <th className="px-6 py-4">Kategori</th>
              <th className="px-6 py-4">Tanggal Masuk</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={showReporter ? 6 : 5} className="px-6 py-12 text-center text-slate-400">
                  <div className="flex justify-center items-center gap-2">
                    <RefreshCw className="h-5 w-5 animate-spin text-violet-500" />
                    <span>Memuat data pengaduan...</span>
                  </div>
                </td>
              </tr>
            ) : currentItems.length === 0 ? (
              <tr>
                <td colSpan={showReporter ? 6 : 5} className="px-6 py-12 text-center text-slate-400">
                  Tidak ditemukan laporan pengaduan.
                </td>
              </tr>
            ) : (
              currentItems.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                  {/* Reporter Username (for Admin view) */}
                  {showReporter && (
                    <td className="px-6 py-4 font-medium text-slate-900">
                      <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
                          <User className="h-4 w-4" />
                        </div>
                        <span>{item.username}</span>
                      </div>
                    </td>
                  )}
                  
                  {/* Title and Short Content */}
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-semibold text-slate-800 line-clamp-1">{item.title}</p>
                      <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">{item.content}</p>
                      {item.image_url && (
                        <div className="mt-2">
                          <a 
                            href={item.image_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[10px] font-semibold text-violet-600 hover:text-violet-500 hover:underline"
                          >
                            <img 
                              src={item.image_url} 
                              alt="Bukti Foto" 
                              className="h-8 w-8 rounded-lg object-cover border border-slate-200 mr-1"
                            />
                            <span>Lihat Bukti Foto</span>
                          </a>
                        </div>
                      )}
                    </div>
                  </td>
                  
                  {/* Category */}
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
                      <Folder className="h-3.5 w-3.5 text-slate-400" />
                      {item.category}
                    </span>
                  </td>
                  
                  {/* Date */}
                  <td className="px-6 py-4 text-slate-500 text-xs">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-slate-400" />
                      {formatDate(item.created_at)}
                    </div>
                  </td>
                  
                  {/* Status Badge or Admin Selector */}
                  <td className="px-6 py-4">
                    {user?.role === 'admin' ? (
                      <select
                        value={item.status}
                        onChange={(e) => onStatusChange(item.id, e.target.value)}
                        className="text-xs font-semibold rounded-lg bg-slate-50 border border-slate-200 px-2 py-1 text-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-200"
                      >
                        <option value="pending">Tertunda</option>
                        <option value="proses">Diproses</option>
                        <option value="selesai">Selesai</option>
                        <option value="ditolak">Ditolak</option>
                      </select>
                    ) : (
                      getStatusBadge(item.status)
                    )}
                  </td>
                  
                  {/* Actions */}
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {user?.role !== 'admin' && item.status === 'pending' ? (
                        <>
                          <Link
                            to={`/edit/${item.id}`}
                            className="p-1 text-slate-400 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition-colors"
                            title="Edit Laporan"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Link>
                          <button
                            onClick={() => onDelete(item.id)}
                            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Hapus Laporan"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </>
                      ) : (
                        <span className="text-xs font-medium text-slate-400 select-none">
                          {user?.role === 'admin' ? 'Kelola Status' : 'Terkunci'}
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {filteredComplaints.length > itemsPerPage && (
        <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
          <span className="text-xs font-medium text-slate-500">
            Menampilkan {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, filteredComplaints.length)} dari {filteredComplaints.length} laporan
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium bg-white text-slate-600 disabled:opacity-50 transition-all hover:bg-slate-50"
            >
              Sebelumnya
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium bg-white text-slate-600 disabled:opacity-50 transition-all hover:bg-slate-50"
            >
              Berikutnya
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComplaintTable;
