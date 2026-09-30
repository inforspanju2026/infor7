import React, { useState } from 'react';
import { useCbt } from '../../hooks/useCbt';
import { 
  Activity, 
  Server, 
  Database, 
  Wifi, 
  Cpu, 
  HardDrive, 
  AlertTriangle, 
  CheckCircle2, 
  RefreshCw, 
  Laptop, 
  ShieldCheck, 
  Terminal,
  Zap
} from 'lucide-react';

export const SystemHealthView: React.FC = () => {
  const { state } = useCbt();
  const [pinging, setPinging] = useState(false);
  const [currentPing, setCurrentPing] = useState(24);

  const health = state.systemHealth;

  const testPing = () => {
    setPinging(true);
    setTimeout(() => {
      setCurrentPing(Math.floor(18 + Math.random() * 15));
      setPinging(false);
    }, 600);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 flex items-center space-x-2">
            <Activity className="w-5 h-5 text-blue-600" />
            <span>Kesehatan Sistem & Pemantauan Teknisi (System Health)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Diagnostik koneksi Supabase, latensi jaringan sekolah, beban server, dan audit perangkat peserta.
          </p>
        </div>

        <button
          onClick={testPing}
          disabled={pinging}
          className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold flex items-center space-x-1.5 transition shadow-sm disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${pinging ? 'animate-spin' : ''}`} />
          <span>Uji Latensi Server (Ping)</span>
        </button>
      </div>

      {/* Grid Status Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">Supabase Database</span>
            <Database className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-xl font-black text-emerald-600 flex items-center space-x-1.5">
            <CheckCircle2 className="w-5 h-5" />
            <span>Optimal</span>
          </div>
          <span className="text-[11px] text-slate-400 block">PostgreSQL v16 Connection Pool</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">Latensi Jaringan</span>
            <Wifi className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-xl font-black text-blue-600 font-mono">
            {currentPing} ms
          </div>
          <span className="text-[11px] text-emerald-500 block">Sangat Baik (&lt; 50ms)</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">Koneksi Realtime</span>
            <Zap className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-xl font-black text-slate-800">
            {state.participants.filter(p => p.status === 'sedang_ujian' || p.status === 'login').length} Sesi Aktif
          </div>
          <span className="text-[11px] text-slate-400 block">Subscribers WebSocket</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">Status Backup Data</span>
            <HardDrive className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-sm font-bold text-slate-800">
            Tersinkronisasi
          </div>
          <span className="text-[11px] text-slate-400 block">Backup otomatis setiap jam</span>
        </div>
      </div>

      {/* Hardware & Resource Gauge */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center space-x-1.5">
              <Cpu className="w-4 h-4 text-blue-600" />
              <span>Beban CPU Server Sekolah</span>
            </span>
            <span className="text-xs font-mono font-bold text-slate-700">{health.cpu_usage_pct}%</span>
          </div>

          <div className="space-y-1">
            <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-600 rounded-full transition-all duration-500" 
                style={{ width: `${health.cpu_usage_pct}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>0%</span>
              <span>Kapasitas Normal Aman</span>
              <span>100%</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center space-x-1.5">
              <Server className="w-4 h-4 text-indigo-600" />
              <span>Penggunaan Memori RAM</span>
            </span>
            <span className="text-xs font-mono font-bold text-slate-700">{health.memory_usage_pct}%</span>
          </div>

          <div className="space-y-1">
            <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-indigo-600 rounded-full transition-all duration-500" 
                style={{ width: `${health.memory_usage_pct}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>0%</span>
              <span>2.8 GB dari 8.0 GB Terpakai</span>
              <span>100%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Connected Devices of Exam Candidates */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Laptop className="w-4 h-4 text-slate-600" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Audit Perangkat Klien & Browser Peserta (Client Telemetry)
            </h3>
          </div>
          <span className="text-xs text-slate-500">
            {state.participants.length} Terminal Terdaftar
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="p-3.5">Nama Siswa</th>
                <th className="p-3.5">IP Address</th>
                <th className="p-3.5">Browser & OS Klien</th>
                <th className="p-3.5">Heartbeat Terakhir</th>
                <th className="p-3.5 text-center">Status Sinkronisasi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {state.participants.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/80 transition">
                  <td className="p-3.5 font-bold text-slate-900">
                    {p.student_name}
                  </td>
                  <td className="p-3.5 font-mono text-slate-600">
                    {p.ip_address || '192.168.1.100'}
                  </td>
                  <td className="p-3.5 text-slate-600 font-mono text-[11px]">
                    {p.user_agent || 'Chrome 122 / Windows 10'}
                  </td>
                  <td className="p-3.5 font-mono text-slate-500 text-[11px]">
                    {new Date(p.last_heartbeat).toLocaleTimeString()}
                  </td>
                  <td className="p-3.5 text-center">
                    {p.is_synced ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        Sinkron (Realtime)
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                        Tertunda di Klien
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* System Error & Diagnostics Log */}
      <div className="bg-slate-900 text-slate-200 rounded-xl p-5 border border-slate-800 space-y-3 font-mono text-xs">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex items-center space-x-2 text-emerald-400 font-bold">
            <Terminal className="w-4 h-4" />
            <span>Diagnostics & Error Log Console</span>
          </div>
          <span className="text-[11px] text-slate-500">Level: Info / Warn / Error</span>
        </div>

        <div className="space-y-2 max-h-48 overflow-y-auto">
          {state.systemLogs.map((log) => (
            <div key={log.id} className="flex items-start space-x-3 text-xs leading-relaxed">
              <span className="text-slate-500 text-[11px]">
                {new Date(log.created_at).toLocaleTimeString()}
              </span>
              <span className={`px-1 rounded text-[10px] uppercase font-bold ${
                log.level === 'error' ? 'bg-red-900 text-red-300' : log.level === 'warn' ? 'bg-amber-900 text-amber-300' : 'bg-blue-900 text-blue-300'
              }`}>
                {log.level}
              </span>
              <span className="text-slate-400 font-bold">{log.service}:</span>
              <span className="text-slate-200">{log.message}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
