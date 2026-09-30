import React, { useState } from 'react';
import { useCbt } from '../../hooks/useCbt';
import { 
  GraduationCap, 
  UserCheck, 
  ShieldCheck, 
  Clock, 
  Calendar, 
  FileText, 
  CheckCircle2, 
  Wifi, 
  Server, 
  AlertCircle, 
  Sparkles, 
  ChevronRight, 
  HelpCircle, 
  BookOpen, 
  Layers, 
  X,
  Database
} from 'lucide-react';
import { DEMO_ACCOUNTS } from '../../data/seedData';
import { UserRole } from '../../types';

interface LandingPageProps {
  onOpenStudentLogin: () => void;
  onOpenStaffLogin: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onOpenStudentLogin,
  onOpenStaffLogin,
}) => {
  const { state, store } = useCbt();
  const [rulesModalOpen, setRulesModalOpen] = useState(false);

  const school = state.school;
  const packages = state.examPackages;
  const sessions = state.examSessions;

  const handleQuickRoleLogin = (role: UserRole, email: string) => {
    store.loginAs(role, email);
  };

  return (
    <div className="space-y-12 pb-12">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-blue-950 to-slate-900 text-white py-16 sm:py-24 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            {/* School & Badge */}
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-400/20 text-blue-300 text-xs font-semibold">
              <GraduationCap className="w-4 h-4 text-blue-400" />
              <span>{school.name} &bull; NPSN {school.npsn}</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
              Sistem Asesmen SMPN 7 Pasuruan
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-teal-300">
                Tahun Ajaran 2026/2027
              </span>
            </h1>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl mx-auto">
              Platform Computer Based Test (CBT) terstandarisasi untuk simulasi dan pelaksanaan asesmen SMPN 7 Pasuruan. Dilengkapi sinkronisasi data Supabase Realtime, offline autosave, dan pemantauan proktor terpadu.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                onClick={onOpenStudentLogin}
                className="px-6 py-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-extrabold shadow-lg shadow-blue-500/25 transition flex items-center space-x-2 group"
              >
                <UserCheck className="w-5 h-5" />
                <span>Masuk Portal Peserta Ujian</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition" />
              </button>

              <button
                onClick={onOpenStaffLogin}
                className="px-5 py-3.5 bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 border border-slate-700 rounded-xl text-sm font-semibold transition flex items-center space-x-2"
              >
                <ShieldCheck className="w-5 h-5 text-blue-400" />
                <span>Login Petugas / Proktor</span>
              </button>

              <button
                onClick={() => setRulesModalOpen(true)}
                className="px-4 py-3.5 text-xs text-slate-400 hover:text-white transition flex items-center space-x-1"
              >
                <HelpCircle className="w-4 h-4" />
                <span>Tata Tertib Ujian</span>
              </button>
            </div>
          </div>
        </div>

        {/* Background glow circle */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-blue-600/10 blur-[120px] pointer-events-none rounded-full"></div>
      </section>

      {/* 2. SERVER & NETWORK STATUS TICKER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-md grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Server className="w-4 h-4" />
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Status Server CBT</span>
              <span className="font-bold text-slate-800 flex items-center space-x-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Aktif & Siap Melayani</span>
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Database Engine</span>
              <span className="font-bold text-slate-800">Supabase PostgreSQL</span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
              <Wifi className="w-4 h-4" />
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Realtime Channel</span>
              <span className="font-bold text-slate-800">WebSocket Connected</span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Token Sesi 1</span>
              <span className="font-mono font-black text-amber-800 text-sm">
                {packages[0]?.token || 'SIMULA1'}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. QUICK ROLE SWITCHER FOR DEMO / EVALUATION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/80 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-blue-600" />
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Akses Cepat Pengujian Role (1-Klik Tanpa Ketik)</h3>
                <p className="text-xs text-slate-600">
                  Uji langsung seluruh hak akses sistem CBT: Proktor, Admin, Guru, Siswa, Teknisi & Super Admin.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {DEMO_ACCOUNTS.map((acc) => (
              <button
                key={acc.role}
                onClick={() => {
                  if (acc.role === 'peserta') {
                    onOpenStudentLogin();
                  } else {
                    handleQuickRoleLogin(acc.role, (acc as any).email);
                  }
                }}
                className="p-3 bg-white hover:bg-blue-600 hover:text-white border border-slate-200 hover:border-blue-600 rounded-xl text-left transition shadow-xs group"
              >
                <div className="font-bold text-xs text-slate-900 group-hover:text-white">{acc.label}</div>
                <div className="text-[10px] text-slate-500 group-hover:text-blue-100 line-clamp-1 mt-0.5">{acc.desc}</div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 4. ACTIVE EXAM PACKAGES & SCHEDULE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Jadwal & Paket Asesmen Aktif</h2>
            <p className="text-xs text-slate-500">Mata pelajaran dan sesi ujian yang dijadwalkan</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {packages.map((pkg) => (
            <div key={pkg.id} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <span className={`px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                    pkg.exam_type === 'simulation' ? 'bg-indigo-100 text-indigo-800' : 'bg-rose-100 text-rose-800'
                  }`}>
                    {pkg.exam_type === 'simulation' ? 'SIMULASI MANDIRI' : 'ASESMEN UTAMA'}
                  </span>
                  <h3 className="font-extrabold text-base text-slate-900 mt-2">{pkg.title}</h3>
                  <div className="text-xs text-slate-500">{pkg.subject_name}</div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Token Ujian:</span>
                  <span className="font-mono text-xl font-black text-blue-700">{pkg.token}</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 p-3 bg-slate-50 rounded-xl text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px]">Durasi Ujian:</span>
                  <span className="font-bold text-slate-800 flex items-center space-x-1">
                    <Clock className="w-3.5 h-3.5 text-blue-600" />
                    <span>{pkg.duration_minutes} Menit</span>
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Jumlah Butir:</span>
                  <span className="font-bold text-slate-800 flex items-center space-x-1">
                    <FileText className="w-3.5 h-3.5 text-blue-600" />
                    <span>{pkg.total_questions} Soal</span>
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Tahun Ajaran:</span>
                  <span className="font-bold text-slate-800 flex items-center space-x-1">
                    <Calendar className="w-3.5 h-3.5 text-blue-600" />
                    <span>{pkg.academic_year}</span>
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-slate-500">
                  Target: <strong className="text-slate-800">Kelas 9 SMP</strong>
                </span>

                <button
                  onClick={onOpenStudentLogin}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition flex items-center space-x-1 shadow-sm"
                >
                  <span>Mulai Ujian</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. TATA TERTIB MODAL */}
      {rulesModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-4 text-slate-900 border border-slate-200">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-base">Tata Tertib Asesmen SMPN 7 Pasuruan</h3>
              </div>
              <button onClick={() => setRulesModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs leading-relaxed text-slate-700 max-h-80 overflow-y-auto pr-1">
              <div className="flex items-start space-x-2">
                <span className="font-bold text-blue-600">1.</span>
                <span>Peserta wajib membawa <strong>Kartu Peserta Ujian</strong> yang memuat Nomor Peserta dan PIN.</span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="font-bold text-blue-600">2.</span>
                <span>Peserta login menggunakan Nomor Peserta dan PIN yang tertera pada kartu, serta memasukkan Token Ujian yang diberikan oleh Proktor.</span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="font-bold text-blue-600">3.</span>
                <span>Dilarang keras membuka tab baru, mencari kunci jawaban, atau berpindah jendela selama ujian. Sistem mencatat setiap perpindahan tab ke audit log proktor.</span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="font-bold text-blue-600">4.</span>
                <span>Setiap jawaban yang Anda pilih otomatis tersimpan ke server secara real-time. Jika koneksi terputus, jawaban tetap aman di perangkat lokal dan disinkronkan kembali saat terhubung.</span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="font-bold text-blue-600">5.</span>
                <span>Waktu pengerjaan berjalan otomatis. Jika waktu habis, sistem akan melakukan submit otomatis terhadap seluruh jawaban yang telah dipilih.</span>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setRulesModalOpen(false)}
                className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800"
              >
                Saya Pahami & Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
