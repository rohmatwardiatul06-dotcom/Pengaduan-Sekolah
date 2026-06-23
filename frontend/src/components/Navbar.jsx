import React from 'react';
import { Menu, User, Calendar } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const Navbar = ({ sidebarOpen, setSidebarOpen }) => {
  const { user } = useAuth();

  const getTodayDate = () => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date().toLocaleDateString('id-ID', options);
  };

  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white/80 backdrop-blur-md px-6 shadow-sm z-30">
      <div className="flex items-center gap-4">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-700 lg:hidden focus:outline-none"
        >
          <Menu className="h-6 w-6" />
        </button>
        <div>
          <h2 className="text-lg font-bold text-slate-800 tracking-tight hidden sm:block">Sistem Pengaduan Sekolah</h2>
          <h2 className="text-md font-bold text-slate-800 tracking-tight sm:hidden">SIPEKAN</h2>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Date Display */}
        <div className="hidden md:flex items-center gap-2 text-xs text-slate-400 font-medium">
          <Calendar className="h-4 w-4" />
          <span>{getTodayDate()}</span>
        </div>
        
        <div className="h-6 w-px bg-slate-200 hidden md:block"></div>

        {/* User Info */}
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-xs text-slate-400">Halo,</p>
            <p className="text-sm font-semibold text-slate-700">{user?.username}</p>
          </div>
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-violet-100 text-violet-600 ring-2 ring-violet-50">
            <User className="h-5 w-5" />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
