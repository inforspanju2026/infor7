import React, { useState, useEffect } from 'react';
import { useCbt } from '../../hooks/useCbt';
import { 
  Clock, 
  CheckCircle2, 
  HelpCircle, 
  AlertTriangle, 
  Maximize2, 
  Minimize2, 
  ChevronLeft, 
  ChevronRight, 
  Save, 
  RefreshCw, 
  LogOut, 
  Check, 
  FileCheck2, 
  ShieldAlert,
  ArrowRight,
  Eye,
  Type
} from 'lucide-react';

export const CbtExamView: React.FC = () => {
  const { state, store } = useCbt();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);
  const [tabWarningModal, setTabWarningModal] = useState(false);

  const questions = store.getExamQuestions();
  const currentIndex = state.currentQuestionIndex;
  const currentQuestion = questions[currentIndex] || questions[0];
  const participant = state.currentParticipant;
  const examPackage = state.activePackage;

  // Format timer
  const formatTimer = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const timerWarning = state.remainingSeconds <= 300 ? 'text-red-500 animate-pulse font-extrabold' : state.remainingSeconds <= 900 ? 'text-amber-500 font-bold' : 'text-emerald-400 font-bold';

  // Current Answer
  const currentAns = currentQuestion ? state.studentAnswers[currentQuestion.id] : null;

  // Fullscreen Handler
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(console.error);
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(console.error);
    }
  };

  // Visibility change listener (Anti-Cheat Tab Switch Detection)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && state.isExamRunning) {
        store.recordTabSwitch();
        setTabWarningModal(true);
      }
    };

    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [state.isExamRunning, store]);

  // Answer selections
  const handleSingleSelect = (key: string) => {
    if (!currentQuestion) return;
    store.selectAnswer(currentQuestion.id, key);
  };

  const handleMultiSelect = (key: string) => {
    if (!currentQuestion) return;
    const currentKeys: string[] = Array.isArray(currentAns?.selected_key) 
      ? [...currentAns.selected_key] 
      : currentAns?.selected_key ? [String(currentAns.selected_key)] : [];
    
    const idx = currentKeys.indexOf(key);
    if (idx !== -1) {
      currentKeys.splice(idx, 1);
    } else {
      currentKeys.push(key);
    }
    store.selectAnswer(currentQuestion.id, currentKeys);
  };

  const handleTrueFalseSelect = (statementKey: string, val: 'BENAR' | 'SALAH') => {
    if (!currentQuestion) return;
    const currentMap = typeof currentAns?.selected_key === 'object' && !Array.isArray(currentAns?.selected_key)
      ? { ...currentAns.selected_key }
      : {};
    currentMap[statementKey] = val;
    store.selectAnswer(currentQuestion.id, currentMap);
  };

  const handleMatchingSelect = (leftKey: string, matchedVal: string) => {
    if (!currentQuestion) return;
    const currentMap = typeof currentAns?.selected_key === 'object' && !Array.isArray(currentAns?.selected_key)
      ? { ...currentAns.selected_key }
      : {};
    currentMap[leftKey] = matchedVal;
    store.selectAnswer(currentQuestion.id, currentMap);
  };

  const handleTextChange = (text: string) => {
    if (!currentQuestion) return;
    store.selectAnswer(currentQuestion.id, text, text);
  };

  // Font styling
  const fontClasses = {
    normal: 'text-sm sm:text-base leading-relaxed',
    large: 'text-base sm:text-lg leading-relaxed',
    xlarge: 'text-lg sm:text-xl leading-relaxed',
  }[state.fontSize];

  // Contrast theme styling
  const themeClasses = {
    normal: 'bg-slate-100 text-slate-800',
    dark: 'bg-slate-950 text-slate-100',
    sepia: 'bg-[#fcf8e8] text-[#433422]',
  }[state.contrastMode];

  const cardTheme = {
    normal: 'bg-white border-slate-200 text-slate-900',
    dark: 'bg-slate-900 border-slate-800 text-slate-100',
    sepia: 'bg-[#f7f2dc] border-[#e6dcbe] text-[#3d2e1c]',
  }[state.contrastMode];

  // If exam is completed, show summary screen
  if (state.isExamFinished && state.lastScoreSummary) {
    const summary = state.lastScoreSummary;
    const showScore = examPackage?.show_results_to_student || examPackage?.exam_type === 'simulation';

    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-4">
        <div className="max-w-lg w-full bg-slate-800 rounded-2xl shadow-2xl border border-slate-700 p-8 text-center space-y-6">
          <div className="w-20 h-20 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center border border-emerald-500/40">
            <FileCheck2 className="w-10 h-10" />
          </div>

          <div>
            <span className="text-xs uppercase font-extrabold tracking-widest text-emerald-400">
              Asesmen Berhasil Diselesaikan
            </span>
            <h2 className="text-2xl font-black mt-1 text-white">Bukti Penyelesaian Ujian</h2>
            <p className="text-xs text-slate-400 mt-1">
              Jawaban Anda telah tersimpan secara permanen dan aman di server CBT Supabase.
            </p>
          </div>

          <div className="p-4 bg-slate-900/80 rounded-xl border border-slate-700/60 text-left space-y-2 text-xs">
            <div className="flex justify-between border-b border-slate-800 pb-2">
              <span className="text-slate-400">Nama Peserta:</span>
              <span className="font-bold text-white">{participant?.student_name}</span>
            </div>
            <div className="flex justify-between border-b border-slate-800 pb-2">
              <span className="text-slate-400">Nomor Peserta:</span>
              <span className="font-mono font-semibold text-blue-300">{participant?.participant_number}</span>
            </div>
            <div className="flex justify-between border-b border-slate-800 pb-2">
              <span className="text-slate-400">Mata Pelajaran:</span>
              <span className="font-semibold text-white">{examPackage?.subject_name}</span>
            </div>
            <div className="flex justify-between border-b border-slate-800 pb-2">
              <span className="text-slate-400">Total Soal Dijawab:</span>
              <span className="font-bold text-emerald-400">{participant?.answers_count} dari {questions.length}</span>
            </div>

            {showScore && (
              <div className="pt-2 text-center">
                <span className="text-[11px] text-slate-400 uppercase tracking-wider block">Skor Akhir Simulasi:</span>
                <span className="text-4xl font-black text-emerald-400 tracking-tight">{summary.score}</span>
                <div className="text-[11px] text-slate-400 mt-1">
                  Benar: {summary.correct} &bull; Salah: {summary.wrong} &bull; Kosong: {summary.unanswered}
                </div>
              </div>
            )}
          </div>

          <button
            onClick={() => store.logout()}
            className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-bold shadow-lg transition"
          >
            Keluar & Selesai
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex flex-col ${themeClasses} select-none`}>
      {/* 1. CBT EXAM TOP BAR */}
      <header className="bg-slate-900 text-white border-b border-slate-800 px-4 sm:px-6 py-3 sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Left: Participant info */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-blue-600 font-bold text-white flex items-center justify-center text-sm shadow-inner">
              {participant?.student_name.charAt(0) || 'P'}
            </div>
            <div>
              <div className="text-xs sm:text-sm font-bold truncate max-w-[160px] sm:max-w-xs text-white">
                {participant?.student_name}
              </div>
              <div className="text-[11px] text-slate-400 font-mono flex items-center space-x-2">
                <span>{participant?.participant_number}</span>
                <span>&bull;</span>
                <span className="text-blue-300 font-medium">{examPackage?.subject_name}</span>
              </div>
            </div>
          </div>

          {/* Center: Real-Time Server Synced Timer */}
          <div className="flex flex-col items-center">
            <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Sisa Waktu</span>
            <div className={`font-mono text-lg sm:text-2xl flex items-center space-x-1.5 ${timerWarning}`}>
              <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>{formatTimer(state.remainingSeconds)}</span>
            </div>
          </div>

          {/* Right: Accessibility, Fullscreen, & Sync Status */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Autosave Status Indicator */}
            <div className="hidden md:flex items-center space-x-1.5 text-xs px-2.5 py-1 rounded bg-slate-800 border border-slate-700">
              {state.syncStatus === 'saving' ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 text-amber-400 animate-spin" />
                  <span className="text-amber-300 text-[11px]">Menyimpan...</span>
                </>
              ) : state.syncStatus === 'offline_queue' ? (
                <>
                  <Save className="w-3.5 h-3.5 text-orange-400" />
                  <span className="text-orange-300 text-[11px]">Tersimpan Lokal</span>
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-300 text-[11px]">Tersimpan</span>
                </>
              )}
            </div>

            {/* Font Size Adjuster */}
            <div className="flex items-center bg-slate-800 rounded-lg p-0.5 border border-slate-700 text-xs">
              <button
                onClick={() => store.setFontSize('normal')}
                title="Ukuran Font Normal"
                className={`px-1.5 py-0.5 rounded text-[11px] font-bold ${state.fontSize === 'normal' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                A
              </button>
              <button
                onClick={() => store.setFontSize('large')}
                title="Ukuran Font Sedang"
                className={`px-1.5 py-0.5 rounded text-xs font-bold ${state.fontSize === 'large' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                A+
              </button>
              <button
                onClick={() => store.setFontSize('xlarge')}
                title="Ukuran Font Besar"
                className={`px-1.5 py-0.5 rounded text-sm font-bold ${state.fontSize === 'xlarge' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                A++
              </button>
            </div>

            {/* Contrast Theme Selector */}
            <button
              onClick={() => {
                const next = state.contrastMode === 'normal' ? 'sepia' : state.contrastMode === 'sepia' ? 'dark' : 'normal';
                store.setContrastMode(next);
              }}
              title="Ganti Mode Kontras Warna"
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 transition text-xs flex items-center space-x-1"
            >
              <Eye className="w-4 h-4 text-blue-400" />
              <span className="text-[10px] hidden sm:inline capitalize">{state.contrastMode}</span>
            </button>

            {/* Fullscreen Toggle */}
            <button
              onClick={toggleFullscreen}
              title={isFullscreen ? 'Keluar Layar Penuh' : 'Mode Layar Penuh'}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 transition"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </header>

      {/* 2. MAIN LAYOUT: QUESTION AREA + QUESTION MATRIX */}
      <main className="max-w-7xl w-full mx-auto p-4 sm:p-6 flex-1 flex flex-col lg:flex-row gap-6">
        {/* Left: Active Question Area */}
        <section className="flex-1 flex flex-col">
          <div className={`p-6 rounded-2xl border shadow-sm flex-1 flex flex-col justify-between ${cardTheme}`}>
            {/* Top Question Header */}
            <div>
              <div className="flex items-center justify-between border-b pb-4 mb-4 border-slate-200 dark:border-slate-800">
                <div className="flex items-center space-x-2">
                  <span className="w-8 h-8 rounded-lg bg-blue-600 text-white font-extrabold flex items-center justify-center text-sm shadow-sm">
                    {currentIndex + 1}
                  </span>
                  <div>
                    <span className="text-xs uppercase font-extrabold tracking-wider text-blue-600">
                      Soal Nomor {currentIndex + 1} dari {questions.length}
                    </span>
                    <div className="text-[11px] text-slate-400">
                      Tipe: <strong className="uppercase">{currentQuestion?.question_type}</strong> &bull; Bobot: {currentQuestion?.points} Poin
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {currentAns?.is_doubt && (
                    <span className="text-xs bg-amber-500/20 text-amber-600 dark:text-amber-400 font-bold px-2 py-0.5 rounded border border-amber-500/30">
                      Ragu-ragu
                    </span>
                  )}
                </div>
              </div>

              {/* Stimulus Passage (if exists) */}
              {currentQuestion?.stimulus && (
                <div className="mb-6 p-4 rounded-xl bg-blue-50/60 dark:bg-slate-800/60 border border-blue-100 dark:border-slate-700 text-xs sm:text-sm leading-relaxed font-serif">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-blue-700 dark:text-blue-400 block mb-1">
                    Stimulus Bacaan / Konteks:
                  </span>
                  <div className="whitespace-pre-line text-slate-700 dark:text-slate-300">
                    {currentQuestion.stimulus}
                  </div>
                </div>
              )}

              {/* Question Text */}
              <div className={`font-semibold mb-6 ${fontClasses}`}>
                {currentQuestion?.question_text}
              </div>

              {/* Interactive Answers based on question_type */}
              <div className="space-y-3">
                {/* A. Pilihan Ganda (PG) */}
                {currentQuestion?.question_type === 'pg' && (
                  <div className="space-y-2.5">
                    {currentQuestion.options.map((opt) => {
                      const isSelected = currentAns?.selected_key === opt.key;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => handleSingleSelect(opt.key)}
                          className={`w-full text-left p-3.5 rounded-xl border transition flex items-start space-x-3 ${
                            isSelected
                              ? 'border-blue-600 bg-blue-50/80 dark:bg-blue-950/40 text-blue-900 dark:text-blue-100 ring-2 ring-blue-500 shadow-sm'
                              : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                          }`}
                        >
                          <span className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs flex-shrink-0 transition ${
                            isSelected ? 'bg-blue-600 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                          }`}>
                            {opt.key}
                          </span>
                          <span className={`pt-0.5 ${fontClasses}`}>{opt.content}</span>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* B. Pilihan Ganda Kompleks (PGK) */}
                {currentQuestion?.question_type === 'pg_kompleks' && (
                  <div className="space-y-2.5">
                    <div className="text-xs text-blue-600 dark:text-blue-400 font-medium mb-1">
                      *Pilihlah semua opsi jawaban yang benar (dapat lebih dari satu):
                    </div>
                    {currentQuestion.options.map((opt) => {
                      const selectedKeys = Array.isArray(currentAns?.selected_key)
                        ? currentAns.selected_key
                        : currentAns?.selected_key ? [String(currentAns.selected_key)] : [];
                      const isSelected = selectedKeys.includes(opt.key);

                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => handleMultiSelect(opt.key)}
                          className={`w-full text-left p-3.5 rounded-xl border transition flex items-start space-x-3 ${
                            isSelected
                              ? 'border-blue-600 bg-blue-50/80 dark:bg-blue-950/40 text-blue-900 dark:text-blue-100 ring-2 ring-blue-500 shadow-sm'
                              : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                          }`}
                        >
                          <span className={`w-6 h-6 rounded flex items-center justify-center text-xs flex-shrink-0 border transition ${
                            isSelected ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-300 dark:border-slate-600'
                          }`}>
                            {isSelected ? <Check className="w-4 h-4" /> : opt.key}
                          </span>
                          <span className={`pt-0.5 ${fontClasses}`}>{opt.content}</span>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* C. Benar / Salah Matrix */}
                {currentQuestion?.question_type === 'benar_salah' && (
                  <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden text-xs sm:text-sm">
                    <table className="w-full text-left border-collapse">
                      <thead className="bg-slate-100 dark:bg-slate-800 font-bold border-b border-slate-200 dark:border-slate-700">
                        <tr>
                          <th className="p-3">Pernyataan</th>
                          <th className="p-3 text-center w-24">BENAR</th>
                          <th className="p-3 text-center w-24">SALAH</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                        {currentQuestion.options.map((opt) => {
                          const stateMap = typeof currentAns?.selected_key === 'object' && !Array.isArray(currentAns?.selected_key)
                            ? currentAns.selected_key
                            : {};
                          const chosen = stateMap[opt.key];

                          return (
                            <tr key={opt.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                              <td className="p-3 text-slate-700 dark:text-slate-300">{opt.content}</td>
                              <td className="p-3 text-center">
                                <button
                                  type="button"
                                  onClick={() => handleTrueFalseSelect(opt.key, 'BENAR')}
                                  className={`w-7 h-7 rounded-full border inline-flex items-center justify-center font-bold text-xs transition ${
                                    chosen === 'BENAR'
                                      ? 'bg-emerald-600 text-white border-emerald-600'
                                      : 'border-slate-300 hover:border-emerald-500'
                                  }`}
                                >
                                  {chosen === 'BENAR' ? '✓' : ''}
                                </button>
                              </td>
                              <td className="p-3 text-center">
                                <button
                                  type="button"
                                  onClick={() => handleTrueFalseSelect(opt.key, 'SALAH')}
                                  className={`w-7 h-7 rounded-full border inline-flex items-center justify-center font-bold text-xs transition ${
                                    chosen === 'SALAH'
                                      ? 'bg-red-600 text-white border-red-600'
                                      : 'border-slate-300 hover:border-red-500'
                                  }`}
                                >
                                  {chosen === 'SALAH' ? '✓' : ''}
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* D. Menjodohkan (Matching) */}
                {currentQuestion?.question_type === 'menjodohkan' && (
                  <div className="space-y-3">
                    <div className="text-xs text-blue-600 dark:text-blue-400 font-medium mb-1">
                      *Pasangkan setiap butir pada kolom kiri dengan pilihan yang sesuai pada dropdown:
                    </div>
                    {currentQuestion.options.map((opt) => {
                      const stateMap = typeof currentAns?.selected_key === 'object' && !Array.isArray(currentAns?.selected_key)
                        ? currentAns.selected_key
                        : {};
                      const selectedMatch = stateMap[opt.key] || '';

                      return (
                        <div key={opt.id} className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <span className="font-semibold text-xs sm:text-sm">{opt.content}</span>
                          <select
                            value={selectedMatch}
                            onChange={(e) => handleMatchingSelect(opt.key, e.target.value)}
                            className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs sm:text-sm focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="">-- Pilih Pasangan --</option>
                            {currentQuestion.options.map((pair) => (
                              <option key={pair.id} value={pair.matched_pair || pair.content}>
                                {pair.matched_pair || pair.content}
                              </option>
                            ))}
                          </select>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* E. Isian Singkat */}
                {currentQuestion?.question_type === 'isian' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                      Ketikkan Jawaban Singkat Anda:
                    </label>
                    <input
                      type="text"
                      placeholder="Tulis jawaban di sini..."
                      value={currentAns?.text_answer || (typeof currentAns?.selected_key === 'string' ? currentAns.selected_key : '')}
                      onChange={(e) => handleTextChange(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono text-base focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                )}

                {/* F. Uraian / Essay */}
                {currentQuestion?.question_type === 'uraian' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                      Tuliskan Uraian Penjelasan Lengkap:
                    </label>
                    <textarea
                      rows={5}
                      placeholder="Jelaskan secara terperinci argumen atau langkah penyelesaian Anda..."
                      value={currentAns?.text_answer || ''}
                      onChange={(e) => handleTextChange(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm leading-relaxed focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Nav Controls */}
            <div className="pt-8 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 mt-6">
              <button
                type="button"
                disabled={currentIndex === 0}
                onClick={() => store.navigateQuestion(currentIndex - 1)}
                className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold text-xs sm:text-sm transition flex items-center space-x-1.5 disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Sebelumnya</span>
              </button>

              {/* Ragu-ragu Checkbox */}
              {currentQuestion && (
                <button
                  type="button"
                  onClick={() => store.toggleDoubt(currentQuestion.id)}
                  className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition flex items-center space-x-2 ${
                    currentAns?.is_doubt
                      ? 'bg-amber-500 text-white shadow-md'
                      : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-700/60 hover:bg-amber-100'
                  }`}
                >
                  <HelpCircle className="w-4 h-4" />
                  <span>{currentAns?.is_doubt ? 'Batal Ragu-ragu' : 'Tandai Ragu-ragu'}</span>
                </button>
              )}

              {currentIndex < questions.length - 1 ? (
                <button
                  type="button"
                  onClick={() => store.navigateQuestion(currentIndex + 1)}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs sm:text-sm transition flex items-center space-x-1.5 shadow-sm"
                >
                  <span>Berikutnya</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowConfirmSubmit(true)}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs sm:text-sm transition flex items-center space-x-1.5 shadow-md"
                >
                  <span>Selesai Ujian</span>
                  <CheckCircle2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </section>

        {/* Right: Question Matrix Navigator Sidebar */}
        <aside className="w-full lg:w-80 flex flex-col space-y-4">
          <div className={`p-5 rounded-2xl border shadow-sm ${cardTheme}`}>
            <div className="flex items-center justify-between mb-4 border-b pb-3 border-slate-200 dark:border-slate-800">
              <span className="font-extrabold text-xs uppercase tracking-wider">Daftar Nomor Soal</span>
              <span className="text-xs text-slate-500 font-mono">
                {participant?.answers_count} / {questions.length} Selesai
              </span>
            </div>

            {/* Matrix Grid */}
            <div className="grid grid-cols-5 gap-2 max-h-72 overflow-y-auto p-1">
              {questions.map((q, idx) => {
                const ans = state.studentAnswers[q.id];
                const hasAnswer = (ans?.selected_key !== undefined && ans?.selected_key !== null && ans?.selected_key !== '') || (ans?.text_answer && ans.text_answer.trim() !== '');
                const isDoubt = ans?.is_doubt;
                const isCurrent = idx === currentIndex;

                let bgStyle = 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700';
                if (hasAnswer) {
                  bgStyle = 'bg-emerald-600 text-white border-emerald-600 font-bold';
                }
                if (isDoubt) {
                  bgStyle = 'bg-amber-500 text-white border-amber-500 font-bold';
                }

                return (
                  <button
                    key={q.id}
                    onClick={() => store.navigateQuestion(idx)}
                    className={`h-10 rounded-lg text-xs font-mono font-bold border transition flex items-center justify-center relative ${bgStyle} ${
                      isCurrent ? 'ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-slate-900 scale-105 z-10' : ''
                    }`}
                  >
                    <span>{idx + 1}</span>
                    {isDoubt && (
                      <span className="w-2 h-2 rounded-full bg-white absolute top-1 right-1"></span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 space-y-1.5 text-[11px]">
              <div className="flex items-center space-x-2">
                <span className="w-3.5 h-3.5 rounded bg-emerald-600"></span>
                <span>Sudah dijawab ({participant?.answers_count})</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-3.5 h-3.5 rounded bg-amber-500"></span>
                <span>Ragu-ragu ({participant?.doubt_count})</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-3.5 h-3.5 rounded bg-slate-200 dark:bg-slate-700 border"></span>
                <span>Belum dijawab ({questions.length - (participant?.answers_count || 0)})</span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setShowConfirmSubmit(true)}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow transition flex items-center justify-center space-x-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Konfirmasi Selesai Ujian</span>
              </button>
            </div>
          </div>
        </aside>
      </main>

      {/* 3. CONFIRM SUBMIT MODAL */}
      {showConfirmSubmit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 dark:border-slate-800 p-6 space-y-5 text-slate-900 dark:text-slate-100">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-500 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold">Apakah Anda Yakin Ingin Menyelesaikan Ujian?</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Setelah selesai, Anda tidak dapat mengubah jawaban atau mengulang kembali ujian ini.
              </p>
            </div>

            <div className="p-3.5 bg-slate-100 dark:bg-slate-800 rounded-xl space-y-2 text-xs">
              <div className="flex justify-between">
                <span>Soal Sudah Dijawab:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">{participant?.answers_count} Soal</span>
              </div>
              <div className="flex justify-between">
                <span>Masih Ragu-ragu:</span>
                <span className="font-bold text-amber-600 dark:text-amber-400">{participant?.doubt_count} Soal</span>
              </div>
              <div className="flex justify-between">
                <span>Belum Dijawab:</span>
                <span className="font-bold text-red-600 dark:text-red-400">
                  {questions.length - (participant?.answers_count || 0)} Soal
                </span>
              </div>
            </div>

            {(participant?.doubt_count || 0) > 0 && (
              <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 rounded-xl text-xs text-amber-800 dark:text-amber-300 flex items-start space-x-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                <span>
                  Perhatian: Anda masih memiliki {participant?.doubt_count} soal ragu-ragu. Status ragu-ragu tetap akan dinilai berdasarkan pilihan terakhir Anda.
                </span>
              </div>
            )}

            <div className="flex items-center space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmSubmit(false)}
                className="w-1/2 py-2.5 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                Cek Kembali
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowConfirmSubmit(false);
                  store.finishExam(false);
                }}
                className="w-1/2 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md transition"
              >
                Ya, Selesai Sekarang
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. ANTI-CHEAT TAB SWITCH WARNING MODAL */}
      {tabWarningModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-md w-full border border-red-300 dark:border-red-900 p-6 space-y-4 text-center">
            <div className="w-14 h-14 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 mx-auto flex items-center justify-center">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-red-600">Peringatan Keamanan Asesmen!</h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-2">
                Sistem mendeteksi Anda berpindah jendela / tab browser ({state.tabSwitchCount} kali).
                Aktivitas ini dicatat dalam <strong>Audit Log Proktor</strong> secara real-time.
              </p>
            </div>
            <button
              onClick={() => setTabWarningModal(false)}
              className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition shadow-md"
            >
              Saya Mengerti & Kembali ke Ujian
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
