export type UserRole = 
  | 'super_admin'
  | 'admin_sekolah'
  | 'operator'
  | 'proktor'
  | 'teknisi'
  | 'guru'
  | 'pengawas'
  | 'peserta';

export type ExamType = 'simulation' | 'actual';

export type QuestionType = 
  | 'pg'           // Pilihan Ganda (Single Choice)
  | 'pg_kompleks'  // Pilihan Ganda Kompleks (Multi Select)
  | 'benar_salah'  // Benar / Salah Matrix
  | 'menjodohkan'  // Matching Pairs
  | 'isian'        // Isian Singkat
  | 'uraian';      // Uraian / Essay

export type ExamStatus = 'draft' | 'aktif' | 'berlangsung' | 'selesai' | 'arsip';

export type ParticipantExamStatus = 
  | 'belum_login'
  | 'login'
  | 'sedang_ujian'
  | 'ragu_ragu'
  | 'koneksi_terputus'
  | 'selesai'
  | 'waktu_habis';

export type CognitiveLevel = 'L1' | 'L2' | 'L3'; // Pemahaman, Penerapan, Penalaran
export type DifficultyLevel = 'mudah' | 'sedang' | 'sukar';

export interface School {
  id: string;
  npsn: string;
  name: string;
  address: string;
  subdistrict: string; // Kecamatan
  city: string;        // Kota/Kabupaten
  province: string;
  principal_name: string;
  logo_url: string;
  created_at: string;
  updated_at: string;
}

export interface ClassGrade {
  id: string;
  school_id: string;
  name: string; // e.g., "VII A", "VIII B", "IX A"
  grade_level: 7 | 8 | 9;
  major?: string;
  total_students?: number;
  created_at: string;
}

export interface Student {
  id: string;
  school_id: string;
  class_id: string;
  participant_number: string; // Nomor Peserta e.g. "04-001-025-8"
  nisn: string;
  nis: string;
  full_name: string;
  gender: 'L' | 'P';
  birth_place: string;
  birth_date: string;
  username: string;
  password_hash: string;
  pin: string;
  photo_url: string;
  is_active: boolean;
  needs_accessibility: boolean;
  accessibility_notes?: string;
  created_at: string;
}

export interface Subject {
  id: string;
  school_id: string;
  code: string; // e.g., "BINDO", "MAT", "IPA", "BING"
  name: string; // Bahasa Indonesia, Matematika, IPA, Bahasa Inggris
  description?: string;
  created_at: string;
}

export interface QuestionOption {
  id: string;
  question_id: string;
  key: string; // 'A', 'B', 'C', 'D', 'E' or pair key
  content: string;
  is_correct: boolean;
  matched_pair?: string; // For menjodohkan
}

export interface Question {
  id: string;
  question_bank_id: string;
  subject_id: string;
  subject_name?: string;
  grade_level: 7 | 8 | 9;
  topic: string; // Materi
  indicator: string; // Indikator
  cognitive_level: CognitiveLevel;
  difficulty: DifficultyLevel;
  question_type: QuestionType;
  stimulus?: string; // Teks bacaan, tabel, teks pengantar
  stimulus_image?: string;
  stimulus_audio?: string;
  question_text: string;
  options: QuestionOption[];
  correct_answer?: string | string[] | Record<string, string>; // Can be option key, list of keys, or matching map
  points: number; // Bobot nilai
  explanation?: string; // Pembahasan
  creator_id?: string;
  creator_name?: string;
  status: 'draft' | 'tervalidasi' | 'aktif';
  created_at: string;
  updated_at: string;
}

export interface ExamPackage {
  id: string;
  school_id: string;
  subject_id: string;
  subject_name?: string;
  title: string; // e.g. "TKA SMP Simulasi 1 Matematika"
  exam_type: ExamType;
  academic_year: string; // "2026/2027"
  grade_level: 7 | 8 | 9;
  total_questions: number;
  duration_minutes: number;
  start_date: string;
  end_date: string;
  start_time: string;
  end_time: string;
  token: string;
  is_token_active: boolean;
  randomize_questions: boolean;
  randomize_options: boolean;
  allow_back_nav: boolean;
  show_results_to_student: boolean;
  show_discussion_to_student: boolean;
  fullscreen_required: boolean;
  status: ExamStatus;
  question_ids: string[];
  created_at: string;
}

export interface ExamSession {
  id: string;
  exam_package_id: string;
  name: string; // "Sesi 1 (07.30 - 09.30)", "Sesi 2 (10.00 - 12.00)"
  session_date: string;
  start_time: string;
  end_time: string;
  room_name: string; // "Lab Komputer 1", "Lab Komputer 2"
  proctor_id?: string;
  proctor_name?: string;
  technician_id?: string;
  technician_name?: string;
  is_active: boolean;
  created_at: string;
}

export interface ExamParticipant {
  id: string;
  exam_package_id: string;
  exam_session_id: string;
  student_id: string;
  student_name: string;
  participant_number: string;
  nisn: string;
  class_name: string;
  status: ParticipantExamStatus;
  start_time?: string;
  end_time?: string;
  remaining_seconds: number;
  allocated_seconds: number;
  additional_minutes: number;
  answers_count: number;
  doubt_count: number;
  total_questions: number;
  score?: number;
  objective_score?: number;
  essay_score?: number;
  is_synced: boolean;
  last_heartbeat: string;
  ip_address?: string;
  user_agent?: string;
  tab_switch_count: number;
  reset_count: number;
}

export interface StudentAnswer {
  id: string;
  exam_participant_id: string;
  question_id: string;
  question_number: number;
  selected_key?: string | string[] | Record<string, string>; // Answer payload
  text_answer?: string; // For isian & uraian
  is_doubt: boolean;
  is_correct?: boolean;
  score_earned?: number;
  manual_score?: number; // Guru evaluation for essay
  saved_at: string;
  sync_status: 'saved' | 'saving' | 'offline_queue' | 'error';
}

export interface AuditLog {
  id: string;
  user_id: string;
  user_name: string;
  user_role: UserRole;
  action: string;
  details: string;
  ip_address: string;
  user_agent: string;
  created_at: string;
}

export interface SystemLog {
  id: string;
  level: 'info' | 'warn' | 'error';
  service: string;
  message: string;
  metadata?: Record<string, any>;
  created_at: string;
}

export interface SystemHealth {
  database_status: 'healthy' | 'degraded' | 'offline';
  realtime_status: 'connected' | 'reconnecting' | 'disconnected';
  latency_ms: number;
  active_candidates: number;
  active_sessions: number;
  cpu_usage_pct: number;
  memory_usage_pct: number;
  last_backup_at: string;
  total_storage_mb: number;
}
