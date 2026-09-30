import React, { useState } from 'react';
import { useCbt } from '../../hooks/useCbt';
import { 
  GraduationCap, 
  User, 
  LogOut, 
  Database, 
  Wifi, 
  WifiOff, 
  ShieldCheck, 
  LayoutDashboard, 
  MonitorPlay, 
  BookOpen, 
  Users
} from 'lucide-react';
import { SupabaseConfigModal } from './SupabaseConfigModal';

interface HeaderProps {
  onOpenStudentLogin?: () => void;
  onOpenStaffLogin?: () => void;
  activeTab?: string;
  setActiveTab?: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenStudentLogin,
  onOpenStaffLogin,
  activeTab,
  setActiveTab,
}) => {
  const { state, store } = useCbt();
  const [configModalOpen, setConfigModalOpen] = useState(false);
  const user = state.currentUser;

  const roleLabels: Record<string, string> = {
    super_admin: 'Super Admin',
    admin_sekolah: 'Admin Sekolah',
    operator: 'Operator',
    proktor: 'Proktor',
    teknisi: 'Teknisi',
    guru: 'Guru / Penyusun Soal',
    pengawas: 'Pengawas Ruang',
    peserta: 'Peserta Ujian',
  };

  return (
    <>
      <header className="bg-slate-900 text-white sticky top-0 z-40 border-b border-slate-800 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left: Brand & School info */}
            <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab && setActiveTab('home')}>
              <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white shadow-sm ring-1 ring-blue-400/30">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-extrabold text-base tracking-tight text-white">CBT SMPN 7 PASURUAN</span>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-400/30">
                    2026/2027
                  </span>
                </div>
                <div className="text-xs text-slate-300 font-medium truncate max-w-xs sm:max-w-md">
                  {state.school.name} &bull; NPSN: {state.school.npsn}
                </div>
              </div>
            </div>

            {/* Middle: Navigation for logged in staff */}
            {user && user.role !== 'peserta' && setActiveTab && (
              <nav className="hidden md:flex items-center space-x-1">
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors flex items-center space-x-1.5 ${
                    activeTab === 'dashboard' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  <span>Dashboard</span>
                </button>

                {(user.role === 'proktor' || user.role === 'admin_sekolah' || user.role === 'super_admin') && (
                  <button
                    onClick={() => setActiveTab('proktor')}
                    className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors flex items-center space-x-1.5 ${
                      activeTab === 'proktor' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    <MonitorPlay className="w-3.5 h-3.5" />
                    <span>Ruang Proktor</span>
                  </button>
                )}

                {(user.role === 'guru' || user.role === 'admin_sekolah' || user.role === 'super_admin') && (
                  <button
                    onClick={() => setActiveTab('bank-soal')}
                    className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors flex items-center space-x-1.5 ${
                      activeTab === 'bank-soal' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Bank Soal</span>
                  </button>
                )}

                {(user.role === 'admin_sekolah' || user.role === 'operator' || user.role === 'super_admin') && (
                  <button
                    onClick={() => setActiveTab('peserta')}
                    className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors flex items-center space-x-1.5 ${
                      activeTab === 'peserta' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>Data Peserta</span>
                  </button>
                )}
              </nav>
            )}

            {/* Right: Status indicators & Profile / Login */}
            <div className="flex items-center space-x-3">
              {/* Database / Supabase indicator */}
              <button
                onClick={() => setConfigModalOpen(true)}
                title="Status Sinkronisasi Database Supabase"
                className="flex items-center space-x-1.5 text-xs px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 transition text-slate-300"
              >
                <Database className="w-3.5 h-3.5 text-blue-400" />
                <span className="hidden sm:inline font-mono">Supabase DB</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              </button>

              {/* Network Status */}
              <div 
                className="hidden sm:flex items-center space-x-1 text-xs text-slate-300"
                title={state.networkStatus === 'online' ? 'Koneksi Stabil' : 'Mode Offline / Tersimpan Lokal'}
              >
                {state.networkStatus === 'online' ? (
                  <>
                    <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-[11px] text-emerald-400 font-mono">Online</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="w-3.5 h-3.5 text-amber-400" />
                    <span className="text-[11px] text-amber-400 font-mono">Offline Sync</span>
                  </>
                )}
              </div>

              {/* User Account / Login button */}
              {user ? (
                <div className="flex items-center space-x-2">
                  <div className="hidden sm:block text-right">
                    <div className="text-xs font-bold text-white leading-tight">{user.name}</div>
                    <div className="text-[10px] text-blue-300 font-medium">{roleLabels[user.role] || user.role}</div>
                  </div>
                  <button
                    onClick={() => store.logout()}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-red-900/60 text-slate-300 hover:text-red-200 border border-slate-700 transition"
                    title="Keluar / Logout"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  {onOpenStudentLogin && (
                    <button
                      onClick={onOpenStudentLogin}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-md text-xs font-bold transition shadow-sm"
                    >
                      Login Peserta
                    </button>
                  )}
                  {onOpenStaffLogin && (
                    <button
                      onClick={onOpenStaffLogin}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-md text-xs font-medium border border-slate-700 transition"
                    >
                      Login Petugas
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Supabase Connection & SQL Migration Modal */}
      {configModalOpen && (
        <SupabaseConfigModal onClose={() => setConfigModalOpen(false)} />
      )}
    </>
  );
};

export const Footer: React.FC = () => {
  const { state } = useCbt();

  return (
    <footer className="bg-slate-900 text-slate-400 text-xs py-6 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <div className="font-semibold text-slate-200">{state.school.name}</div>
          <div className="text-slate-400 text-[11px] mt-0.5">
            Sistem Asesmen SMPN 7 Pasuruan &bull; Pusat Komputer & Evaluasi Pembelajaran (SPANJU)
          </div>
        </div>
        <div className="flex items-center space-x-4 text-[11px] text-slate-400">
          <span>Engine CBT v2.4 (Supabase Realtime)</span>
          <span>&bull;</span>
          <span className="flex items-center space-x-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            <span>Server Ready</span>
          </span>
          <span>&bull;</span>
          <span>© 2026 Kemdikbudristek / Disdik</span>
        </div>
      </div>
    </footer>
  );
};
