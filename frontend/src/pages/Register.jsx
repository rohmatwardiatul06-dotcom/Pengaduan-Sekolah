import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { AlertCircle, CheckCircle2, Loader2, UserPlus, Megaphone } from 'lucide-react';

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('user'); // Default to user, but allow selection for testing
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverMsg, setServerMsg] = useState({ type: '', text: '' });
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const validate = () => {
    const tempErrors = {};
    if (!username.trim()) {
      tempErrors.username = 'Username wajib diisi.';
    } else if (username.trim().length < 3) {
      tempErrors.username = 'Username minimal 3 karakter.';
    }

    if (!email.trim()) {
      tempErrors.email = 'Email wajib diisi.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      tempErrors.email = 'Format email tidak valid.';
    }

    if (!password) {
      tempErrors.password = 'Password wajib diisi.';
    } else if (password.length < 6) {
      tempErrors.password = 'Password minimal 6 karakter.';
    }

    if (password !== confirmPassword) {
      tempErrors.confirmPassword = 'Konfirmasi password tidak cocok.';
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setServerMsg({ type: '', text: '' });

    try {
      await register(username.trim(), email.trim(), password, role);
      setServerMsg({
        type: 'success',
        text: 'Pendaftaran berhasil! Mengalihkan ke halaman masuk dalam 2 detik...'
      });
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error) {
      const msg = error.response?.data?.message || 'Registrasi gagal. Silakan coba kembali.';
      setServerMsg({ type: 'error', text: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        {/* Brand/Header */}
        <div className="flex flex-col items-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-600 text-white shadow-lg shadow-violet-600/20">
            <Megaphone className="h-6 w-6" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold tracking-tight text-slate-900 font-display">
            Daftar Akun Baru
          </h2>
          <p className="mt-2 text-center text-sm text-slate-500">
            Sistem Informasi Pengaduan Sekolah (SIPEKAN)
          </p>
        </div>

        {/* Card Container */}
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
          {serverMsg.text && (
            <div className={`mb-6 p-4 rounded-xl flex items-start gap-2.5 text-sm ${
              serverMsg.type === 'success' 
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}>
              {serverMsg.type === 'success' ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
              )}
              <span>{serverMsg.text}</span>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* Username */}
            <div>
              <label htmlFor="username" className="block text-sm font-semibold text-slate-700 mb-1">
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  if (errors.username) setErrors(prev => ({ ...prev, username: '' }));
                }}
                placeholder="nama_lengkap"
                className={`w-full px-4 py-2 rounded-xl border bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 transition-all duration-200 text-sm ${
                  errors.username 
                    ? 'border-rose-300 focus:ring-rose-200 focus:border-rose-400' 
                    : 'border-slate-200 focus:ring-violet-200 focus:border-violet-400'
                }`}
              />
              {errors.username && (
                <p className="mt-1 text-xs text-rose-600 flex items-center gap-1">
                  <AlertCircle className="h-3.5 w-3.5" /> {errors.username}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors(prev => ({ ...prev, email: '' }));
                }}
                placeholder="nama@sekolah.sch.id"
                className={`w-full px-4 py-2 rounded-xl border bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 transition-all duration-200 text-sm ${
                  errors.email 
                    ? 'border-rose-300 focus:ring-rose-200 focus:border-rose-400' 
                    : 'border-slate-200 focus:ring-violet-200 focus:border-violet-400'
                }`}
              />
              {errors.email && (
                <p className="mt-1 text-xs text-rose-600 flex items-center gap-1">
                  <AlertCircle className="h-3.5 w-3.5" /> {errors.email}
                </p>
              )}
            </div>

            {/* Role (for demo and testing authorization) */}
            <div>
              <label htmlFor="role" className="block text-sm font-semibold text-slate-700 mb-1">
                Pilih Peran (Role) untuk Pengujian
              </label>
              <select
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-4 py-2 rounded-xl border bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-violet-200 focus:border-violet-400 transition-all duration-200 text-sm border-slate-200"
              >
                <option value="user">Siswa / User Biasa</option>
                <option value="admin">Admin Sekolah (Verifikator)</option>
              </select>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-slate-700 mb-1">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) setErrors(prev => ({ ...prev, password: '' }));
                }}
                placeholder="min 6 karakter"
                className={`w-full px-4 py-2 rounded-xl border bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 transition-all duration-200 text-sm ${
                  errors.password 
                    ? 'border-rose-300 focus:ring-rose-200 focus:border-rose-400' 
                    : 'border-slate-200 focus:ring-violet-200 focus:border-violet-400'
                }`}
              />
              {errors.password && (
                <p className="mt-1 text-xs text-rose-600 flex items-center gap-1">
                  <AlertCircle className="h-3.5 w-3.5" /> {errors.password}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-semibold text-slate-700 mb-1">
                Konfirmasi Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (errors.confirmPassword) setErrors(prev => ({ ...prev, confirmPassword: '' }));
                }}
                placeholder="masukkan kembali password"
                className={`w-full px-4 py-2 rounded-xl border bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 transition-all duration-200 text-sm ${
                  errors.confirmPassword 
                    ? 'border-rose-300 focus:ring-rose-200 focus:border-rose-400' 
                    : 'border-slate-200 focus:ring-violet-200 focus:border-violet-400'
                }`}
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-xs text-rose-600 flex items-center gap-1">
                  <AlertCircle className="h-3.5 w-3.5" /> {errors.confirmPassword}
                </p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center gap-2 px-4 py-2.5 bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold rounded-xl transition-all shadow-md shadow-violet-600/10 disabled:opacity-75 pt-3"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <UserPlus className="h-5 w-5" />
              )}
              Daftar Akun
            </button>
          </form>

          {/* Helper Login Link */}
          <div className="mt-6 text-center text-sm text-slate-500 border-t border-slate-100 pt-6">
            Sudah punya akun?{' '}
            <Link to="/login" className="font-semibold text-violet-600 hover:text-violet-500">
              Masuk Sekarang
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
