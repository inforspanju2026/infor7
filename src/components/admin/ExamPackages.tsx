import React, { useState } from 'react';
import { useCbt } from '../../hooks/useCbt';
import { ExamPackage, ExamType, ExamStatus } from '../../types';
import { 
  Package, 
  Plus, 
  Calendar, 
  Clock, 
  Shuffle, 
  Eye, 
  Edit3, 
  CheckCircle2, 
  X, 
  KeyRound, 
  Layers, 
  ShieldCheck, 
  Tag
} from 'lucide-react';

export const ExamPackages: React.FC = () => {
  const { state, store } = useCbt();
  const [modalOpen, setModalOpen] = useState(false);
  const [editPkg, setEditPkg] = useState<ExamPackage | null>(null);

  // Form State
  const [formTitle, setFormTitle] = useState('');
  const [formSubjectId, setFormSubjectId] = useState(state.subjects[0]?.id || '');
  const [formExamType, setFormExamType] = useState<ExamType>('simulation');
  const [formDuration, setFormDuration] = useState(60);
  const [formTotalQ, setFormTotalQ] = useState(10);
  const [formToken, setFormToken] = useState('TKABARU');
  const [formRandomQ, setFormRandomQ] = useState(true);
  const [formRandomOpt, setFormRandomOpt] = useState(true);
  const [formShowResults, setFormShowResults] = useState(true);
  const [formFullscreen, setFormFullscreen] = useState(true);
  const [formStatus, setFormStatus] = useState<ExamStatus>('aktif');

  const openAddModal = () => {
    setEditPkg(null);
    setFormTitle('Asesmen SMPN 7 Pasuruan 2026 - Paket Baru');
    setFormSubjectId(state.subjects[0]?.id || '');
    setFormExamType('simulation');
    setFormDuration(60);
    setFormTotalQ(10);
    setFormToken('SPANJU' + Math.floor(10 + Math.random() * 90));
    setFormRandomQ(true);
    setFormRandomOpt(true);
    setFormShowResults(true);
    setFormFullscreen(true);
    setFormStatus('aktif');
    setModalOpen(true);
  };

  const openEditModal = (p: ExamPackage) => {
    setEditPkg(p);
    setFormTitle(p.title);
    setFormSubjectId(p.subject_id);
    setFormExamType(p.exam_type);
    setFormDuration(p.duration_minutes);
    setFormTotalQ(p.total_questions);
    setFormToken(p.token);
    setFormRandomQ(p.randomize_questions);
    setFormRandomOpt(p.randomize_options);
    setFormShowResults(p.show_results_to_student);
    setFormFullscreen(p.fullscreen_required);
    setFormStatus(p.status);
    setModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const subject = state.subjects.find((s) => s.id === formSubjectId);

    const packageData: ExamPackage = {
      id: editPkg ? editPkg.id : `pkg-${Date.now().toString(36)}`,
      school_id: state.school.id,
      subject_id: formSubjectId,
      subject_name: subject?.name,
      title: formTitle,
      exam_type: formExamType,
      academic_year: '2026/2027',
      grade_level: 9,
      total_questions: Number(formTotalQ),
      duration_minutes: Number(formDuration),
      start_date: '2026-09-01',
      end_date: '2026-10-31',
      start_time: '07:30',
      end_time: '14:30',
      token: formToken.toUpperCase(),
      is_token_active: true,
      randomize_questions: formRandomQ,
      randomize_options: formRandomOpt,
      allow_back_nav: true,
      show_results_to_student: formShowResults,
      show_discussion_to_student: formShowResults,
      fullscreen_required: formFullscreen,
      status: formStatus,
      question_ids: state.questions.slice(0, Number(formTotalQ)).map((q) => q.id),
      created_at: editPkg ? editPkg.created_at : new Date().toISOString(),
    };

    if (editPkg) {
      store.updateExamPackage(packageData);
    } else {
      store.addExamPackage(packageData);
    }
    setModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 flex items-center space-x-2">
            <Package className="w-5 h-5 text-blue-600" />
            <span>Manajemen Paket Ujian & Sesi</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Atur paket simulasi & ujian resmi, alokasi waktu, token aktif, dan randomisasi butir soal.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center space-x-1.5 transition shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Buat Paket Ujian</span>
        </button>
      </div>

      {/* Packages Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {state.examPackages.map((pkg) => (
          <div 
            key={pkg.id} 
            className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4 hover:border-slate-300 transition"
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                    pkg.exam_type === 'simulation' ? 'bg-indigo-100 text-indigo-800' : 'bg-rose-100 text-rose-800'
                  }`}>
                    {pkg.exam_type === 'simulation' ? 'Mode Simulasi' : 'Ujian Resmi Utama'}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 uppercase">
                    {pkg.status}
                  </span>
                </div>
                <h3 className="font-extrabold text-base text-slate-900 mt-2">{pkg.title}</h3>
                <div className="text-xs text-slate-500">{pkg.subject_name}</div>
              </div>

              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Token Ujian:</span>
                <span className="font-mono text-xl font-black text-blue-700">{pkg.token}</span>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-3 gap-2 p-3 bg-slate-50 rounded-xl text-xs">
              <div>
                <span className="text-slate-400 block text-[10px]">Durasi:</span>
                <span className="font-bold text-slate-800 flex items-center space-x-1">
                  <Clock className="w-3 h-3 text-blue-600" />
                  <span>{pkg.duration_minutes} Menit</span>
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Jumlah Soal:</span>
                <span className="font-bold text-slate-800 flex items-center space-x-1">
                  <Layers className="w-3 h-3 text-blue-600" />
                  <span>{pkg.total_questions} Butir</span>
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Randomisasi:</span>
                <span className="font-bold text-slate-800 flex items-center space-x-1">
                  <Shuffle className="w-3 h-3 text-blue-600" />
                  <span>{pkg.randomize_questions ? 'Aktif' : 'Tetap'}</span>
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-xs">
              <span className="text-slate-500 text-[11px]">
                Tahun Ajaran: <strong>{pkg.academic_year}</strong>
              </span>

              <button
                onClick={() => openEditModal(pkg)}
                className="px-3 py-1.5 border border-slate-300 hover:bg-slate-50 rounded-lg font-bold text-slate-700 flex items-center space-x-1 transition"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Pengaturan Paket</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL: Buat / Edit Paket Ujian */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-4 text-slate-900 border border-slate-200">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-base">
                {editPkg ? 'Pengaturan Paket Ujian' : 'Buat Paket Ujian Baru'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Nama Paket Ujian</label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Mata Pelajaran</label>
                  <select
                    value={formSubjectId}
                    onChange={(e) => setFormSubjectId(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg bg-white"
                  >
                    {state.subjects.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Mode Asesmen</label>
                  <select
                    value={formExamType}
                    onChange={(e) => setFormExamType(e.target.value as ExamType)}
                    className="w-full px-3 py-2 border rounded-lg bg-white"
                  >
                    <option value="simulation">Simulasi (Hasil Dapat Dilihat Siswa)</option>
                    <option value="actual">Ujian Resmi (Hasil Dirahasiakan)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Durasi (Menit)</label>
                  <input
                    type="number"
                    required
                    value={formDuration}
                    onChange={(e) => setFormDuration(parseInt(e.target.value))}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Jml Soal</label>
                  <input
                    type="number"
                    required
                    value={formTotalQ}
                    onChange={(e) => setFormTotalQ(parseInt(e.target.value))}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Token Ujian</label>
                  <input
                    type="text"
                    required
                    value={formToken}
                    onChange={(e) => setFormToken(e.target.value.toUpperCase())}
                    className="w-full px-3 py-2 border rounded-lg font-mono font-bold uppercase text-blue-700"
                  />
                </div>
              </div>

              <div className="p-3 bg-slate-50 border rounded-xl space-y-2">
                <span className="font-bold text-slate-800 uppercase block text-[11px]">Konfigurasi Sistem:</span>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formRandomQ}
                    onChange={(e) => setFormRandomQ(e.target.checked)}
                    className="rounded text-blue-600"
                  />
                  <span>Acak Urutan Nomor Soal Peserta</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formRandomOpt}
                    onChange={(e) => setFormRandomOpt(e.target.checked)}
                    className="rounded text-blue-600"
                  />
                  <span>Acak Pilihan Jawaban (A, B, C, D)</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formShowResults}
                    onChange={(e) => setFormShowResults(e.target.checked)}
                    className="rounded text-blue-600"
                  />
                  <span>Tampilkan Nilai ke Siswa Setelah Selesai</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formFullscreen}
                    onChange={(e) => setFormFullscreen(e.target.checked)}
                    className="rounded text-blue-600"
                  />
                  <span>Wajibkan Mode Layar Penuh (Fullscreen) & Deteksi Tab Switch</span>
                </label>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border rounded-lg font-semibold hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold shadow-sm"
                >
                  Simpan Paket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
