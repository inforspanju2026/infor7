import React, { useState } from 'react';
import { useCbt } from '../../hooks/useCbt';
import { 
  LayoutDashboard, 
  MonitorPlay, 
  Users, 
  Building2, 
  BookOpen, 
  Package, 
  BarChart3, 
  Activity, 
  ShieldCheck, 
  FileCode, 
  GraduationCap, 
  Clock, 
  CheckCircle2, 
  Layers, 
  KeyRound, 
  LogOut 
} from 'lucide-react';

import { ProktorRoom } from '../proktor/ProktorRoom';
import { StudentManagement } from './StudentManagement';
import { SchoolManagement } from './SchoolManagement';
import { QuestionBank } from './QuestionBank';
import { ExamPackages } from './ExamPackages';
import { GradingAnalysis } from './GradingAnalysis';
import { SystemHealthView } from '../teknisi/SystemHealth';
import { AuditLogsView } from './AuditLogs';
import { SqlDocumentation } from './SqlDocumentation';

interface AdminDashboardProps {
  initialTab?: string;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ initialTab = 'overview' }) => {
  const { state, store } = useCbt();
  const [activeTab, setActiveTab] = useState(initialTab);

  const user = state.currentUser;
  const participants = state.participants;

  // Stats
  const totalPeserta = state.students.length;
  const pesertaUjian = participants.filter((p) => p.status === 'sedang_ujian').length;
  const pesertaSelesai = participants.filter((p) => p.status === 'selesai' || p.status === 'waktu_habis').length;
  const totalSoal = state.questions.length;
  const totalPaket = state.examPackages.length;

  const roleNameMap: Record<string, string> = {
    super_admin: 'Super Administrator',
    admin_sekolah: 'Administrator Sekolah',
    operator: 'Operator CBT Sekolah',
    proktor: 'Proktor Pengawas Ujian',
    teknisi: 'Teknisi Jaringan & Server',
    guru: 'Guru / Tim Penyusun Soal',
    pengawas: 'Pengawas Ruang Ujian',
    peserta: 'Peserta Ujian',
  };

  const navItems = [
    { id: 'overview', label: 'Dashboard', icon: LayoutDashboard, roles: ['all'] },
    { id: 'proktor', label: 'Ruang Proktor', icon: MonitorPlay, roles: ['super_admin', 'admin_sekolah', 'proktor', 'teknisi'] },
    { id: 'peserta', label: 'Data Peserta', icon: Users, roles: ['super_admin', 'admin_sekolah', 'operator', 'proktor'] },
    { id: 'bank-soal', label: 'Bank Soal', icon: BookOpen, roles: ['super_admin', 'admin_sekolah', 'guru'] },
    { id: 'paket', label: 'Paket Ujian', icon: Package, roles: ['super_admin', 'admin_sekolah', 'guru', 'operator'] },
    { id: 'penilaian', label: 'Hasil & Analisis', icon: BarChart3, roles: ['super_admin', 'admin_sekolah', 'guru', 'operator'] },
    { id: 'sekolah', label: 'Sekolah & Kelas', icon: Building2, roles: ['super_admin', 'admin_sekolah'] },
    { id: 'teknisi', label: 'System Health', icon: Activity, roles: ['super_admin', 'teknisi', 'admin_sekolah'] },
    { id: 'audit', label: 'Audit Log', icon: ShieldCheck, roles: ['super_admin', 'admin_sekolah', 'teknisi'] },
    { id: 'sql', label: 'Skema Supabase', icon: FileCode, roles: ['super_admin', 'admin_sekolah', 'teknisi'] },
  ];

  const allowedNav = navItems.filter((item) => {
    if (item.roles.includes('all')) return true;
    if (!user) return false;
    return item.roles.includes(user.role);
  });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Admin Sub-bar */}
      <div className="bg-white border-b border-slate-200 px-4 sm:px-6 py-2.5 shadow-xs sticky top-16 z-20">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-500 font-medium">Masuk Sebagai:</span>
            <span className="text-xs font-bold text-slate-900">{user?.name}</span>
            <span className="text-[11px] px-2 py-0.5 rounded-full font-bold bg-blue-100 text-blue-800">
              {roleNameMap[user?.role || ''] || user?.role}
            </span>
          </div>

          <div className="flex items-center space-x-3 text-xs text-slate-500">
            <span>Sesi: <strong className="text-slate-800">Sesi 1 (Utama)</strong></span>
            <span>&bull;</span>
            <span>Tahun Ajaran: <strong className="text-slate-800">2026/2027</strong></span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 flex flex-col md:flex-row gap-6">
        {/* Left Sidebar Menu */}
        <aside className="w-full md:w-60 flex-shrink-0">
          <div className="bg-white rounded-2xl border border-slate-200 p-3 shadow-sm space-y-1 sticky top-32">
            <div className="px-3 py-2 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
              Menu Navigasi
            </div>
            {allowedNav.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center space-x-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}

            <div className="pt-3 border-t border-slate-100 mt-2">
              <button
                onClick={() => store.logout()}
                className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-red-600 hover:bg-red-50 transition"
              >
                <LogOut className="w-4 h-4" />
                <span>Keluar (Logout)</span>
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content Pane */}
        <main className="flex-1">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Welcome banner */}
              <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 rounded-2xl p-6 text-white shadow-md">
                <span className="text-xs uppercase font-extrabold tracking-widest text-blue-200">
                  Panel Administrator Asesmen
                </span>
                <h1 className="text-2xl font-black mt-1">Selamat Datang, {user?.name}</h1>
                <p className="text-xs text-blue-100 mt-1 max-w-2xl">
                  Sistem Asesmen SMPN 7 Pasuruan Terpadu berbasis Supabase Cloud & Local Sync.
                  Seluruh data peserta, sesi, dan jawaban siswa tersinkronisasi secara real-time.
                </p>
              </div>

              {/* Stats overview */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                  <span className="text-xs text-slate-500 font-medium">Total Siswa Terdaftar</span>
                  <div className="text-2xl font-black text-slate-800 mt-1">{totalPeserta}</div>
                  <span className="text-[11px] text-slate-400">Di {state.classes.length} Rombel Kelas</span>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                  <span className="text-xs text-emerald-600 font-semibold">Sedang Mengerjakan</span>
                  <div className="text-2xl font-black text-emerald-600 mt-1">{pesertaUjian}</div>
                  <span className="text-[11px] text-emerald-500">Live di ruang CBT</span>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                  <span className="text-xs text-blue-600 font-semibold">Telah Selesai</span>
                  <div className="text-2xl font-black text-blue-600 mt-1">{pesertaSelesai}</div>
                  <span className="text-[11px] text-blue-500">Tersimpan di Supabase</span>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                  <span className="text-xs text-slate-500 font-medium">Bank Soal Asesmen</span>
                  <div className="text-2xl font-black text-indigo-600 mt-1">{totalSoal}</div>
                  <span className="text-[11px] text-slate-400">{totalPaket} Paket Aktif</span>
                </div>
              </div>

              {/* Quick Actions Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div 
                  onClick={() => setActiveTab('proktor')}
                  className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-blue-400 hover:shadow-md transition cursor-pointer space-y-2"
                >
                  <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                    <MonitorPlay className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm">Masuk Ruang Proktor</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Pantau siswa secara realtime, reset sesi login, force submit, dan kontrol token ujian.
                  </p>
                </div>

                <div 
                  onClick={() => setActiveTab('peserta')}
                  className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-blue-400 hover:shadow-md transition cursor-pointer space-y-2"
                >
                  <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
                    <Users className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm">Cetak Kartu Peserta</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Cetak kartu ujian berfoto resmi dengan PIN dan barcode untuk seluruh peserta.
                  </p>
                </div>

                <div 
                  onClick={() => setActiveTab('bank-soal')}
                  className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-blue-400 hover:shadow-md transition cursor-pointer space-y-2"
                >
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm">Import Soal Excel</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Impor bank soal secara massal dari file template Excel/CSV dengan validasi error otomatis.
                  </p>
                </div>
              </div>

              {/* Recent Activity Mini-stream */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
                <div className="flex items-center justify-between border-b pb-3">
                  <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
                    Aktivitas Sistem Terkini
                  </h3>
                  <button onClick={() => setActiveTab('audit')} className="text-xs text-blue-600 hover:underline">
                    Lihat Selengkapnya &rarr;
                  </button>
                </div>

                <div className="space-y-2 text-xs">
                  {state.auditLogs.slice(0, 4).map((log) => (
                    <div key={log.id} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50">
                      <div className="flex items-center space-x-2">
                        <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                        <span className="font-bold text-slate-800">{log.action}:</span>
                        <span className="text-slate-600">{log.details}</span>
                      </div>
                      <span className="text-[11px] text-slate-400 font-mono">
                        {new Date(log.created_at).toLocaleTimeString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'proktor' && <ProktorRoom />}
          {activeTab === 'peserta' && <StudentManagement />}
          {activeTab === 'bank-soal' && <QuestionBank />}
          {activeTab === 'paket' && <ExamPackages />}
          {activeTab === 'penilaian' && <GradingAnalysis />}
          {activeTab === 'sekolah' && <SchoolManagement />}
          {activeTab === 'teknisi' && <SystemHealthView />}
          {activeTab === 'audit' && <AuditLogsView />}
          {activeTab === 'sql' && <SqlDocumentation />}
        </main>
      </div>
    </div>
  );
};
