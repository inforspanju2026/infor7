import React, { useState } from 'react';
import { useCbt } from '../../hooks/useCbt';
import { 
  X, 
  KeyRound, 
  UserCheck, 
  Clock, 
  FileText, 
  AlertCircle, 
  ArrowRight, 
  CheckCircle2, 
  Info,
  ShieldAlert
} from 'lucide-react';

interface StudentLoginModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export const StudentLoginModal: React.FC<StudentLoginModalProps> = ({ onClose, onSuccess }) => {
  const { state, store } = useCbt();
  const [identifier, setIdentifier] = useState('04-001-001-8'); // Default demo student: Ahmad Fauzi
  const [pin, setPin] = useState('123456');
  const [token, setToken] = useState('SIMULA1');
  const [errorMsg, setErrorMsg] = useState('');
  const [verifiedStudent, setVerifiedStudent] = useState<any | null>(null);

  // Quick fill student buttons
  const fillStudent = (num: string, userPin: string) => {
    setIdentifier(num);
    setPin(userPin);
    setErrorMsg('');
  };

  const activeToken = state.examPackages.find((p) => p.is_token_active)?.token || 'SIMULA1';

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const res = store.loginStudent(identifier.trim(), pin.trim(), token.trim());
    if (!res.success) {
      setErrorMsg(res.message);
      return;
    }

    // Successfully verified, show candidate confirmation card
    setVerifiedStudent({
      participant: store.getState().currentParticipant,
      package: store.getState().activePackage,
    });
  };

  const handleConfirmStart = () => {
    store.startStudentExam();
    onSuccess();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white p-6 relative">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-1 rounded-full text-blue-200 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center backdrop-blur-sm">
              <UserCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Portal Asesmen Siswa</h2>
              <p className="text-xs text-blue-200">Asesmen SMPN 7 Pasuruan &bull; {state.school.name}</p>
            </div>
          </div>
        </div>

        {/* Content */}
        {!verifiedStudent ? (
          <div className="p-6">
            <form onSubmit={handleVerify} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Nomor Peserta Ujian / NISN
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: 04-001-001-8 atau 0091234561"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Password / PIN Peserta
                </label>
                <input
                  type="password"
                  required
                  placeholder="Masukkan 6 digit PIN peserta"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 font-mono tracking-widest"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase">
                    Token Ujian
                  </label>
                  <span className="text-[11px] text-blue-600 font-medium">
                    Token aktif saat ini: <strong className="font-mono">{activeToken}</strong>
                  </span>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="Masukkan 6-7 digit token dari proktor"
                    value={token}
                    onChange={(e) => setToken(e.target.value.toUpperCase())}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 font-mono uppercase tracking-widest font-bold text-blue-900"
                  />
                  <KeyRound className="w-4 h-4 text-slate-400 absolute right-3 top-3.5" />
                </div>
              </div>

              {errorMsg && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-bold shadow-md transition flex items-center justify-center space-x-2"
              >
                <span>Verifikasi Data Peserta</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Quick Demo Student Selector */}
            <div className="mt-6 pt-4 border-t border-slate-100">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                Pilih Akun Demo Siswa (1-Klik):
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => fillStudent('04-001-001-8', '123456')}
                  className="p-2 border border-slate-200 rounded-lg text-left hover:border-blue-400 hover:bg-blue-50/50 transition"
                >
                  <div className="font-bold text-slate-800">Ahmad Fauzi</div>
                  <div className="text-[10px] text-slate-500 font-mono">04-001-001-8 (IX A)</div>
                </button>
                <button
                  type="button"
                  onClick={() => fillStudent('04-001-003-6', '123456')}
                  className="p-2 border border-slate-200 rounded-lg text-left hover:border-blue-400 hover:bg-blue-50/50 transition"
                >
                  <div className="font-bold text-slate-800">Bima Satria</div>
                  <div className="text-[10px] text-blue-600 font-mono">Aksesibilitas Khusus</div>
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Confirmation Screen after verification */
          <div className="p-6 space-y-4">
            <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-xl space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-lg">
                  {verifiedStudent.participant?.student_name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base leading-snug">
                    {verifiedStudent.participant?.student_name}
                  </h3>
                  <div className="text-xs text-slate-600 flex items-center space-x-2">
                    <span className="font-mono font-semibold">{verifiedStudent.participant?.participant_number}</span>
                    <span>&bull;</span>
                    <span>Kelas {verifiedStudent.participant?.class_name}</span>
                  </div>
                </div>
              </div>

              <div className="border-t border-blue-200/60 pt-3 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-500 block text-[11px]">Mata Pelajaran:</span>
                  <span className="font-semibold text-slate-800">{verifiedStudent.package?.subject_name}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Durasi Pengerjaan:</span>
                  <span className="font-semibold text-slate-800 flex items-center space-x-1">
                    <Clock className="w-3.5 h-3.5 text-blue-600" />
                    <span>{verifiedStudent.package?.duration_minutes} Menit</span>
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Jumlah Butir Soal:</span>
                  <span className="font-semibold text-slate-800 flex items-center space-x-1">
                    <FileText className="w-3.5 h-3.5 text-blue-600" />
                    <span>{verifiedStudent.package?.total_questions} Soal</span>
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Status Token:</span>
                  <span className="font-bold text-emerald-600 flex items-center space-x-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Terverifikasi</span>
                  </span>
                </div>
              </div>
            </div>

            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 flex items-start space-x-2">
              <ShieldAlert className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
              <div>
                <span className="font-bold block">Tata Tertib:</span>
                Timer akan berjalan otomatis begitu Anda menekan tombol mulai. Dilarang menutup browser atau berpindah tab jendela selama ujian berlangsung.
              </div>
            </div>

            <div className="flex items-center space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setVerifiedStudent(null)}
                className="w-1/3 py-2.5 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-lg text-xs font-semibold transition"
              >
                Kembali
              </button>
              <button
                type="button"
                onClick={handleConfirmStart}
                className="w-2/3 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-md transition flex items-center justify-center space-x-1.5"
              >
                <span>MULAI UJIAN SEKARANG</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
