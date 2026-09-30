import React, { useState } from 'react';
import { useCbt } from '../../hooks/useCbt';
import { UserRole } from '../../types';
import { DEMO_ACCOUNTS } from '../../data/seedData';
import { 
  X, 
  ShieldCheck, 
  Mail, 
  Lock, 
  ArrowRight, 
  Sparkles,
  CheckCircle2
} from 'lucide-react';

interface StaffLoginModalProps {
  onClose: () => void;
  onSuccess: (role: UserRole) => void;
}

export const StaffLoginModal: React.FC<StaffLoginModalProps> = ({ onClose, onSuccess }) => {
  const { store } = useCbt();
  const [selectedRole, setSelectedRole] = useState<UserRole>('proktor');
  const [email, setEmail] = useState('proktor@smpn1.sch.id');
  const [password, setPassword] = useState('Proktor123!');

  const handleRoleSelect = (account: typeof DEMO_ACCOUNTS[0]) => {
    setSelectedRole(account.role);
    if ('email' in account && account.email) {
      setEmail(account.email);
    }
    if ('pass' in account && account.pass) {
      setPassword(account.pass);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    store.loginAs(selectedRole, email);
    onSuccess(selectedRole);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 text-white p-6 relative">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-xl bg-blue-600/30 border border-blue-500/40 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Autentikasi Petugas & Administrator</h2>
              <p className="text-xs text-slate-300">Akses Role-Based Access Control (RBAC) Asesmen SMPN 7 Pasuruan</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* Quick Demo Role Cards */}
          <div className="mb-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center space-x-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Pilih Peran Petugas (1-Klik Auto-Fill):</span>
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {DEMO_ACCOUNTS.filter((a) => a.role !== 'peserta').map((acc) => (
                <button
                  key={acc.role}
                  type="button"
                  onClick={() => handleRoleSelect(acc)}
                  className={`p-2 rounded-lg border text-left transition text-xs flex flex-col justify-between ${
                    selectedRole === acc.role
                      ? 'border-blue-600 bg-blue-50/70 text-blue-900 ring-1 ring-blue-500'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold">{acc.label}</span>
                    {selectedRole === acc.role && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                    )}
                  </div>
                  <span className="text-[10px] text-slate-500 line-clamp-1 mt-1">{acc.desc}</span>
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Email / Username Petugas
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-sm font-bold shadow-md transition flex items-center justify-center space-x-2"
            >
              <span>Masuk Sebagai {DEMO_ACCOUNTS.find(a => a.role === selectedRole)?.label}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
