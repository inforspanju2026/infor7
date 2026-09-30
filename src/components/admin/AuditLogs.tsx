import React, { useState } from 'react';
import { useCbt } from '../../hooks/useCbt';
import { 
  ShieldCheck, 
  Search, 
  Filter, 
  Download, 
  Clock, 
  User, 
  Terminal, 
  Activity 
} from 'lucide-react';

export const AuditLogsView: React.FC = () => {
  const { state } = useCbt();
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  const filteredLogs = state.auditLogs.filter((log) => {
    const matchSearch = log.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        log.details.toLowerCase().includes(searchTerm.toLowerCase());
    const matchRole = roleFilter === 'all' || log.user_role === roleFilter;
    return matchSearch && matchRole;
  });

  const handleExportCsv = () => {
    const headers = ['Waktu,Pengguna,Peran,Aktivitas,Detail,IP Address,Browser'];
    const rows = filteredLogs.map((l) => {
      return `"${l.created_at}","${l.user_name}","${l.user_role}","${l.action}","${l.details}","${l.ip_address}","${l.user_agent}"`;
    });
    const csvContent = [headers, ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `audit_logs_cbt_tka_${Date.now()}.csv`;
    link.click();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-blue-600" />
            <span>Audit Log Aktivitas Keamanan Sistem (Immutable Log)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Rekam jejak setiap aksi krusial: autentikasi, pengubahan token, perpanjangan waktu, dan submit ujian.
          </p>
        </div>

        <button
          onClick={handleExportCsv}
          className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold flex items-center space-x-1.5 transition shadow-sm"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Audit Log (CSV)</span>
        </button>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Cari aktivitas, nama pengguna, IP..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <Filter className="w-3.5 h-3.5 text-slate-500" />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Semua Peran (Roles)</option>
            <option value="proktor">Proktor</option>
            <option value="peserta">Peserta Ujian</option>
            <option value="admin_sekolah">Admin Sekolah</option>
            <option value="guru">Guru</option>
            <option value="teknisi">Teknisi</option>
            <option value="super_admin">Super Admin</option>
          </select>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="p-3.5 w-40">Waktu</th>
                <th className="p-3.5">Pengguna & Peran</th>
                <th className="p-3.5">Aktivitas</th>
                <th className="p-3.5">Detail Aktivitas</th>
                <th className="p-3.5">IP & Perangkat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400 font-sans">
                    Tidak ada rekaman log audit yang cocok.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/80 transition text-xs">
                    <td className="p-3.5 text-slate-500 text-[11px]">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                    <td className="p-3.5 font-sans">
                      <div className="font-bold text-slate-900">{log.user_name}</div>
                      <span className="text-[10px] uppercase font-bold text-blue-600 px-1.5 py-0.5 rounded bg-blue-50 border border-blue-200">
                        {log.user_role}
                      </span>
                    </td>
                    <td className="p-3.5 font-sans">
                      <span className="font-bold text-slate-800">{log.action}</span>
                    </td>
                    <td className="p-3.5 font-sans text-slate-600 max-w-md">
                      {log.details}
                    </td>
                    <td className="p-3.5 text-slate-500 text-[11px]">
                      <div>{log.ip_address}</div>
                      <div className="text-[10px] text-slate-400 truncate max-w-[120px]">{log.user_agent}</div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
