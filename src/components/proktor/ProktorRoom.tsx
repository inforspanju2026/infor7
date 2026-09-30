import React, { useState } from 'react';
import { useCbt } from '../../hooks/useCbt';
import { ParticipantExamStatus } from '../../types';
import { 
  MonitorPlay, 
  KeyRound, 
  RotateCcw, 
  Send, 
  Clock, 
  Plus, 
  CheckCircle2, 
  AlertTriangle, 
  WifiOff, 
  Search, 
  Filter, 
  Copy, 
  RefreshCw, 
  Eye, 
  Activity, 
  Sparkles,
  SlidersHorizontal,
  ShieldCheck
} from 'lucide-react';

export const ProktorRoom: React.FC = () => {
  const { state, store } = useCbt();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedSessionId, setSelectedSessionId] = useState(state.examSessions[0]?.id || '');
  const [copiedToken, setCopiedToken] = useState(false);
  const [extendModal, setExtendModal] = useState<{ open: boolean; participantId: string; name: string } | null>(null);
  const [extendMinutes, setExtendMinutes] = useState(15);

  const activePackage = state.examPackages[0];
  const participants = state.participants;

  // Filter participants
  const filteredParticipants = participants.filter((p) => {
    const matchSearch = p.student_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        p.participant_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        p.class_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  // Calculate live stats
  const total = participants.length;
  const sedangUjian = participants.filter((p) => p.status === 'sedang_ujian').length;
  const selesai = participants.filter((p) => p.status === 'selesai' || p.status === 'waktu_habis').length;
  const terputus = participants.filter((p) => p.status === 'koneksi_terputus').length;
  const belumLogin = participants.filter((p) => p.status === 'belum_login' || p.status === 'login').length;

  const handleCopyToken = (t: string) => {
    navigator.clipboard.writeText(t);
    setCopiedToken(true);
    setTimeout(() => setCopiedToken(false), 2000);
  };

  const handleGenerateToken = () => {
    if (activePackage) {
      store.proctorGenerateToken(activePackage.id);
    }
  };

  const handleToggleToken = (active: boolean) => {
    if (activePackage) {
      store.proctorToggleToken(activePackage.id, active);
    }
  };

  const confirmExtend = () => {
    if (extendModal) {
      store.proctorExtendMinutes(extendModal.participantId, extendMinutes);
      setExtendModal(null);
    }
  };

  const renderStatusBadge = (status: ParticipantExamStatus) => {
    switch (status) {
      case 'sedang_ujian':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Sedang Ujian</span>
          </span>
        );
      case 'selesai':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
            <CheckCircle2 className="w-3 h-3 text-blue-600" />
            <span>Selesai</span>
          </span>
        );
      case 'waktu_habis':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-200 text-slate-800">
            <Clock className="w-3 h-3" />
            <span>Waktu Habis</span>
          </span>
        );
      case 'koneksi_terputus':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-800">
            <WifiOff className="w-3 h-3 text-red-600" />
            <span>Terputus</span>
          </span>
        );
      case 'login':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
            <span>Siap Mulai</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
            <span>Belum Login</span>
          </span>
        );
    }
  };

  const formatRemaining = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-2xl p-6 text-white shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-blue-300 text-xs font-bold uppercase tracking-wider mb-1">
            <MonitorPlay className="w-4 h-4 text-blue-400" />
            <span>Pusat Kendali Pengawasan Ujian</span>
          </div>
          <h1 className="text-2xl font-black">Ruang Monitoring Proktor (Realtime)</h1>
          <p className="text-xs text-slate-300 mt-1">
            Pantau status kandidat, sinkronisasi Supabase realtime, kontrol token, dan audit log sesi ujian.
          </p>
        </div>

        {/* Token Management Widget */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 flex items-center space-x-4">
          <div>
            <span className="text-[10px] text-blue-200 uppercase font-bold tracking-wider block">Token Ujian Aktif</span>
            <div className="font-mono text-2xl font-black tracking-widest text-emerald-300">
              {activePackage?.token || 'SIMULA1'}
            </div>
            <div className="text-[10px] text-slate-300">
              Status: <span className={activePackage?.is_token_active ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold'}>
                {activePackage?.is_token_active ? 'AKTIF' : 'NONAKTIF'}
              </span>
            </div>
          </div>

          <div className="flex flex-col space-y-1.5">
            <button
              onClick={() => handleCopyToken(activePackage?.token || '')}
              className="px-2.5 py-1 bg-white/20 hover:bg-white/30 text-white rounded text-xs font-semibold flex items-center space-x-1 transition"
            >
              <Copy className="w-3 h-3" />
              <span>{copiedToken ? 'Tersalin!' : 'Salin'}</span>
            </button>
            <button
              onClick={handleGenerateToken}
              className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-semibold flex items-center space-x-1 transition shadow-sm"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Rilis Baru</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Top Statistics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs text-slate-500 font-medium">Total Peserta</span>
          <div className="text-2xl font-black text-slate-800 mt-1">{total}</div>
          <span className="text-[11px] text-slate-400">Terdaftar di sesi</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs text-emerald-600 font-semibold">Sedang Mengerjakan</span>
          <div className="text-2xl font-black text-emerald-600 mt-1">{sedangUjian}</div>
          <span className="text-[11px] text-emerald-500">Live mengerjakan</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs text-blue-600 font-semibold">Telah Selesai</span>
          <div className="text-2xl font-black text-blue-600 mt-1">{selesai}</div>
          <span className="text-[11px] text-blue-500">Jawaban tersimpan</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs text-red-600 font-semibold">Putus Koneksi</span>
          <div className="text-2xl font-black text-red-600 mt-1">{terputus}</div>
          <span className="text-[11px] text-red-500">Perlu perhatian</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs text-slate-500 font-medium">Belum Login</span>
          <div className="text-2xl font-black text-slate-600 mt-1">{belumLogin}</div>
          <span className="text-[11px] text-slate-400">Menunggu sesi</span>
        </div>
      </div>

      {/* 3. Search & Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Cari nama, nomor peserta, kelas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <Filter className="w-3.5 h-3.5 text-slate-500" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Semua Status Peserta</option>
            <option value="sedang_ujian">Sedang Ujian</option>
            <option value="selesai">Selesai</option>
            <option value="koneksi_terputus">Koneksi Terputus</option>
            <option value="login">Siap Mulai</option>
            <option value="belum_login">Belum Login</option>
          </select>
        </div>
      </div>

      {/* 4. Live Monitoring Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="p-3.5 w-12 text-center">No</th>
                <th className="p-3.5">Peserta</th>
                <th className="p-3.5">Kelas</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5">Progress</th>
                <th className="p-3.5">Sisa Waktu</th>
                <th className="p-3.5">Nilai Akhir</th>
                <th className="p-3.5">Keamanan</th>
                <th className="p-3.5 text-center">Aksi Proktor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredParticipants.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-slate-400">
                    Tidak ada peserta yang cocok dengan filter pencarian.
                  </td>
                </tr>
              ) : (
                filteredParticipants.map((p, idx) => {
                  const pct = Math.round((p.answers_count / (p.total_questions || 7)) * 100);

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition">
                      <td className="p-3.5 text-center font-mono font-medium text-slate-500">
                        {idx + 1}
                      </td>
                      <td className="p-3.5">
                        <div className="font-bold text-slate-900">{p.student_name}</div>
                        <div className="text-[11px] text-slate-500 font-mono flex items-center space-x-2">
                          <span>{p.participant_number}</span>
                          <span>&bull;</span>
                          <span>NISN: {p.nisn}</span>
                        </div>
                      </td>
                      <td className="p-3.5 font-semibold text-slate-700">
                        {p.class_name}
                      </td>
                      <td className="p-3.5">
                        {renderStatusBadge(p.status)}
                      </td>
                      <td className="p-3.5">
                        <div className="w-28 space-y-1">
                          <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                            <span>{p.answers_count}/{p.total_questions || 7} Soal</span>
                            <span>{pct}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                            <div 
                              className={`h-full ${pct === 100 ? 'bg-blue-600' : 'bg-emerald-500'}`} 
                              style={{ width: `${pct}%` }}
                            ></div>
                          </div>
                          {p.doubt_count > 0 && (
                            <span className="text-[10px] text-amber-600 font-semibold block">
                              *Ragu: {p.doubt_count}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-3.5 font-mono text-slate-700">
                        {p.status === 'sedang_ujian' ? (
                          <span className="font-bold text-emerald-700">{formatRemaining(p.remaining_seconds)}</span>
                        ) : p.status === 'selesai' ? (
                          <span className="text-slate-400">0m 00s</span>
                        ) : (
                          <span className="text-slate-400">{formatRemaining(p.allocated_seconds)}</span>
                        )}
                        {p.additional_minutes > 0 && (
                          <span className="text-[10px] text-blue-600 block">+{p.additional_minutes}m khusus</span>
                        )}
                      </td>
                      <td className="p-3.5 font-mono font-bold">
                        {p.score !== undefined && p.score !== null ? (
                          <span className={`px-2 py-0.5 rounded ${p.score >= 75 ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                            {p.score}
                          </span>
                        ) : (
                          <span className="text-slate-400 font-normal">-</span>
                        )}
                      </td>
                      <td className="p-3.5 text-[11px]">
                        {p.tab_switch_count > 0 ? (
                          <span className="text-red-600 font-bold flex items-center space-x-1" title="Peringatan berpindah tab jendela">
                            <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
                            <span>{p.tab_switch_count}x Tab Switch</span>
                          </span>
                        ) : (
                          <span className="text-emerald-600 flex items-center space-x-1">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                            <span>Aman</span>
                          </span>
                        )}
                      </td>
                      <td className="p-3.5 text-center">
                        <div className="flex items-center justify-center space-x-1">
                          {/* Reset Session Button */}
                          <button
                            onClick={() => store.proctorResetSession(p.id)}
                            title="Reset Sesi Peserta (Gunakan jika browser macet atau perlu login ulang)"
                            className="p-1.5 rounded hover:bg-slate-100 text-slate-600 hover:text-blue-600 transition"
                          >
                            <RotateCcw className="w-4 h-4" />
                          </button>

                          {/* Force Submit Button */}
                          <button
                            onClick={() => store.proctorForceSubmit(p.id)}
                            disabled={p.status === 'selesai'}
                            title="Force Submit (Selesaikan ujian secara paksa dari proktor)"
                            className="p-1.5 rounded hover:bg-slate-100 text-slate-600 hover:text-emerald-600 transition disabled:opacity-30"
                          >
                            <Send className="w-4 h-4" />
                          </button>

                          {/* Extend Minutes Button */}
                          <button
                            onClick={() => setExtendModal({ open: true, participantId: p.id, name: p.student_name })}
                            title="Tambah Waktu Ujian Peserta"
                            className="p-1.5 rounded hover:bg-slate-100 text-slate-600 hover:text-amber-600 transition"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Live Event Ticker (Audit Stream) */}
      <div className="bg-slate-900 text-white rounded-xl p-4 border border-slate-800">
        <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
          <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-blue-400">
            <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
            <span>Live Audit Stream (Supabase Realtime)</span>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">10 Detik Terakhir</span>
        </div>

        <div className="space-y-2 max-h-36 overflow-y-auto font-mono text-xs">
          {state.auditLogs.slice(0, 5).map((log) => (
            <div key={log.id} className="flex items-center space-x-3 text-slate-300">
              <span className="text-slate-500 text-[11px]">
                {new Date(log.created_at).toLocaleTimeString()}
              </span>
              <span className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] text-blue-300 uppercase font-bold">
                {log.action}
              </span>
              <span className="text-slate-200 truncate flex-1">{log.details}</span>
              <span className="text-slate-500 text-[10px]">{log.ip_address}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Extend Minutes Modal */}
      {extendModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 space-y-4 text-slate-900">
            <h3 className="font-bold text-base">Tambah Waktu Ujian</h3>
            <p className="text-xs text-slate-600">
              Berikan perpanjangan durasi untuk peserta: <strong>{extendModal.name}</strong>
            </p>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase">Jumlah Menit:</label>
              <div className="grid grid-cols-3 gap-2">
                {[10, 15, 30].map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setExtendMinutes(m)}
                    className={`py-2 rounded-lg border text-xs font-bold transition ${
                      extendMinutes === m ? 'bg-blue-600 text-white border-blue-600' : 'border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    +{m} Menit
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setExtendModal(null)}
                className="w-1/2 py-2 border border-slate-300 rounded-lg text-xs font-bold hover:bg-slate-50"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={confirmExtend}
                className="w-1/2 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 shadow-md"
              >
                Konfirmasi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
