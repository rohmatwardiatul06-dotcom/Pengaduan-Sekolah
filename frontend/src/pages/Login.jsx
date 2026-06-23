import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { AlertCircle, Loader2, LogIn, Megaphone } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const validate = () => {
    const tempErrors = {};
    if (!email.trim()) {
      tempErrors.email = 'Email wajib diisi.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      tempErrors.email = 'Format email tidak valid.';
    }
    
    if (!password) {
      tempErrors.password = 'Password wajib diisi.';
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setErrorMsg('');

    try {
      await login(email.trim(), password);
      navigate('/');
    } catch (error) {
      const msg = error.response?.data?.message || 'Login gagal. Periksa kembali email dan password Anda.';
      setErrorMsg(msg);
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
            Masuk Aplikasi
          </h2>
          <p className="mt-2 text-center text-sm text-slate-500">
            Sistem Informasi Pengaduan Sekolah (SIPEKAN)
          </p>
        </div>

        {/* Card Container */}
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
          {errorMsg && (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-sm flex items-start gap-2.5">
              <AlertCircle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-1.5">
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
                className={`w-full px-4 py-2.5 rounded-xl border bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 transition-all duration-200 text-sm ${
                  errors.email 
                    ? 'border-rose-300 focus:ring-rose-200 focus:border-rose-400' 
                    : 'border-slate-200 focus:ring-violet-200 focus:border-violet-400'
                }`}
              />
              {errors.email && (
                <p className="mt-1 text-xs text-rose-655 flex items-center gap-1">
                  <AlertCircle className="h-3.5 w-3.5" /> {errors.email}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-slate-700 mb-1.5">
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
                placeholder="••••••••"
                className={`w-full px-4 py-2.5 rounded-xl border bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 transition-all duration-200 text-sm ${
                  errors.password 
                    ? 'border-rose-300 focus:ring-rose-200 focus:border-rose-400' 
                    : 'border-slate-200 focus:ring-violet-200 focus:border-violet-400'
                }`}
              />
              {errors.password && (
                <p className="mt-1 text-xs text-rose-655 flex items-center gap-1">
                  <AlertCircle className="h-3.5 w-3.5" /> {errors.password}
                </p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center gap-2 px-4 py-2.5 bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold rounded-xl transition-all shadow-md shadow-violet-600/10 disabled:opacity-75"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <LogIn className="h-5 w-5" />
              )}
              Masuk
            </button>
          </form>

          {/* Helper Register Link */}
          <div className="mt-6 text-center text-sm text-slate-500 border-t border-slate-100 pt-6">
            Belum punya akun?{' '}
            <Link to="/register" className="font-semibold text-violet-600 hover:text-violet-500">
              Daftar Akun Baru
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
