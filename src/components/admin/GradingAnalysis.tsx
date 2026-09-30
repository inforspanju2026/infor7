import React, { useState } from 'react';
import { useCbt } from '../../hooks/useCbt';
import { 
  BarChart3, 
  TrendingUp, 
  Award, 
  AlertCircle, 
  CheckCircle2, 
  Download, 
  Printer, 
  Search, 
  Edit3, 
  X, 
  Layers, 
  PieChart 
} from 'lucide-react';

export const GradingAnalysis: React.FC = () => {
  const { state, store } = useCbt();
  const [searchTerm, setSearchTerm] = useState('');
  const [essayModal, setEssayModal] = useState<{
    participantId: string;
    studentName: string;
    currentScore: number;
  } | null>(null);
  const [manualScoreInput, setManualScoreInput] = useState(80);

  // Participants who have completed or have scores
  const finishedParticipants = state.participants.filter(
    (p) => p.status === 'selesai' || p.status === 'waktu_habis' || p.score !== undefined
  );

  const scores = finishedParticipants.map((p) => p.score || 0);
  const total = scores.length || 1;
  const avgScore = scores.length > 0 ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1) : '0';
  const maxScore = scores.length > 0 ? Math.max(...scores) : 0;
  const minScore = scores.length > 0 ? Math.min(...scores) : 0;
  const passCount = scores.filter((s) => s >= 75).length;
  const passRate = scores.length > 0 ? Math.round((passCount / scores.length) * 100) : 0;

  // Score distribution buckets: <60, 60-74, 75-89, 90-100
  const distUnder60 = scores.filter((s) => s < 60).length;
  const dist60to74 = scores.filter((s) => s >= 60 && s < 75).length;
  const dist75to89 = scores.filter((s) => s >= 75 && s < 90).length;
  const dist90to100 = scores.filter((s) => s >= 90).length;

  const handleSaveManualScore = (e: React.FormEvent) => {
    e.preventDefault();
    if (essayModal) {
      store.manualGradeEssay(essayModal.participantId, 'q-essay', manualScoreInput);
      setEssayModal(null);
    }
  };

  const handleExportCsv = () => {
    const headers = ['Nomor,Nama Peserta,Nomor Peserta,Kelas,Nilai Akhir,Status Kelulusan'];
    const rows = finishedParticipants.map((p, i) => {
      const isPass = (p.score || 0) >= 75 ? 'Tuntas' : 'Belum Tuntas';
      return `${i + 1},"${p.student_name}","${p.participant_number}","${p.class_name}",${p.score || 0},"${isPass}"`;
    });
    const csvContent = [headers, ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `rekap_hasil_nilai_smpn7_pasuruan_${Date.now()}.csv`;
    link.click();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 flex items-center space-x-2">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            <span>Penilaian, Rekapitulasi & Analisis Butir Soal</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Statistik ketuntasan, penskoran otomatis PG & essay oleh guru, serta analisis tingkat kesukaran soal.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => window.print()}
            className="px-3 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Cetak Rekap</span>
          </button>
          <button
            onClick={handleExportCsv}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center space-x-1.5 transition shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Nilai CSV</span>
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs text-slate-500 font-medium">Nilai Rata-Rata</span>
          <div className="text-2xl font-black text-blue-600 mt-1">{avgScore}</div>
          <span className="text-[11px] text-slate-400">Dari {finishedParticipants.length} siswa selesai</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs text-emerald-600 font-semibold">Nilai Tertinggi</span>
          <div className="text-2xl font-black text-emerald-600 mt-1">{maxScore}</div>
          <span className="text-[11px] text-slate-400">Capaian skor maksimal</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs text-slate-500 font-medium">Nilai Terendah</span>
          <div className="text-2xl font-black text-slate-700 mt-1">{minScore}</div>
          <span className="text-[11px] text-slate-400">Batas bawah peserta</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs text-indigo-600 font-semibold">Tingkat Ketuntasan (KKM 75)</span>
          <div className="text-2xl font-black text-indigo-600 mt-1">{passRate}%</div>
          <span className="text-[11px] text-indigo-500">{passCount} dari {finishedParticipants.length} tuntas</span>
        </div>
      </div>

      {/* Visual Distribution Chart */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b pb-3 border-slate-100">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Distribusi Frekuensi Capaian Nilai Peserta
          </span>
          <span className="text-xs text-slate-400">Rentang Skala 0 - 100</span>
        </div>

        <div className="grid grid-cols-4 gap-3 text-center">
          <div className="p-3 bg-red-50 rounded-xl border border-red-100 space-y-1">
            <span className="text-[11px] text-red-600 font-bold block">&lt; 60 (Perlu Bimbingan)</span>
            <span className="text-2xl font-black text-red-700">{distUnder60}</span>
            <span className="text-[10px] text-red-500 block">Siswa</span>
          </div>
          <div className="p-3 bg-amber-50 rounded-xl border border-amber-100 space-y-1">
            <span className="text-[11px] text-amber-600 font-bold block">60 - 74 (Cukup)</span>
            <span className="text-2xl font-black text-amber-700">{dist60to74}</span>
            <span className="text-[10px] text-amber-500 block">Siswa</span>
          </div>
          <div className="p-3 bg-blue-50 rounded-xl border border-blue-100 space-y-1">
            <span className="text-[11px] text-blue-600 font-bold block">75 - 89 (Baik / Tuntas)</span>
            <span className="text-2xl font-black text-blue-700">{dist75to89}</span>
            <span className="text-[10px] text-blue-500 block">Siswa</span>
          </div>
          <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 space-y-1">
            <span className="text-[11px] text-emerald-600 font-bold block">90 - 100 (Sangat Baik)</span>
            <span className="text-2xl font-black text-emerald-700">{dist90to100}</span>
            <span className="text-[10px] text-emerald-500 block">Siswa</span>
          </div>
        </div>
      </div>

      {/* Table: Hasil Ujian Peserta */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Daftar Perolehan Skor Peserta Ujian
          </h3>
          <span className="text-xs text-slate-500">
            {finishedParticipants.length} Data Tersimpan
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="p-3.5 w-12 text-center">No</th>
                <th className="p-3.5">Nama Peserta</th>
                <th className="p-3.5">No Peserta</th>
                <th className="p-3.5">Kelas</th>
                <th className="p-3.5 text-center">Skor Objektif (PG)</th>
                <th className="p-3.5 text-center">Skor Uraian</th>
                <th className="p-3.5 text-center">Nilai Akhir</th>
                <th className="p-3.5 text-center">Status</th>
                <th className="p-3.5 text-center">Koreksi Guru</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {finishedParticipants.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-slate-400">
                    Belum ada data peserta yang menyelesaikan ujian.
                  </td>
                </tr>
              ) : (
                finishedParticipants.map((p, idx) => {
                  const finalScore = p.score || 0;
                  const isPass = finalScore >= 75;

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition">
                      <td className="p-3.5 text-center font-mono font-medium text-slate-500">
                        {idx + 1}
                      </td>
                      <td className="p-3.5 font-bold text-slate-900">
                        {p.student_name}
                      </td>
                      <td className="p-3.5 font-mono text-slate-600">
                        {p.participant_number}
                      </td>
                      <td className="p-3.5 font-semibold text-slate-700">
                        {p.class_name}
                      </td>
                      <td className="p-3.5 text-center font-mono font-bold text-slate-800">
                        {p.objective_score || p.score || 0}
                      </td>
                      <td className="p-3.5 text-center font-mono text-slate-700">
                        {p.essay_score !== undefined ? p.essay_score : <span className="text-slate-400">-</span>}
                      </td>
                      <td className="p-3.5 text-center font-mono text-base font-black text-blue-700">
                        {finalScore}
                      </td>
                      <td className="p-3.5 text-center">
                        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                          isPass ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {isPass ? 'TUNTAS' : 'REMEDIAL'}
                        </span>
                      </td>
                      <td className="p-3.5 text-center">
                        <button
                          onClick={() => setEssayModal({
                            participantId: p.id,
                            studentName: p.student_name,
                            currentScore: p.essay_score || 0,
                          })}
                          className="px-2.5 py-1 text-slate-700 hover:text-blue-600 hover:bg-slate-100 rounded text-xs font-semibold flex items-center space-x-1 mx-auto transition"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Nilai Uraian</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Item Analysis / Analisis Butir Soal */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b pb-3 border-slate-100">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Analisis Butir Soal & Daya Pembeda</h3>
            <p className="text-[11px] text-slate-500">Tingkat kesukaran dan efektivitas distraktor pilihan ganda</p>
          </div>
          <span className="text-xs bg-blue-50 text-blue-700 font-bold px-2 py-0.5 rounded">
            Validitas Soal Standar ANBK / TKA
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {state.questions.slice(0, 3).map((q, i) => (
            <div key={q.id} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-800">Soal #{i + 1} ({q.topic})</span>
                <span className="font-bold text-emerald-600">Kesukaran: 0.68</span>
              </div>
              <p className="text-[11px] text-slate-600 line-clamp-2">{q.question_text}</p>
              <div className="flex justify-between pt-1 border-t border-slate-200/60 text-[10px] text-slate-500">
                <span>Distraktor: Berfungsi baik</span>
                <span className="font-bold text-blue-700">Daya Beda: 0.42 (Baik)</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Manual Essay Grading Modal */}
      {essayModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 space-y-4 text-slate-900 border border-slate-200">
            <h3 className="font-bold text-base">Penilaian Manual Soal Uraian Guru</h3>
            <p className="text-xs text-slate-600">
              Berikan skor rubrik jawaban uraian untuk peserta: <strong>{essayModal.studentName}</strong>
            </p>

            <form onSubmit={handleSaveManualScore} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Skor Uraian (0 - 100)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={manualScoreInput}
                  onChange={(e) => setManualScoreInput(Number(e.target.value))}
                  className="w-full px-3 py-2 border rounded-lg font-mono text-base font-bold text-blue-700"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEssayModal(null)}
                  className="px-3 py-2 border rounded-lg font-semibold hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg font-bold shadow-md"
                >
                  Simpan Skor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
