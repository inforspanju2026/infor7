import React, { useState } from 'react';
import { 
  X, 
  Database, 
  CheckCircle2, 
  AlertCircle, 
  Copy, 
  Download, 
  Server, 
  FileCode, 
  RefreshCw 
} from 'lucide-react';
import { 
  getStoredSupabaseConfig, 
  saveSupabaseConfig, 
  clearSupabaseConfig, 
  testSupabaseConnection 
} from '../../lib/supabase';
import { FULL_SQL_MIGRATION, ERD_DOCUMENTATION } from '../../data/sqlMigration';

interface SupabaseConfigModalProps {
  onClose: () => void;
}

export const SupabaseConfigModal: React.FC<SupabaseConfigModalProps> = ({ onClose }) => {
  const currentConfig = getStoredSupabaseConfig();
  const [url, setUrl] = useState(currentConfig.url);
  const [anonKey, setAnonKey] = useState(currentConfig.anonKey);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [activeSubTab, setActiveSubTab] = useState<'config' | 'sql' | 'erd'>('config');
  const [copied, setCopied] = useState(false);

  const handleTestAndSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url || !anonKey) {
      setTestResult({ success: false, message: 'URL dan Anon Key tidak boleh kosong' });
      return;
    }

    setTesting(true);
    setTestResult(null);

    const res = await testSupabaseConnection(url, anonKey);
    setTesting(false);
    setTestResult(res);

    if (res.success) {
      saveSupabaseConfig(url, anonKey);
    }
  };

  const handleResetToLocal = () => {
    clearSupabaseConfig();
    setUrl('');
    setAnonKey('');
    setTestResult({ success: true, message: 'Kembali menggunakan Local Synced Engine (IndexedDB & Realtime Simulation)' });
  };

  const copySql = () => {
    navigator.clipboard.writeText(FULL_SQL_MIGRATION);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadSql = () => {
    const element = document.createElement('a');
    const file = new Blob([FULL_SQL_MIGRATION], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = 'cbt_tka_smp_supabase_migration.sql';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Database className="w-5 h-5 text-blue-400" />
            <div>
              <h3 className="font-bold text-base leading-tight">Konfigurasi & Skema Supabase PostgreSQL</h3>
              <p className="text-xs text-slate-300">Hubungkan ke database Supabase Cloud atau unduh SQL migration</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sub Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-3 space-x-4">
          <button
            onClick={() => setActiveSubTab('config')}
            className={`pb-3 text-xs font-semibold border-b-2 transition ${
              activeSubTab === 'config'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Koneksi Supabase
          </button>
          <button
            onClick={() => setActiveSubTab('sql')}
            className={`pb-3 text-xs font-semibold border-b-2 transition flex items-center space-x-1 ${
              activeSubTab === 'sql'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>SQL Migration Editor</span>
          </button>
          <button
            onClick={() => setActiveSubTab('erd')}
            className={`pb-3 text-xs font-semibold border-b-2 transition ${
              activeSubTab === 'erd'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Diagram Relasi (ERD)
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 text-sm text-slate-700">
          {activeSubTab === 'config' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-lg bg-blue-50 border border-blue-200 text-xs text-blue-900 leading-relaxed">
                <span className="font-bold">Informasi:</span> Aplikasi CBT TKA SMP secara default telah dilengkapi dengan engine lokal terisolasi yang persisten dengan data real sekolah, siswa, dan soal. Anda dapat menghubungkan ke Supabase project Anda sendiri kapan saja dengan memasukkan URL & Anon Key di bawah ini.
              </div>

              <form onSubmit={handleTestAndSave} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Supabase Project URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://your-project.supabase.co"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Supabase Anon Public API Key
                  </label>
                  <textarea
                    rows={3}
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    value={anonKey}
                    onChange={(e) => setAnonKey(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    *Hanya gunakan Anon Public Key. Jangan pernah memasukkan Service Role Secret Key pada sisi browser.
                  </p>
                </div>

                {testResult && (
                  <div className={`p-3 rounded-lg flex items-center space-x-2 text-xs ${
                    testResult.success ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'
                  }`}>
                    {testResult.success ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                    )}
                    <span>{testResult.message}</span>
                  </div>
                )}

                <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
                  <button
                    type="button"
                    onClick={handleResetToLocal}
                    className="px-3 py-2 text-xs text-slate-600 hover:text-slate-900 border border-slate-200 rounded-md hover:bg-slate-50 transition"
                  >
                    Gunakan Local Synced Engine
                  </button>

                  <div className="flex items-center space-x-2">
                    <button
                      type="submit"
                      disabled={testing}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs font-semibold transition flex items-center space-x-1.5 shadow-sm disabled:opacity-50"
                    >
                      {testing ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Menguji Koneksi...</span>
                        </>
                      ) : (
                        <>
                          <Server className="w-3.5 h-3.5" />
                          <span>Simpan & Tes Koneksi</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}

          {activeSubTab === 'sql' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-600">
                  PostgreSQL Migration (Tabel, RLS, Indexes, Triggers, & Functions)
                </span>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={copySql}
                    className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded flex items-center space-x-1 transition"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{copied ? 'Tersalin!' : 'Salin SQL'}</span>
                  </button>
                  <button
                    onClick={downloadSql}
                    className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded flex items-center space-x-1 transition shadow-sm"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Unduh .sql</span>
                  </button>
                </div>
              </div>
              <pre className="p-3 bg-slate-900 text-emerald-400 rounded-lg text-xs font-mono overflow-x-auto max-h-80 border border-slate-800">
                {FULL_SQL_MIGRATION}
              </pre>
              <p className="text-[11px] text-slate-500">
                Jalankan script ini di menu <strong>SQL Editor</strong> pada Supabase Dashboard Anda untuk men-deploy seluruh struktur database, fungsi idempotent submission, dan policies.
              </p>
            </div>
          )}

          {activeSubTab === 'erd' && (
            <div className="space-y-3">
              <span className="text-xs font-bold text-slate-600">
                Entity Relationship Diagram (ERD)
              </span>
              <pre className="p-4 bg-slate-900 text-blue-300 rounded-lg text-xs font-mono overflow-x-auto leading-relaxed border border-slate-800">
                {ERD_DOCUMENTATION}
              </pre>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-md transition"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
