import React, { useState } from 'react';
import { 
  FileCode, 
  Copy, 
  Download, 
  Check, 
  Database, 
  ShieldCheck, 
  Layers 
} from 'lucide-react';
import { FULL_SQL_MIGRATION, ERD_DOCUMENTATION } from '../../data/sqlMigration';

export const SqlDocumentation: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'sql' | 'erd'>('sql');

  const copyToClipboard = () => {
    navigator.clipboard.writeText(FULL_SQL_MIGRATION);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadFile = () => {
    const blob = new Blob([FULL_SQL_MIGRATION], { type: 'text/sql' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'cbt_tka_smp_supabase_migration.sql';
    link.click();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 flex items-center space-x-2">
            <FileCode className="w-5 h-5 text-blue-600" />
            <span>Skema Database Supabase & SQL Migration Script</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Script DDL lengkap, RLS policy 8 role, triggers, database functions, dan indeks performa tinggi.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={copyToClipboard}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Tersalin ke Clipboard!' : 'Salin Seluruh SQL'}</span>
          </button>
          <button
            onClick={downloadFile}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center space-x-1.5 transition shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Unduh Migration .sql</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('sql')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 ${
            activeTab === 'sql' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Database className="w-3.5 h-3.5" />
          <span>PostgreSQL Migration Script</span>
        </button>
        <button
          onClick={() => setActiveTab('erd')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 ${
            activeTab === 'erd' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Entity Relationship Diagram (ERD)</span>
        </button>
      </div>

      {/* Content */}
      {activeTab === 'sql' ? (
        <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800 shadow-inner">
          <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800 pb-2 mb-3">
            <span>cbt_tka_smp_supabase_migration.sql (PostgreSQL 15+)</span>
            <span className="font-mono text-emerald-400">Production Ready</span>
          </div>
          <pre className="font-mono text-xs text-slate-200 overflow-x-auto max-h-[600px] leading-relaxed select-all">
            {FULL_SQL_MIGRATION}
          </pre>
        </div>
      ) : (
        <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 shadow-inner">
          <pre className="font-mono text-xs text-blue-300 overflow-x-auto leading-relaxed">
            {ERD_DOCUMENTATION}
          </pre>
        </div>
      )}
    </div>
  );
};
