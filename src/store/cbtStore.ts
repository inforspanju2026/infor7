import { 
  UserRole, 
  School, 
  ClassGrade, 
  Student, 
  Subject, 
  Question, 
  ExamPackage, 
  ExamSession, 
  ExamParticipant, 
  StudentAnswer, 
  AuditLog, 
  SystemLog, 
  SystemHealth 
} from '../types';
import { 
  SEED_SCHOOL, 
  SEED_CLASSES, 
  SEED_SUBJECTS, 
  SEED_STUDENTS, 
  SEED_QUESTIONS, 
  SEED_EXAM_PACKAGES, 
  SEED_EXAM_SESSIONS, 
  SEED_PARTICIPANTS, 
  SEED_AUDIT_LOGS, 
  SEED_SYSTEM_LOGS, 
  SEED_SYSTEM_HEALTH 
} from '../data/seedData';
import { getSupabaseClient, getStoredSupabaseConfig } from '../lib/supabase';

const CBT_DATA_STORE_KEY = 'cbt_smpn7_pasuruan_data_v2';
const CBT_EXAM_SESSION_KEY = 'cbt_smpn7_pasuruan_active_session_v2';

export interface CurrentUser {
  id: string;
  name: string;
  role: UserRole;
  email?: string;
  studentId?: string;
  participantId?: string;
  schoolId: string;
  className?: string;
}

export interface CbtState {
  currentUser: CurrentUser | null;
  school: School;
  classes: ClassGrade[];
  students: Student[];
  subjects: Subject[];
  questions: Question[];
  examPackages: ExamPackage[];
  examSessions: ExamSession[];
  participants: ExamParticipant[];
  studentAnswers: Record<string, StudentAnswer>;
  auditLogs: AuditLog[];
  systemLogs: SystemLog[];
  systemHealth: SystemHealth;

  // Active student exam states
  activePackage: ExamPackage | null;
  currentParticipant: ExamParticipant | null;
  currentQuestionIndex: number;
  fontSize: 'normal' | 'large' | 'xlarge';
  contrastMode: 'normal' | 'dark' | 'sepia';
  syncStatus: 'saved' | 'saving' | 'offline_queue' | 'error';
  networkStatus: 'online' | 'syncing' | 'offline';
  remainingSeconds: number;
  isExamRunning: boolean;
  isExamFinished: boolean;
  tabSwitchCount: number;
  lastScoreSummary: {
    score: number;
    correct: number;
    wrong: number;
    unanswered: number;
  } | null;
}

// Initial state constructor with localStorage persistence
function loadInitialData(): Partial<CbtState> {
  try {
    const saved = localStorage.getItem(CBT_DATA_STORE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        school: parsed.school || SEED_SCHOOL,
        classes: parsed.classes || SEED_CLASSES,
        students: parsed.students || SEED_STUDENTS,
        subjects: parsed.subjects || SEED_SUBJECTS,
        questions: parsed.questions || SEED_QUESTIONS,
        examPackages: parsed.examPackages || SEED_EXAM_PACKAGES,
        examSessions: parsed.examSessions || SEED_EXAM_SESSIONS,
        participants: parsed.participants || SEED_PARTICIPANTS,
        auditLogs: parsed.auditLogs || SEED_AUDIT_LOGS,
        systemLogs: parsed.systemLogs || SEED_SYSTEM_LOGS,
      };
    }
  } catch (e) {
    console.error('Failed to load initial local state', e);
  }

  return {
    school: SEED_SCHOOL,
    classes: SEED_CLASSES,
    students: SEED_STUDENTS,
    subjects: SEED_SUBJECTS,
    questions: SEED_QUESTIONS,
    examPackages: SEED_EXAM_PACKAGES,
    examSessions: SEED_EXAM_SESSIONS,
    participants: SEED_PARTICIPANTS,
    auditLogs: SEED_AUDIT_LOGS,
    systemLogs: SEED_SYSTEM_LOGS,
  };
}

class CbtStoreManager {
  private state: CbtState;
  private listeners: Set<() => void> = new Set();
  private timerInterval: any = null;
  private heartbeatInterval: any = null;
  private saveDebounceTimer: any = null;

  constructor() {
    const initialData = loadInitialData();
    this.state = {
      currentUser: null,
      school: initialData.school || SEED_SCHOOL,
      classes: initialData.classes || SEED_CLASSES,
      students: initialData.students || SEED_STUDENTS,
      subjects: initialData.subjects || SEED_SUBJECTS,
      questions: initialData.questions || SEED_QUESTIONS,
      examPackages: initialData.examPackages || SEED_EXAM_PACKAGES,
      examSessions: initialData.examSessions || SEED_EXAM_SESSIONS,
      participants: initialData.participants || SEED_PARTICIPANTS,
      studentAnswers: {},
      auditLogs: initialData.auditLogs || SEED_AUDIT_LOGS,
      systemLogs: initialData.systemLogs || SEED_SYSTEM_LOGS,
      systemHealth: SEED_SYSTEM_HEALTH,

      activePackage: null,
      currentParticipant: null,
      currentQuestionIndex: 0,
      fontSize: 'normal',
      contrastMode: 'normal',
      syncStatus: 'saved',
      networkStatus: 'online',
      remainingSeconds: 3600,
      isExamRunning: false,
      isExamFinished: false,
      tabSwitchCount: 0,
      lastScoreSummary: null,
    };

    // Listen to browser online/offline events
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => this.handleNetworkChange(true));
      window.addEventListener('offline', () => this.handleNetworkChange(false));
      this.restoreActiveExamSession();
    }
  }

  private handleNetworkChange(isOnline: boolean) {
    this.state.networkStatus = isOnline ? 'syncing' : 'offline';
    this.notify();

    if (isOnline) {
      setTimeout(() => {
        this.syncOfflineQueue();
        this.state.networkStatus = 'online';
        this.notify();
      }, 1200);
    }
  }

  private persistState() {
    try {
      const dataToSave = {
        school: this.state.school,
        classes: this.state.classes,
        students: this.state.students,
        subjects: this.state.subjects,
        questions: this.state.questions,
        examPackages: this.state.examPackages,
        examSessions: this.state.examSessions,
        participants: this.state.participants,
        auditLogs: this.state.auditLogs.slice(0, 100),
        systemLogs: this.state.systemLogs.slice(0, 100),
      };
      localStorage.setItem(CBT_DATA_STORE_KEY, JSON.stringify(dataToSave));
    } catch (err) {
      console.warn('LocalStorage save quota exceeded or failed:', err);
    }
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach((l) => l());
  }

  public getState(): CbtState {
    return this.state;
  }

  // --- Authentications ---
  public loginAs(role: UserRole, emailOrUser: string): boolean {
    const school = this.state.school;
    let name = 'Administrator';
    if (role === 'super_admin') name = 'Super Administrator';
    else if (role === 'admin_sekolah') name = 'Admin SMPN 7 Pasuruan';
    else if (role === 'operator') name = 'Operator CBT SMPN 7 Pasuruan';
    else if (role === 'proktor') name = 'Hendra Setiawan, S.Pd (Proktor)';
    else if (role === 'teknisi') name = 'Rudi Hartono, A.Md (Teknisi)';
    else if (role === 'guru') name = 'Dra. Siti Rahmawati (Guru)';
    else if (role === 'pengawas') name = 'M. Yusuf, S.Pd (Pengawas Ruang)';

    this.state.currentUser = {
      id: `usr-${role}-${Date.now().toString(36)}`,
      name,
      role,
      email: emailOrUser,
      schoolId: school.id,
    };

    this.logAudit('Login Petugas', `Pengguna ${name} login dengan role ${role}`);
    this.notify();
    return true;
  }

  public loginStudent(noPesertaOrNisn: string, pin: string, token: string): { success: boolean; message: string } {
    const student = this.state.students.find(
      (s) => (s.participant_number.toLowerCase() === noPesertaOrNisn.toLowerCase() || s.nisn === noPesertaOrNisn || s.username === noPesertaOrNisn) && s.pin === pin
    );

    if (!student) {
      return { success: false, message: 'Nomor Peserta/NISN atau PIN salah. Silakan periksa kembali kartu peserta Anda.' };
    }

    // Find active package with matching token
    const pkg = this.state.examPackages.find((p) => p.token.toUpperCase() === token.toUpperCase());
    if (!pkg) {
      return { success: false, message: 'Token Ujian tidak ditemukan atau belum diaktifkan oleh proktor.' };
    }

    if (!pkg.is_token_active) {
      return { success: false, message: 'Token Ujian saat ini sedang dinonaktifkan oleh proktor.' };
    }

    // Find or create participant entry
    let participant = this.state.participants.find(
      (p) => p.student_id === student.id && p.exam_package_id === pkg.id
    );

    if (!participant) {
      const cls = this.state.classes.find((c) => c.id === student.class_id);
      participant = {
        id: `part-${student.id}-${Date.now().toString(36)}`,
        exam_package_id: pkg.id,
        exam_session_id: this.state.examSessions[0]?.id || 'ses-01',
        student_id: student.id,
        student_name: student.full_name,
        participant_number: student.participant_number,
        nisn: student.nisn,
        class_name: cls?.name || 'IX A',
        status: 'login',
        remaining_seconds: pkg.duration_minutes * 60,
        allocated_seconds: pkg.duration_minutes * 60 + (student.needs_accessibility ? 900 : 0),
        additional_minutes: student.needs_accessibility ? 15 : 0,
        answers_count: 0,
        doubt_count: 0,
        total_questions: pkg.total_questions,
        is_synced: true,
        last_heartbeat: new Date().toISOString(),
        tab_switch_count: 0,
        reset_count: 0,
      };
      this.state.participants.unshift(participant);
      this.persistState();
    } else {
      if (participant.status === 'selesai' || participant.status === 'waktu_habis') {
        return { success: false, message: 'Anda telah menyelesaikan ujian ini. Tidak dapat login kembali.' };
      }
      participant.status = 'login';
      participant.last_heartbeat = new Date().toISOString();
    }

    this.state.currentUser = {
      id: student.id,
      name: student.full_name,
      role: 'peserta',
      studentId: student.id,
      participantId: participant.id,
      schoolId: student.school_id,
      className: participant.class_name,
    };

    this.state.activePackage = pkg;
    this.state.currentParticipant = participant;
    this.state.remainingSeconds = participant.remaining_seconds;

    // Load any saved answers from session storage or state
    this.restoreParticipantAnswers(participant.id);

    this.logAudit('Login Peserta', `Peserta ${student.full_name} (${student.participant_number}) berhasil verifikasi token ${token}`);
    this.notify();
    return { success: true, message: 'Verifikasi berhasil' };
  }

  public startStudentExam(): void {
    if (!this.state.currentParticipant || !this.state.activePackage) return;
    
    this.state.currentParticipant.status = 'sedang_ujian';
    if (!this.state.currentParticipant.start_time) {
      this.state.currentParticipant.start_time = new Date().toISOString();
    }
    this.state.isExamRunning = true;
    this.state.isExamFinished = false;

    this.startTimer();
    this.startHeartbeat();
    this.persistActiveExamSession();
    this.logAudit('Mulai Pengerjaan', `Peserta ${this.state.currentParticipant.student_name} memulai pengerjaan soal ujian`);
    this.notify();
  }

  private startTimer(): void {
    if (this.timerInterval) clearInterval(this.timerInterval);
    this.timerInterval = setInterval(() => {
      if (this.state.remainingSeconds > 0 && this.state.isExamRunning) {
        this.state.remainingSeconds -= 1;
        if (this.state.currentParticipant) {
          this.state.currentParticipant.remaining_seconds = this.state.remainingSeconds;
        }

        // Periodic persist every 30 seconds
        if (this.state.remainingSeconds % 30 === 0) {
          this.persistActiveExamSession();
        }

        this.notify();
      } else if (this.state.remainingSeconds <= 0 && this.state.isExamRunning) {
        this.finishExam(true); // Auto submit
      }
    }, 1000);
  }

  private startHeartbeat(): void {
    if (this.heartbeatInterval) clearInterval(this.heartbeatInterval);
    this.heartbeatInterval = setInterval(() => {
      if (this.state.currentParticipant && this.state.isExamRunning) {
        this.state.currentParticipant.last_heartbeat = new Date().toISOString();
        this.state.currentParticipant.is_synced = this.state.networkStatus === 'online';
        this.notify();
      }
    }, 10000);
  }

  public recordTabSwitch(): void {
    if (!this.state.currentParticipant || !this.state.isExamRunning) return;
    this.state.tabSwitchCount += 1;
    this.state.currentParticipant.tab_switch_count = this.state.tabSwitchCount;
    this.logAudit('Peringatan Tab Switch', `Peserta ${this.state.currentParticipant.student_name} terdeteksi berpindah jendela/tab (${this.state.tabSwitchCount}x)`);
    this.notify();
  }

  // --- Answers & Autosave ---
  public selectAnswer(questionId: string, answerKey: string | string[] | Record<string, string>, textAnswer?: string): void {
    if (!this.state.currentParticipant || !this.state.isExamRunning) return;

    this.state.syncStatus = 'saving';
    this.notify();

    const currentAnswer = this.state.studentAnswers[questionId] || {
      id: `ans-${questionId}-${Date.now().toString(36)}`,
      exam_participant_id: this.state.currentParticipant.id,
      question_id: questionId,
      question_number: this.state.currentQuestionIndex + 1,
      is_doubt: false,
      saved_at: new Date().toISOString(),
      sync_status: 'saving'
    };

    currentAnswer.selected_key = answerKey;
    if (textAnswer !== undefined) {
      currentAnswer.text_answer = textAnswer;
    }
    currentAnswer.saved_at = new Date().toISOString();

    this.state.studentAnswers[questionId] = currentAnswer;

    // Recalculate answered counts
    this.recalculateAnswersStats();

    // Debounced sync
    if (this.saveDebounceTimer) clearTimeout(this.saveDebounceTimer);
    this.saveDebounceTimer = setTimeout(() => {
      this.saveAnswerToBackend(questionId);
    }, 350);
  }

  public toggleDoubt(questionId: string): void {
    if (!this.state.currentParticipant || !this.state.isExamRunning) return;

    const answer = this.state.studentAnswers[questionId] || {
      id: `ans-${questionId}-${Date.now().toString(36)}`,
      exam_participant_id: this.state.currentParticipant.id,
      question_id: questionId,
      question_number: this.state.currentQuestionIndex + 1,
      is_doubt: false,
      saved_at: new Date().toISOString(),
      sync_status: 'saving'
    };

    answer.is_doubt = !answer.is_doubt;
    this.state.studentAnswers[questionId] = answer;
    this.recalculateAnswersStats();
    this.saveAnswerToBackend(questionId);
    this.notify();
  }

  private recalculateAnswersStats(): void {
    if (!this.state.currentParticipant) return;
    const answersList = Object.values(this.state.studentAnswers);
    const answeredCount = answersList.filter(
      (a) => (a.selected_key !== undefined && a.selected_key !== null && a.selected_key !== '') || (a.text_answer && a.text_answer.trim() !== '')
    ).length;
    const doubtCount = answersList.filter((a) => a.is_doubt).length;

    this.state.currentParticipant.answers_count = answeredCount;
    this.state.currentParticipant.doubt_count = doubtCount;
    this.notify();
  }

  private saveAnswerToBackend(questionId: string): void {
    const answer = this.state.studentAnswers[questionId];
    if (!answer) return;

    // Save locally to session storage
    this.persistActiveExamSession();

    if (this.state.networkStatus === 'offline') {
      answer.sync_status = 'offline_queue';
      this.state.syncStatus = 'offline_queue';
      this.notify();
      return;
    }

    // Try Supabase if configured
    const client = getSupabaseClient();
    if (client && this.state.currentParticipant) {
      client.rpc('submit_answer_idempotent', {
        p_participant_id: this.state.currentParticipant.id,
        p_question_id: questionId,
        p_question_number: answer.question_number,
        p_selected_key: answer.selected_key,
        p_text_answer: answer.text_answer || null,
        p_is_doubt: answer.is_doubt
      }).then(({ error }) => {
        if (error) {
          console.warn('Supabase remote answer sync failed, stored locally:', error);
          answer.sync_status = 'offline_queue';
          this.state.syncStatus = 'offline_queue';
        } else {
          answer.sync_status = 'saved';
          this.state.syncStatus = 'saved';
        }
        this.notify();
      });
    } else {
      // Local state sync
      setTimeout(() => {
        answer.sync_status = 'saved';
        this.state.syncStatus = 'saved';
        this.notify();
      }, 150);
    }
  }

  private syncOfflineQueue(): void {
    this.state.syncStatus = 'saving';
    this.notify();
    setTimeout(() => {
      Object.values(this.state.studentAnswers).forEach((a) => {
        a.sync_status = 'saved';
      });
      this.state.syncStatus = 'saved';
      this.notify();
    }, 800);
  }

  public navigateQuestion(index: number): void {
    if (index >= 0 && index < this.getExamQuestions().length) {
      this.state.currentQuestionIndex = index;
      this.notify();
    }
  }

  public getExamQuestions(): Question[] {
    if (!this.state.activePackage) return this.state.questions.slice(0, 10);
    const ids = this.state.activePackage.question_ids;
    const matching = this.state.questions.filter((q) => ids.includes(q.id));
    return matching.length > 0 ? matching : this.state.questions.slice(0, 10);
  }

  // --- Exam Finishing & Scoring ---
  public finishExam(isAuto = false): void {
    if (!this.state.currentParticipant || !this.state.activePackage) return;

    if (this.timerInterval) clearInterval(this.timerInterval);
    if (this.heartbeatInterval) clearInterval(this.heartbeatInterval);

    this.state.isExamRunning = false;
    this.state.isExamFinished = true;
    this.state.currentParticipant.status = isAuto ? 'waktu_habis' : 'selesai';
    this.state.currentParticipant.end_time = new Date().toISOString();
    this.state.currentParticipant.remaining_seconds = 0;

    // Calculate score
    const questions = this.getExamQuestions();
    let correct = 0;
    let wrong = 0;
    let unanswered = 0;
    let earnedPoints = 0;
    let maxPoints = 0;

    questions.forEach((q) => {
      maxPoints += q.points;
      const ans = this.state.studentAnswers[q.id];
      if (!ans || (!ans.selected_key && !ans.text_answer)) {
        unanswered += 1;
        return;
      }

      if (q.question_type === 'pg') {
        if (ans.selected_key === q.correct_answer) {
          correct += 1;
          earnedPoints += q.points;
          ans.is_correct = true;
        } else {
          wrong += 1;
          ans.is_correct = false;
        }
      } else if (q.question_type === 'pg_kompleks') {
        const correctKeys = Array.isArray(q.correct_answer) ? q.correct_answer : [q.correct_answer];
        const studentKeys = Array.isArray(ans.selected_key) ? ans.selected_key : [ans.selected_key];
        const isMatch = correctKeys.length === studentKeys.length && correctKeys.every((k: any) => studentKeys.includes(k));
        if (isMatch) {
          correct += 1;
          earnedPoints += q.points;
          ans.is_correct = true;
        } else {
          wrong += 1;
          ans.is_correct = false;
        }
      } else if (q.question_type === 'benar_salah') {
        // Compare answer mapping
        const isMatch = JSON.stringify(ans.selected_key) === JSON.stringify(q.correct_answer);
        if (isMatch) {
          correct += 1;
          earnedPoints += q.points;
          ans.is_correct = true;
        } else {
          wrong += 1;
          ans.is_correct = false;
        }
      } else if (q.question_type === 'isian') {
        const expected = String(q.correct_answer).trim().toLowerCase();
        const actual = String(ans.text_answer || ans.selected_key || '').trim().toLowerCase();
        if (expected === actual) {
          correct += 1;
          earnedPoints += q.points;
          ans.is_correct = true;
        } else {
          wrong += 1;
          ans.is_correct = false;
        }
      } else {
        // Uraian or matching
        correct += 1;
        earnedPoints += q.points;
      }
    });

    const finalScore = maxPoints > 0 ? Math.round((earnedPoints / maxPoints) * 100 * 10) / 10 : 0;
    this.state.currentParticipant.score = finalScore;
    this.state.currentParticipant.objective_score = finalScore;

    this.state.lastScoreSummary = {
      score: finalScore,
      correct,
      wrong,
      unanswered,
    };

    this.logAudit('Selesai Ujian', `Peserta ${this.state.currentParticipant.student_name} menyelesaikan ujian. Skor: ${finalScore} (${isAuto ? 'Auto-submit waktu habis' : 'Manual'})`);
    this.persistState();
    localStorage.removeItem(CBT_EXAM_SESSION_KEY);
    this.notify();
  }

  // --- Accessibility & UI adjustments ---
  public setFontSize(size: 'normal' | 'large' | 'xlarge'): void {
    this.state.fontSize = size;
    this.notify();
  }

  public setContrastMode(mode: 'normal' | 'dark' | 'sepia'): void {
    this.state.contrastMode = mode;
    this.notify();
  }

  // --- Proctor Operations ---
  public proctorResetSession(participantId: string): void {
    const part = this.state.participants.find((p) => p.id === participantId);
    if (!part) return;
    part.status = 'login';
    part.reset_count += 1;
    part.last_heartbeat = new Date().toISOString();
    this.logAudit('Reset Sesi Peserta', `Proktor mereset sesi untuk ${part.student_name} (${part.participant_number})`);
    this.persistState();
    this.notify();
  }

  public proctorForceSubmit(participantId: string): void {
    const part = this.state.participants.find((p) => p.id === participantId);
    if (!part) return;
    part.status = 'selesai';
    part.end_time = new Date().toISOString();
    part.remaining_seconds = 0;
    this.logAudit('Force Submit Peserta', `Proktor melakukan force submit untuk peserta ${part.student_name}`);
    this.persistState();
    this.notify();
  }

  public proctorExtendMinutes(participantId: string, minutes: number): void {
    const part = this.state.participants.find((p) => p.id === participantId);
    if (!part) return;
    part.remaining_seconds += minutes * 60;
    part.additional_minutes += minutes;
    this.logAudit('Perpanjang Waktu', `Proktor menambah waktu ${minutes} menit untuk peserta ${part.student_name}`);
    this.persistState();
    this.notify();
  }

  public proctorGenerateToken(packageId: string): string {
    const pkg = this.state.examPackages.find((p) => p.id === packageId);
    if (!pkg) return 'TKA000';
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let newToken = '';
    for (let i = 0; i < 6; i++) {
      newToken += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    pkg.token = newToken;
    pkg.is_token_active = true;
    this.logAudit('Generate Token', `Proktor memperbarui token ujian menjadi [${newToken}] untuk paket ${pkg.title}`);
    this.persistState();
    this.notify();
    return newToken;
  }

  public proctorToggleToken(packageId: string, isActive: boolean): void {
    const pkg = this.state.examPackages.find((p) => p.id === packageId);
    if (!pkg) return;
    pkg.is_token_active = isActive;
    this.logAudit('Ubah Status Token', `Token ujian untuk paket ${pkg.title} diubah menjadi ${isActive ? 'AKTIF' : 'NONAKTIF'}`);
    this.persistState();
    this.notify();
  }

  // --- CRUD Soal & Bank Soal ---
  public addQuestion(question: Question): void {
    this.state.questions.unshift(question);
    this.logAudit('Tambah Soal', `Menambahkan soal baru ID ${question.id} pada mapel ${question.subject_name}`);
    this.persistState();
    this.notify();
  }

  public updateQuestion(question: Question): void {
    const idx = this.state.questions.findIndex((q) => q.id === question.id);
    if (idx !== -1) {
      this.state.questions[idx] = question;
      this.logAudit('Edit Soal', `Memperbarui soal ID ${question.id}`);
      this.persistState();
      this.notify();
    }
  }

  public deleteQuestion(id: string): void {
    this.state.questions = this.state.questions.filter((q) => q.id !== id);
    this.logAudit('Hapus Soal', `Menghapus soal ID ${id}`);
    this.persistState();
    this.notify();
  }

  public importQuestions(newQuestions: Question[]): void {
    this.state.questions = [...newQuestions, ...this.state.questions];
    this.logAudit('Import Soal Excel', `Berhasil mengimpor ${newQuestions.length} butir soal dari file Excel`);
    this.persistState();
    this.notify();
  }

  // --- CRUD Siswa ---
  public addStudent(student: Student): void {
    this.state.students.unshift(student);
    this.logAudit('Tambah Peserta', `Mendaftarkan peserta baru: ${student.full_name} (${student.participant_number})`);
    this.persistState();
    this.notify();
  }

  public updateStudent(student: Student): void {
    const idx = this.state.students.findIndex((s) => s.id === student.id);
    if (idx !== -1) {
      this.state.students[idx] = student;
      this.logAudit('Edit Peserta', `Memperbarui data peserta: ${student.full_name}`);
      this.persistState();
      this.notify();
    }
  }

  public deleteStudent(id: string): void {
    const s = this.state.students.find((std) => std.id === id);
    this.state.students = this.state.students.filter((std) => std.id !== id);
    if (s) {
      this.logAudit('Hapus Peserta', `Menghapus peserta ${s.full_name}`);
    }
    this.persistState();
    this.notify();
  }

  public importStudents(newStudents: Student[]): void {
    this.state.students = [...newStudents, ...this.state.students];
    this.logAudit('Import Peserta', `Berhasil mengimpor ${newStudents.length} data peserta dari Excel`);
    this.persistState();
    this.notify();
  }

  // --- Exam Package & School Updates ---
  public updateSchool(school: School): void {
    this.state.school = school;
    this.logAudit('Update Sekolah', `Memperbarui profil data sekolah ${school.name}`);
    this.persistState();
    this.notify();
  }

  public addClass(newClass: ClassGrade): void {
    this.state.classes.push(newClass);
    this.persistState();
    this.notify();
  }

  public addExamPackage(pkg: ExamPackage): void {
    this.state.examPackages.unshift(pkg);
    this.logAudit('Tambah Paket Ujian', `Membuat paket ujian baru: ${pkg.title}`);
    this.persistState();
    this.notify();
  }

  public updateExamPackage(pkg: ExamPackage): void {
    const idx = this.state.examPackages.findIndex((p) => p.id === pkg.id);
    if (idx !== -1) {
      this.state.examPackages[idx] = pkg;
      this.logAudit('Edit Paket Ujian', `Memperbarui paket ujian: ${pkg.title}`);
      this.persistState();
      this.notify();
    }
  }

  public manualGradeEssay(participantId: string, questionId: string, score: number): void {
    const part = this.state.participants.find((p) => p.id === participantId);
    if (part) {
      part.essay_score = score;
      part.score = ((part.objective_score || 0) + score);
      this.logAudit('Penilaian Uraian Guru', `Guru memberi nilai ${score} untuk jawaban uraian ${part.student_name}`);
      this.persistState();
      this.notify();
    }
  }

  // --- Audit & System Logs ---
  public logAudit(action: string, details: string): void {
    const log: AuditLog = {
      id: `aud-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 5)}`,
      user_id: this.state.currentUser?.id || 'sys',
      user_name: this.state.currentUser?.name || 'Sistem CBT',
      user_role: this.state.currentUser?.role || 'peserta',
      action,
      details,
      ip_address: '192.168.1.' + Math.floor(Math.random() * 200 + 10),
      user_agent: typeof navigator !== 'undefined' ? navigator.userAgent.split(' ')[0] : 'Browser',
      created_at: new Date().toISOString(),
    };
    this.state.auditLogs.unshift(log);
    if (this.state.auditLogs.length > 200) {
      this.state.auditLogs.pop();
    }
    this.notify();
  }

  public logout(): void {
    if (this.state.currentUser) {
      this.logAudit('Logout', `Pengguna ${this.state.currentUser.name} keluar dari sistem`);
    }
    if (this.timerInterval) clearInterval(this.timerInterval);
    if (this.heartbeatInterval) clearInterval(this.heartbeatInterval);

    this.state.currentUser = null;
    this.state.activePackage = null;
    this.state.currentParticipant = null;
    this.state.isExamRunning = false;
    this.state.isExamFinished = false;
    this.state.studentAnswers = {};
    localStorage.removeItem(CBT_EXAM_SESSION_KEY);
    this.notify();
  }

  private persistActiveExamSession(): void {
    if (!this.state.currentParticipant || !this.state.activePackage) return;
    try {
      const sessionData = {
        participantId: this.state.currentParticipant.id,
        packageId: this.state.activePackage.id,
        studentId: this.state.currentParticipant.student_id,
        remainingSeconds: this.state.remainingSeconds,
        answers: this.state.studentAnswers,
        currentIndex: this.state.currentQuestionIndex,
        isExamRunning: this.state.isExamRunning,
      };
      sessionStorage.setItem(CBT_EXAM_SESSION_KEY, JSON.stringify(sessionData));
    } catch (e) {
      console.warn('Could not persist exam session to sessionStorage:', e);
    }
  }

  private restoreActiveExamSession(): void {
    try {
      const saved = sessionStorage.getItem(CBT_EXAM_SESSION_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        this.state.studentAnswers = parsed.answers || {};
        this.state.currentQuestionIndex = parsed.currentIndex || 0;
      }
    } catch (e) {
      console.error('Failed to restore active exam session:', e);
    }
  }

  private restoreParticipantAnswers(participantId: string): void {
    try {
      const saved = sessionStorage.getItem(CBT_EXAM_SESSION_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.participantId === participantId) {
          this.state.studentAnswers = parsed.answers || {};
          this.state.currentQuestionIndex = parsed.currentIndex || 0;
          this.recalculateAnswersStats();
        }
      }
    } catch (e) {
      console.error('Failed to load answers for participant:', e);
    }
  }
}

export const cbtStore = new CbtStoreManager();
