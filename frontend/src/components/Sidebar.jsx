import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { 
  Home, 
  FileText, 
  PlusCircle, 
  LogOut, 
  User, 
  Shield, 
  X,
  Megaphone,
  Users
} from 'lucide-react';

const Sidebar = ({ isOpen, setIsOpen }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', to: '/', icon: Home, roles: ['admin', 'guru', 'user'] },
    { name: 'Pengaduan Saya', to: '/my-complaints', icon: FileText, roles: ['user'] },
    { name: 'Kelola Pengaduan', to: '/all-complaints', icon: Shield, roles: ['admin', 'guru'] },
    { name: 'Kelola Pengguna', to: '/users', icon: Users, roles: ['admin'] },
  ];

  return (
    <>
      {/* Mobile Sidebar Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-slate-900 text-slate-100 transition-transform duration-300 lg:static lg:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Header */}
        <div className="flex h-16 items-center justify-between px-6 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Megaphone className="h-6 w-6 text-violet-400 animate-pulse" />
            <span className="text-lg font-bold tracking-wider font-display bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
              SIPESEK
            </span>
          </div>
          <button 
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white lg:hidden"
            onClick={() => setIsOpen(false)}
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* User Profile Summary */}
        <div className="flex flex-col items-center border-b border-slate-800 p-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-violet-500/10 text-violet-400 ring-2 ring-violet-500/20">
            <User className="h-6 w-6" />
          </div>
          <span className="mt-3 font-semibold text-slate-200">{user?.username}</span>
          <span className="mt-1 text-xs font-medium uppercase tracking-wider text-slate-500 flex items-center gap-1">
            {user?.role === 'admin' ? (
              <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-emerald-400 text-[10px]">Admin</span>
            ) : user?.role === 'guru' ? (
              <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-amber-400 text-[10px]">Guru</span>
            ) : (
              <span className="rounded-full bg-blue-500/10 px-2 py-0.5 text-blue-400 text-[10px]">Siswa</span>
            )}
          </span>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 space-y-1 px-4 py-6 overflow-y-auto">
          {navItems
            .filter((item) => item.roles.includes(user?.role))
            .map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.name}
                  to={item.to}
                  onClick={() => setIsOpen(false)}
                  className={({ isActive }) => `
                    flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors
                    ${isActive 
                      ? 'bg-violet-600 text-white shadow-md shadow-violet-600/20' 
                      : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'}
                  `}
                >
                  <Icon className="h-5 w-5" />
                  {item.name}
                </NavLink>
              );
            })}
        </nav>

        {/* Footer */}
        <div className="border-t border-slate-800 p-4">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-rose-400 transition-colors hover:bg-rose-500/10 hover:text-rose-300"
          >
            <LogOut className="h-5 w-5" />
            Keluar Aplikasi
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
