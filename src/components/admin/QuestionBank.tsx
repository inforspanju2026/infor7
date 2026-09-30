import React, { useState } from 'react';
import { useCbt } from '../../hooks/useCbt';
import { Question, QuestionType, CognitiveLevel, DifficultyLevel } from '../../types';
import { 
  BookOpen, 
  Search, 
  Filter, 
  Plus, 
  Upload, 
  FileSpreadsheet, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  Eye, 
  Edit3, 
  Trash2, 
  Layers, 
  Sparkles,
  HelpCircle,
  Check
} from 'lucide-react';

export const QuestionBank: React.FC = () => {
  const { state, store } = useCbt();
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editQuestion, setEditQuestion] = useState<Question | null>(null);
  const [previewQuestion, setPreviewQuestion] = useState<Question | null>(null);
  const [importModalOpen, setImportModalOpen] = useState(false);

  // Form State
  const [formSubjectId, setFormSubjectId] = useState(state.subjects[0]?.id || '');
  const [formType, setFormType] = useState<QuestionType>('pg');
  const [formCognitive, setFormCognitive] = useState<CognitiveLevel>('L2');
  const [formDifficulty, setFormDifficulty] = useState<DifficultyLevel>('sedang');
  const [formTopic, setFormTopic] = useState('');
  const [formIndicator, setFormIndicator] = useState('');
  const [formStimulus, setFormStimulus] = useState('');
  const [formQuestionText, setFormQuestionText] = useState('');
  const [formPoints, setFormPoints] = useState(2.5);
  const [formExplanation, setFormExplanation] = useState('');
  const [formCorrectKey, setFormCorrectKey] = useState('A');
  const [formOptions, setFormOptions] = useState([
    { key: 'A', content: '' },
    { key: 'B', content: '' },
    { key: 'C', content: '' },
    { key: 'D', content: '' },
  ]);

  // Import State
  const [importText, setImportText] = useState('');
  const [importResult, setImportResult] = useState<{
    valid: number;
    errors: { line: number; reason: string }[];
  } | null>(null);

  // Filtered Questions
  const filteredQuestions = state.questions.filter((q) => {
    const matchSubject = selectedSubject === 'all' || q.subject_id === selectedSubject;
    const matchType = selectedType === 'all' || q.question_type === selectedType;
    const matchSearch = q.question_text.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        q.topic.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        q.indicator.toLowerCase().includes(searchTerm.toLowerCase());
    return matchSubject && matchType && matchSearch;
  });

  const openAddModal = () => {
    setEditQuestion(null);
    setFormSubjectId(state.subjects[0]?.id || '');
    setFormType('pg');
    setFormCognitive('L2');
    setFormDifficulty('sedang');
    setFormTopic('');
    setFormIndicator('');
    setFormStimulus('');
    setFormQuestionText('');
    setFormPoints(2.5);
    setFormExplanation('');
    setFormCorrectKey('A');
    setFormOptions([
      { key: 'A', content: '' },
      { key: 'B', content: '' },
      { key: 'C', content: '' },
      { key: 'D', content: '' },
    ]);
    setModalOpen(true);
  };

  const openEditModal = (q: Question) => {
    setEditQuestion(q);
    setFormSubjectId(q.subject_id);
    setFormType(q.question_type);
    setFormCognitive(q.cognitive_level);
    setFormDifficulty(q.difficulty);
    setFormTopic(q.topic);
    setFormIndicator(q.indicator);
    setFormStimulus(q.stimulus || '');
    setFormQuestionText(q.question_text);
    setFormPoints(q.points);
    setFormExplanation(q.explanation || '');
    setFormCorrectKey(typeof q.correct_answer === 'string' ? q.correct_answer : 'A');
    if (q.options && q.options.length > 0) {
      setFormOptions(q.options.map((o) => ({ key: o.key, content: o.content })));
    }
    setModalOpen(true);
  };

  const handleSaveQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    const subject = state.subjects.find((s) => s.id === formSubjectId);

    const questionData: Question = {
      id: editQuestion ? editQuestion.id : `q-${Date.now().toString(36)}`,
      question_bank_id: editQuestion ? editQuestion.question_bank_id : 'qb-01',
      subject_id: formSubjectId,
      subject_name: subject?.name,
      grade_level: 9,
      topic: formTopic,
      indicator: formIndicator,
      cognitive_level: formCognitive,
      difficulty: formDifficulty,
      question_type: formType,
      stimulus: formStimulus,
      question_text: formQuestionText,
      options: formOptions.map((o) => ({
        id: `opt-${o.key}-${Date.now().toString(36)}`,
        question_id: editQuestion ? editQuestion.id : '',
        key: o.key,
        content: o.content,
        is_correct: o.key === formCorrectKey,
      })),
      correct_answer: formCorrectKey,
      points: Number(formPoints),
      explanation: formExplanation,
      status: 'aktif',
      created_at: editQuestion ? editQuestion.created_at : new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (editQuestion) {
      store.updateQuestion(questionData);
    } else {
      store.addQuestion(questionData);
    }
    setModalOpen(false);
  };

  // Import from Excel/CSV parser
  const handleProcessImport = () => {
    const lines = importText.trim().split('\n');
    if (lines.length === 0) return;

    const newQuestions: Question[] = [];
    const errors: { line: number; reason: string }[] = [];

    lines.forEach((line, index) => {
      // Columns: kode_soal, mapel, materi, indikator, level_kognitif, tipe_soal, stimulus, pertanyaan, opsi_a, opsi_b, opsi_c, opsi_d, opsi_e, kunci, bobot, pembahasan
      const cols = line.split('\t').length > 1 ? line.split('\t') : line.split('|');
      const cleanCols = cols.map((c) => c.trim());

      if (cleanCols.length < 8) {
        errors.push({
          line: index + 1,
          reason: 'Format kolom tidak lengkap (minimal pertanyaan, kunci, opsi A-D)',
        });
        return;
      }

      const [
        code,
        mapelCode,
        materi,
        indikator,
        level,
        type,
        stimulus,
        pertanyaan,
        opsiA,
        opsiB,
        opsiC,
        opsiD,
        opsiE,
        kunci,
        bobot,
        pembahasan,
      ] = cleanCols;

      if (!pertanyaan || !kunci) {
        errors.push({
          line: index + 1,
          reason: 'Pertanyaan atau Kunci Jawaban kosong',
        });
        return;
      }

      const subject = state.subjects.find((s) => s.code.toLowerCase() === (mapelCode || '').toLowerCase()) || state.subjects[0];

      newQuestions.push({
        id: `q-imp-${Date.now().toString(36)}-${index}`,
        question_bank_id: 'qb-imp',
        subject_id: subject.id,
        subject_name: subject.name,
        grade_level: 9,
        topic: materi || 'Materi Pokok',
        indicator: indikator || 'Indikator Soal',
        cognitive_level: (['L1', 'L2', 'L3'].includes(level) ? level : 'L2') as CognitiveLevel,
        difficulty: 'sedang',
        question_type: (type as QuestionType) || 'pg',
        stimulus: stimulus || undefined,
        question_text: pertanyaan,
        options: [
          { id: `o-a-${index}`, question_id: '', key: 'A', content: opsiA || 'Opsi A', is_correct: kunci === 'A' },
          { id: `o-b-${index}`, question_id: '', key: 'B', content: opsiB || 'Opsi B', is_correct: kunci === 'B' },
          { id: `o-c-${index}`, question_id: '', key: 'C', content: opsiC || 'Opsi C', is_correct: kunci === 'C' },
          { id: `o-d-${index}`, question_id: '', key: 'D', content: opsiD || 'Opsi D', is_correct: kunci === 'D' },
        ],
        correct_answer: kunci.toUpperCase(),
        points: parseFloat(bobot) || 2.5,
        explanation: pembahasan || undefined,
        status: 'aktif',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    });

    setImportResult({ valid: newQuestions.length, errors });

    if (newQuestions.length > 0) {
      store.importQuestions(newQuestions);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 flex items-center space-x-2">
            <BookOpen className="w-5 h-5 text-blue-600" />
            <span>Bank Soal & Kisi-Kisi Asesmen SMPN 7 Pasuruan</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Daftar butir soal terstandarisasi mencakup 6 tipe soal, stimulus multimedia, indikator, dan pembahasan.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              setImportText(
                'SOAL-01|MAT|Geometri|Luas Lingkaran|L2|pg|Sebuah taman berbentuk lingkaran memiliki diameter 28 meter.|Berapakah luas taman tersebut?|616 m2|308 m2|154 m2|88 m2||A|2.5|L = 1/4 * pi * d^2 = 1/4 * 22/7 * 28 * 28 = 616 m2\nSOAL-02|IPA|Zat dan Kalor|Konduksi Panas|L1|pg|Sendok logam yang dimasukkan ke dalam air panas lama-kelamaan akan terasa panas.|Peristiwa perpindahan kalor tersebut dinamakan...|Konduksi|Konveksi|Radiasi|Evaporasi||A|2.0|Perpindahan panas melalui zat padat tanpa disertai perpindahan partikel disebut konduksi'
              );
              setImportResult(null);
              setImportModalOpen(true);
            }}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition shadow-sm"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Import Excel Soal</span>
          </button>
          <button
            onClick={openAddModal}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center space-x-1.5 transition shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tulis Soal Baru</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Cari materi, indikator, teks pertanyaan..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <div className="flex items-center space-x-1">
            <span className="text-xs text-slate-500">Mapel:</span>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Semua Mata Pelajaran</option>
              {state.subjects.map((sub) => (
                <option key={sub.id} value={sub.id}>{sub.name}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-1">
            <span className="text-xs text-slate-500">Tipe:</span>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Semua Tipe Soal</option>
              <option value="pg">Pilihan Ganda</option>
              <option value="pg_kompleks">Pilihan Ganda Kompleks</option>
              <option value="benar_salah">Benar / Salah</option>
              <option value="menjodohkan">Menjodohkan</option>
              <option value="isian">Isian Singkat</option>
              <option value="uraian">Uraian</option>
            </select>
          </div>
        </div>
      </div>

      {/* Question List Cards */}
      <div className="space-y-3">
        {filteredQuestions.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-xl border border-slate-200 text-slate-400">
            Tidak ada butir soal yang sesuai dengan kriteria filter.
          </div>
        ) : (
          filteredQuestions.map((q, idx) => (
            <div key={q.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-slate-300 transition space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2">
                  <span className="w-7 h-7 rounded-lg bg-blue-100 text-blue-800 font-bold text-xs flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <div>
                    <div className="text-xs font-bold text-slate-900 flex items-center space-x-2">
                      <span className="text-blue-600 uppercase tracking-wider">{q.subject_name || 'TKA'}</span>
                      <span>&bull;</span>
                      <span className="capitalize">{q.topic}</span>
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Indikator: {q.indicator}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                    {q.cognitive_level} ({q.difficulty})
                  </span>
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-indigo-50 text-indigo-700">
                    {q.question_type.replace('_', ' ')}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700">
                    {q.points} Poin
                  </span>
                </div>
              </div>

              {/* Stimulus Preview */}
              {q.stimulus && (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600 font-serif line-clamp-2">
                  <strong className="text-[10px] uppercase tracking-wider block text-slate-400 not-italic">Stimulus:</strong>
                  {q.stimulus}
                </div>
              )}

              {/* Question Text */}
              <div className="text-sm font-semibold text-slate-800">
                {q.question_text}
              </div>

              {/* Action Buttons */}
              <div className="border-t border-slate-100 pt-3 flex items-center justify-between text-xs">
                <div className="text-slate-500 text-[11px]">
                  Kunci Jawaban: <strong className="text-emerald-700 font-mono">{JSON.stringify(q.correct_answer)}</strong>
                </div>

                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => setPreviewQuestion(q)}
                    className="px-2.5 py-1 text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded transition flex items-center space-x-1"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Preview Siswa</span>
                  </button>
                  <button
                    onClick={() => openEditModal(q)}
                    className="px-2.5 py-1 text-slate-600 hover:text-amber-600 hover:bg-slate-100 rounded transition flex items-center space-x-1"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('Hapus butir soal ini?')) {
                        store.deleteQuestion(q.id);
                      }
                    }}
                    className="px-2.5 py-1 text-slate-600 hover:text-red-600 hover:bg-slate-100 rounded transition flex items-center space-x-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Hapus</span>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* MODAL: Tambah / Edit Butir Soal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 space-y-4 text-slate-900 border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-base">
                {editQuestion ? 'Edit Butir Soal' : 'Tulis Butir Soal Baru'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveQuestion} className="space-y-3 text-xs">
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
                  <label className="block font-bold text-slate-700 uppercase mb-1">Bentuk Soal</label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value as QuestionType)}
                    className="w-full px-3 py-2 border rounded-lg bg-white"
                  >
                    <option value="pg">Pilihan Ganda (Single Choice)</option>
                    <option value="pg_kompleks">Pilihan Ganda Kompleks</option>
                    <option value="benar_salah">Benar / Salah Matrix</option>
                    <option value="menjodohkan">Menjodohkan</option>
                    <option value="isian">Isian Singkat</option>
                    <option value="uraian">Uraian / Essay</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Level Kognitif</label>
                  <select
                    value={formCognitive}
                    onChange={(e) => setFormCognitive(e.target.value as CognitiveLevel)}
                    className="w-full px-3 py-2 border rounded-lg bg-white"
                  >
                    <option value="L1">L1 - Pemahaman (Knowing)</option>
                    <option value="L2">L2 - Penerapan (Applying)</option>
                    <option value="L3">L3 - Penalaran (Reasoning)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Tingkat Kesulitan</label>
                  <select
                    value={formDifficulty}
                    onChange={(e) => setFormDifficulty(e.target.value as DifficultyLevel)}
                    className="w-full px-3 py-2 border rounded-lg bg-white"
                  >
                    <option value="mudah">Mudah</option>
                    <option value="sedang">Sedang</option>
                    <option value="sukar">Sukar</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Bobot Nilai</label>
                  <input
                    type="number"
                    step="0.5"
                    value={formPoints}
                    onChange={(e) => setFormPoints(parseFloat(e.target.value))}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Materi Pokok</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Teorema Pythagoras"
                    value={formTopic}
                    onChange={(e) => setFormTopic(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Indikator Soal</label>
                  <input
                    type="text"
                    required
                    placeholder="Peserta didik dapat..."
                    value={formIndicator}
                    onChange={(e) => setFormIndicator(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Stimulus Bacaan / Konteks (Opsional)
                </label>
                <textarea
                  rows={3}
                  placeholder="Teks wacana, bacaan informasi, atau data pengantar..."
                  value={formStimulus}
                  onChange={(e) => setFormStimulus(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg font-serif"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Pertanyaan Soal
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Tuliskan pertanyaan soal..."
                  value={formQuestionText}
                  onChange={(e) => setFormQuestionText(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg font-medium"
                />
              </div>

              {/* Options Section for PG */}
              {formType === 'pg' && (
                <div className="space-y-2 border-t pt-3">
                  <label className="block font-bold text-slate-700 uppercase">
                    Pilihan Jawaban & Kunci:
                  </label>
                  {formOptions.map((opt, i) => (
                    <div key={opt.key} className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={() => setFormCorrectKey(opt.key)}
                        className={`w-7 h-7 rounded-lg font-bold text-xs flex items-center justify-center border transition ${
                          formCorrectKey === opt.key ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-slate-100 border-slate-300'
                        }`}
                      >
                        {opt.key}
                      </button>
                      <input
                        type="text"
                        required
                        placeholder={`Teks pilihan jawaban ${opt.key}`}
                        value={opt.content}
                        onChange={(e) => {
                          const updated = [...formOptions];
                          updated[i].content = e.target.value;
                          setFormOptions(updated);
                        }}
                        className="flex-1 px-3 py-1.5 border rounded-lg"
                      />
                    </div>
                  ))}
                  <p className="text-[11px] text-slate-400">
                    *Klik huruf lingkaran (A/B/C/D) untuk memilih kunci jawaban yang benar (ditandai warna hijau).
                  </p>
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Pembahasan Soal (Opsional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Langkah penyelesaian atau penjelasan kunci jawaban..."
                  value={formExplanation}
                  onChange={(e) => setFormExplanation(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                />
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
                  Simpan Soal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Preview Soal Seperti Dilihat Siswa */}
      {previewQuestion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full p-6 space-y-4 text-slate-900 border border-slate-200">
            <div className="flex items-center justify-between border-b pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
                Pratinjau Tampilan Siswa
              </span>
              <button onClick={() => setPreviewQuestion(null)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {previewQuestion.stimulus && (
              <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-xl text-xs font-serif leading-relaxed text-slate-700">
                {previewQuestion.stimulus}
              </div>
            )}

            <div className="font-semibold text-sm leading-relaxed text-slate-900">
              {previewQuestion.question_text}
            </div>

            <div className="space-y-2">
              {previewQuestion.options.map((opt) => (
                <div key={opt.id} className="p-3 border border-slate-200 rounded-xl text-xs flex items-center space-x-3">
                  <span className="w-6 h-6 rounded bg-slate-100 font-bold text-slate-700 flex items-center justify-center text-xs">
                    {opt.key}
                  </span>
                  <span>{opt.content}</span>
                </div>
              ))}
            </div>

            {previewQuestion.explanation && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900">
                <strong>Pembahasan Guru:</strong> {previewQuestion.explanation}
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setPreviewQuestion(null)}
                className="px-4 py-2 bg-slate-800 text-white rounded-lg text-xs font-semibold"
              >
                Tutup Pratinjau
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Import Excel Soal */}
      {importModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 space-y-4 text-slate-900 border border-slate-200">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center space-x-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-base">Import Bank Soal dari Format Excel</h3>
              </div>
              <button onClick={() => setImportModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Format Kolom Excel (dipisahkan tanda pipa '|' atau tab):
              <br />
              <strong className="font-mono text-slate-700 text-[11px]">
                kode_soal | mapel | materi | indikator | level(L1-L3) | tipe | stimulus | pertanyaan | opsi_a | opsi_b | opsi_c | opsi_d | opsi_e | kunci | bobot | pembahasan
              </strong>
            </p>

            <textarea
              rows={6}
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              className="w-full p-3 border rounded-xl font-mono text-xs focus:ring-2 focus:ring-emerald-500"
            />

            {importResult && (
              <div className="p-3 bg-slate-50 border rounded-lg text-xs space-y-1">
                <div className="font-bold text-emerald-700 flex items-center space-x-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Berhasil memproses {importResult.valid} butir soal valid!</span>
                </div>
                {importResult.errors.length > 0 && (
                  <div className="text-red-600 text-[11px] pt-1 space-y-0.5">
                    {importResult.errors.map((err, i) => (
                      <div key={i}>&bull; Baris {err.line}: {err.reason}</div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-between items-center pt-2">
              <span className="text-[11px] text-slate-400">*Validasi otomatis sebelum dimasukkan ke database</span>
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => setImportModalOpen(false)}
                  className="px-4 py-2 border rounded-lg text-xs font-semibold hover:bg-slate-50"
                >
                  Tutup
                </button>
                <button
                  type="button"
                  onClick={handleProcessImport}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-md"
                >
                  Eksekusi Import Soal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
