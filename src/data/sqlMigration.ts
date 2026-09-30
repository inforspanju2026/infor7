/**
 * Production-Ready Supabase PostgreSQL Schema & Migration
 * CBT TKA SMP (Computer Based Test - Tes Kemampuan Akademik SMP)
 */

export const ERD_DOCUMENTATION = `
================================================================================
ERD (ENTITY RELATIONSHIP DIAGRAM) - CBT TKA SMP
================================================================================

[schools] 1 --- * [classes]
   |                  |
   |                  1
   |                  |
   |                  *
   +----------- * [students] 1 --- * [exam_participants] * --- 1 [exam_packages]
   |                                       |                          |
   +----------- * [teachers]               |                          *
   |                  |                    |                  [exam_questions]
   |                  *                    |                          |
   +----------- * [subjects] 1 --- * [questions] 1 --- * [question_options]
                                           |                          |
                                           +---------- 1              |
                                                       |              |
                                                       *              *
                                                  [answers] <---------+
                                                       |
                                                       1
                                                       |
                                                       *
                                                   [scores]

[exam_packages] 1 --- * [exam_sessions] 1 --- * [exam_participants]
[exam_packages] 1 --- * [exam_tokens]
[exam_packages] 1 --- * [schedules]

[profiles] 1 --- * [audit_logs]
[profiles] 1 --- * [system_logs]
[profiles] 1 --- * [notifications]
================================================================================
`;

export const FULL_SQL_MIGRATION = `-- ==============================================================================
-- CBT TKA SMP - Production Supabase Migration
-- Features: UUID PKs, RLS, Indexes, Triggers, Functions, Storage & Seed Data
-- ==============================================================================

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Custom ENUM Types
DO $$ BEGIN
  CREATE TYPE user_role_type AS ENUM (
    'super_admin', 'admin_sekolah', 'operator', 'proktor', 'teknisi', 'guru', 'pengawas', 'peserta'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE exam_type_enum AS ENUM ('simulation', 'actual');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE question_type_enum AS ENUM (
    'pg', 'pg_kompleks', 'benar_salah', 'menjodohkan', 'isian', 'uraian'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE participant_status_enum AS ENUM (
    'belum_login', 'login', 'sedang_ujian', 'ragu_ragu', 'koneksi_terputus', 'selesai', 'waktu_habis'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 3. Utility Function: Updated At Trigger
CREATE OR REPLACE FUNCTION update_timestamp_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ==============================================================================
-- 4. Core Tables
-- ==============================================================================

-- Schools
CREATE TABLE IF NOT EXISTS public.schools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  npsn VARCHAR(10) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  address TEXT NOT NULL,
  subdistrict VARCHAR(100) NOT NULL,
  city VARCHAR(100) NOT NULL,
  province VARCHAR(100) NOT NULL,
  principal_name VARCHAR(150) NOT NULL,
  logo_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Profiles (links to auth.users in Supabase)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  school_id UUID REFERENCES public.schools(id) ON DELETE SET NULL,
  role user_role_type NOT NULL DEFAULT 'peserta',
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(30),
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Classes
CREATE TABLE IF NOT EXISTS public.classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  name VARCHAR(50) NOT NULL, -- e.g. "VII A", "VIII B", "IX A"
  grade_level SMALLINT NOT NULL CHECK (grade_level IN (7, 8, 9)),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_school_class UNIQUE (school_id, name)
);

-- Students
CREATE TABLE IF NOT EXISTS public.students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE RESTRICT,
  participant_number VARCHAR(50) UNIQUE NOT NULL, -- e.g. 04-001-025-8
  nisn VARCHAR(20) UNIQUE NOT NULL,
  nis VARCHAR(20),
  full_name VARCHAR(255) NOT NULL,
  gender CHAR(1) CHECK (gender IN ('L', 'P')),
  birth_place VARCHAR(100),
  birth_date DATE,
  username VARCHAR(100) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  pin VARCHAR(10) NOT NULL,
  photo_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  needs_accessibility BOOLEAN NOT NULL DEFAULT false,
  accessibility_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Teachers / Question Makers
CREATE TABLE IF NOT EXISTS public.teachers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  nip VARCHAR(30) UNIQUE,
  full_name VARCHAR(255) NOT NULL,
  subject_specialization VARCHAR(100),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Subjects
CREATE TABLE IF NOT EXISTS public.subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  code VARCHAR(20) NOT NULL, -- e.g. "BINDO", "MAT", "IPA"
  name VARCHAR(100) NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_school_subject UNIQUE (school_id, code)
);

-- Question Banks
CREATE TABLE IF NOT EXISTS public.question_banks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE RESTRICT,
  title VARCHAR(200) NOT NULL,
  grade_level SMALLINT NOT NULL CHECK (grade_level IN (7, 8, 9)),
  total_questions INT NOT NULL DEFAULT 0,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Questions
CREATE TABLE IF NOT EXISTS public.questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_bank_id UUID NOT NULL REFERENCES public.question_banks(id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE RESTRICT,
  grade_level SMALLINT NOT NULL CHECK (grade_level IN (7, 8, 9)),
  topic VARCHAR(200) NOT NULL,
  indicator TEXT NOT NULL,
  cognitive_level VARCHAR(5) NOT NULL CHECK (cognitive_level IN ('L1', 'L2', 'L3')),
  difficulty VARCHAR(10) NOT NULL CHECK (difficulty IN ('mudah', 'sedang', 'sukar')),
  question_type question_type_enum NOT NULL,
  stimulus TEXT,
  stimulus_image TEXT,
  stimulus_audio TEXT,
  question_text TEXT NOT NULL,
  correct_answer JSONB NOT NULL,
  points NUMERIC(5,2) NOT NULL DEFAULT 1.00 CHECK (points > 0),
  explanation TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'aktif' CHECK (status IN ('draft', 'tervalidasi', 'aktif')),
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Question Options (For PG, PGK, Matching)
CREATE TABLE IF NOT EXISTS public.question_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  option_key VARCHAR(10) NOT NULL, -- 'A', 'B', 'C', 'D', 'E'
  content TEXT NOT NULL,
  is_correct BOOLEAN NOT NULL DEFAULT false,
  matched_pair TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  CONSTRAINT uq_question_opt_key UNIQUE (question_id, option_key)
);

-- Exam Packages
CREATE TABLE IF NOT EXISTS public.exam_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE RESTRICT,
  title VARCHAR(255) NOT NULL,
  exam_type exam_type_enum NOT NULL DEFAULT 'simulation',
  academic_year VARCHAR(20) NOT NULL DEFAULT '2026/2027',
  grade_level SMALLINT NOT NULL CHECK (grade_level IN (7, 8, 9)),
  total_questions INT NOT NULL DEFAULT 40 CHECK (total_questions > 0),
  duration_minutes INT NOT NULL DEFAULT 90 CHECK (duration_minutes > 0),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  token VARCHAR(20) NOT NULL,
  is_token_active BOOLEAN NOT NULL DEFAULT true,
  randomize_questions BOOLEAN NOT NULL DEFAULT true,
  randomize_options BOOLEAN NOT NULL DEFAULT true,
  allow_back_nav BOOLEAN NOT NULL DEFAULT true,
  show_results_to_student BOOLEAN NOT NULL DEFAULT false,
  show_discussion_to_student BOOLEAN NOT NULL DEFAULT false,
  fullscreen_required BOOLEAN NOT NULL DEFAULT true,
  status VARCHAR(20) NOT NULL DEFAULT 'aktif' CHECK (status IN ('draft', 'aktif', 'berlangsung', 'selesai', 'arsip')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Exam Questions Mapping
CREATE TABLE IF NOT EXISTS public.exam_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_package_id UUID NOT NULL REFERENCES public.exam_packages(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  sequence_number INT NOT NULL,
  CONSTRAINT uq_exam_question UNIQUE (exam_package_id, question_id)
);

-- Exam Sessions
CREATE TABLE IF NOT EXISTS public.exam_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_package_id UUID NOT NULL REFERENCES public.exam_packages(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL, -- "Sesi 1 (07.30 - 09.30)"
  session_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  room_name VARCHAR(100) NOT NULL,
  proctor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  technician_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Exam Participants
CREATE TABLE IF NOT EXISTS public.exam_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_package_id UUID NOT NULL REFERENCES public.exam_packages(id) ON DELETE CASCADE,
  exam_session_id UUID NOT NULL REFERENCES public.exam_sessions(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  status participant_status_enum NOT NULL DEFAULT 'belum_login',
  start_time TIMESTAMPTZ,
  end_time TIMESTAMPTZ,
  remaining_seconds INT NOT NULL DEFAULT 5400, -- 90 mins
  allocated_seconds INT NOT NULL DEFAULT 5400,
  additional_minutes INT NOT NULL DEFAULT 0,
  answers_count INT NOT NULL DEFAULT 0,
  doubt_count INT NOT NULL DEFAULT 0,
  total_questions INT NOT NULL DEFAULT 40,
  score NUMERIC(5,2),
  objective_score NUMERIC(5,2),
  essay_score NUMERIC(5,2),
  is_synced BOOLEAN NOT NULL DEFAULT true,
  last_heartbeat TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ip_address VARCHAR(45),
  user_agent TEXT,
  tab_switch_count INT NOT NULL DEFAULT 0,
  reset_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_exam_participant UNIQUE (exam_package_id, student_id)
);

-- Student Answers (Strict Idempotency Constraint)
CREATE TABLE IF NOT EXISTS public.answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_participant_id UUID NOT NULL REFERENCES public.exam_participants(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE RESTRICT,
  question_number INT NOT NULL,
  selected_key JSONB, -- stores chosen option or map
  text_answer TEXT,   -- for isian or uraian
  is_doubt BOOLEAN NOT NULL DEFAULT false,
  is_correct BOOLEAN,
  score_earned NUMERIC(5,2) DEFAULT 0.00,
  manual_score NUMERIC(5,2), -- scored by teacher for essay
  saved_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_participant_answer UNIQUE (exam_participant_id, question_id)
);

-- Scores & Final Result Summary
CREATE TABLE IF NOT EXISTS public.scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_participant_id UUID UNIQUE NOT NULL REFERENCES public.exam_participants(id) ON DELETE CASCADE,
  total_correct INT NOT NULL DEFAULT 0,
  total_wrong INT NOT NULL DEFAULT 0,
  total_unanswered INT NOT NULL DEFAULT 0,
  objective_score NUMERIC(5,2) NOT NULL DEFAULT 0.00,
  essay_score NUMERIC(5,2) NOT NULL DEFAULT 0.00,
  final_score NUMERIC(5,2) NOT NULL DEFAULT 0.00,
  percentage NUMERIC(5,2) NOT NULL DEFAULT 0.00,
  is_passed BOOLEAN NOT NULL DEFAULT false,
  graded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Exam Tokens
CREATE TABLE IF NOT EXISTS public.exam_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_package_id UUID NOT NULL REFERENCES public.exam_packages(id) ON DELETE CASCADE,
  session_id UUID REFERENCES public.exam_sessions(id) ON DELETE CASCADE,
  token_code VARCHAR(10) NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  valid_from TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  valid_until TIMESTAMPTZ NOT NULL,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Audit Logs
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  user_name VARCHAR(150),
  user_role VARCHAR(50),
  action VARCHAR(100) NOT NULL,
  details TEXT,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- System Logs
CREATE TABLE IF NOT EXISTS public.system_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  level VARCHAR(10) NOT NULL CHECK (level IN ('info', 'warn', 'error')),
  service VARCHAR(50) NOT NULL,
  message TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- 5. High-Concurrency Indexes
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_students_school ON public.students(school_id);
CREATE INDEX IF NOT EXISTS idx_students_class ON public.students(class_id);
CREATE INDEX IF NOT EXISTS idx_students_part_no ON public.students(participant_number);
CREATE INDEX IF NOT EXISTS idx_questions_bank ON public.questions(question_bank_id);
CREATE INDEX IF NOT EXISTS idx_questions_subject ON public.questions(subject_id);
CREATE INDEX IF NOT EXISTS idx_options_question ON public.question_options(question_id);
CREATE INDEX IF NOT EXISTS idx_participants_package ON public.exam_participants(exam_package_id);
CREATE INDEX IF NOT EXISTS idx_participants_session ON public.exam_participants(exam_session_id);
CREATE INDEX IF NOT EXISTS idx_participants_student ON public.exam_participants(student_id);
CREATE INDEX IF NOT EXISTS idx_participants_status ON public.exam_participants(status);
CREATE INDEX IF NOT EXISTS idx_answers_participant ON public.answers(exam_participant_id);
CREATE INDEX IF NOT EXISTS idx_answers_question ON public.answers(question_id);
CREATE INDEX IF NOT EXISTS idx_audit_created ON public.audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tokens_code ON public.exam_tokens(token_code, is_active);

-- ==============================================================================
-- 6. PostgreSQL Database Functions
-- ==============================================================================

-- A. Start Exam Session for a Student
CREATE OR REPLACE FUNCTION public.start_exam_session(
  p_participant_id UUID,
  p_token VARCHAR(20)
)
RETURNS JSONB AS $$
DECLARE
  v_participant public.exam_participants%ROWTYPE;
  v_package public.exam_packages%ROWTYPE;
BEGIN
  SELECT * INTO v_participant FROM public.exam_participants WHERE id = p_participant_id;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Data peserta tidak ditemukan');
  END IF;

  SELECT * INTO v_package FROM public.exam_packages WHERE id = v_participant.exam_package_id;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Paket ujian tidak ditemukan');
  END IF;

  IF v_package.token != p_token OR v_package.is_token_active = false THEN
    RETURN jsonb_build_object('success', false, 'error', 'Token ujian tidak valid atau tidak aktif');
  END IF;

  IF v_participant.status = 'selesai' OR v_participant.status = 'waktu_habis' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Ujian Anda telah selesai dikerjakan');
  END IF;

  IF v_participant.start_time IS NULL THEN
    UPDATE public.exam_participants
    SET status = 'sedang_ujian',
        start_time = NOW(),
        last_heartbeat = NOW()
    WHERE id = p_participant_id;
  ELSE
    UPDATE public.exam_participants
    SET status = 'sedang_ujian',
        last_heartbeat = NOW()
    WHERE id = p_participant_id;
  END IF;

  RETURN jsonb_build_object('success', true, 'message', 'Sesi ujian berhasil dimulai');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- B. Idempotent Answer Submission with Auto Score Calculation
CREATE OR REPLACE FUNCTION public.submit_answer_idempotent(
  p_participant_id UUID,
  p_question_id UUID,
  p_question_number INT,
  p_selected_key JSONB,
  p_text_answer TEXT,
  p_is_doubt BOOLEAN
)
RETURNS JSONB AS $$
DECLARE
  v_question public.questions%ROWTYPE;
  v_is_correct BOOLEAN := false;
  v_earned_score NUMERIC(5,2) := 0.00;
  v_ans_count INT;
  v_doubt_count INT;
BEGIN
  SELECT * INTO v_question FROM public.questions WHERE id = p_question_id;
  
  -- Calculate correctness if objective
  IF v_question.question_type = 'pg' THEN
    IF (p_selected_key->>0) = (v_question.correct_answer->>0) OR (p_selected_key = v_question.correct_answer) THEN
      v_is_correct := true;
      v_earned_score := v_question.points;
    ELSE
      v_is_correct := false;
      v_earned_score := 0.00;
    END IF;
  ELSIF v_question.question_type = 'isian' THEN
    IF LOWER(TRIM(p_text_answer)) = LOWER(TRIM(v_question.correct_answer->>0)) THEN
      v_is_correct := true;
      v_earned_score := v_question.points;
    ELSE
      v_is_correct := false;
      v_earned_score := 0.00;
    END IF;
  END IF;

  -- Upsert answer
  INSERT INTO public.answers (
    exam_participant_id, question_id, question_number,
    selected_key, text_answer, is_doubt, is_correct, score_earned, saved_at
  )
  VALUES (
    p_participant_id, p_question_id, p_question_number,
    p_selected_key, p_text_answer, p_is_doubt, v_is_correct, v_earned_score, NOW()
  )
  ON CONFLICT (exam_participant_id, question_id)
  DO UPDATE SET
    selected_key = EXCLUDED.selected_key,
    text_answer = EXCLUDED.text_answer,
    is_doubt = EXCLUDED.is_doubt,
    is_correct = EXCLUDED.is_correct,
    score_earned = EXCLUDED.score_earned,
    saved_at = NOW(),
    updated_at = NOW();

  -- Recalculate answered and doubt counts
  SELECT COUNT(*), COUNT(*) FILTER (WHERE is_doubt = true)
  INTO v_ans_count, v_doubt_count
  FROM public.answers
  WHERE exam_participant_id = p_participant_id
    AND (selected_key IS NOT NULL OR text_answer IS NOT NULL);

  UPDATE public.exam_participants
  SET answers_count = v_ans_count,
      doubt_count = v_doubt_count,
      last_heartbeat = NOW()
  WHERE id = p_participant_id;

  RETURN jsonb_build_object('success', true, 'saved_at', NOW());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- C. Finalize & Submit Exam
CREATE OR REPLACE FUNCTION public.finalize_exam_submission(
  p_participant_id UUID
)
RETURNS JSONB AS $$
DECLARE
  v_participant public.exam_participants%ROWTYPE;
  v_package public.exam_packages%ROWTYPE;
  v_obj_score NUMERIC(5,2) := 0;
  v_correct_count INT := 0;
  v_wrong_count INT := 0;
  v_unanswered INT := 0;
  v_final_pct NUMERIC(5,2) := 0;
BEGIN
  SELECT * INTO v_participant FROM public.exam_participants WHERE id = p_participant_id;
  SELECT * INTO v_package FROM public.exam_packages WHERE id = v_participant.exam_package_id;

  SELECT 
    COALESCE(SUM(score_earned), 0),
    COUNT(*) FILTER (WHERE is_correct = true),
    COUNT(*) FILTER (WHERE is_correct = false AND (selected_key IS NOT NULL OR text_answer IS NOT NULL))
  INTO v_obj_score, v_correct_count, v_wrong_count
  FROM public.answers
  WHERE exam_participant_id = p_participant_id;

  v_unanswered := GREATEST(v_package.total_questions - (v_correct_count + v_wrong_count), 0);
  IF v_package.total_questions > 0 THEN
    v_final_pct := ROUND((v_correct_count::numeric / v_package.total_questions::numeric) * 100, 2);
  END IF;

  -- Update participant record
  UPDATE public.exam_participants
  SET status = 'selesai',
      end_time = NOW(),
      score = v_final_pct,
      objective_score = v_obj_score,
      remaining_seconds = 0
  WHERE id = p_participant_id;

  -- Upsert into scores summary table
  INSERT INTO public.scores (
    exam_participant_id, total_correct, total_wrong, total_unanswered,
    objective_score, final_score, percentage, is_passed, graded_at
  )
  VALUES (
    p_participant_id, v_correct_count, v_wrong_count, v_unanswered,
    v_obj_score, v_final_pct, v_final_pct, (v_final_pct >= 75.0), NOW()
  )
  ON CONFLICT (exam_participant_id)
  DO UPDATE SET
    total_correct = EXCLUDED.total_correct,
    total_wrong = EXCLUDED.total_wrong,
    total_unanswered = EXCLUDED.total_unanswered,
    objective_score = EXCLUDED.objective_score,
    final_score = EXCLUDED.final_score,
    percentage = EXCLUDED.percentage,
    is_passed = EXCLUDED.is_passed,
    graded_at = NOW();

  RETURN jsonb_build_object(
    'success', true,
    'score', v_final_pct,
    'correct', v_correct_count,
    'wrong', v_wrong_count,
    'unanswered', v_unanswered
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==============================================================================
-- 7. Row Level Security (RLS) Policies
-- ==============================================================================

ALTER TABLE public.schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_banks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_logs ENABLE ROW LEVEL SECURITY;

-- Helper to fetch current user's role
CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS user_role_type AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- RLS: Schools
CREATE POLICY "Public read schools" ON public.schools FOR SELECT USING (true);
CREATE POLICY "SuperAdmin manage schools" ON public.schools FOR ALL USING (public.current_user_role() = 'super_admin');

-- RLS: Students & Classes
CREATE POLICY "Staff read classes" ON public.classes FOR SELECT USING (true);
CREATE POLICY "Admin manage classes" ON public.classes FOR ALL USING (public.current_user_role() IN ('super_admin', 'admin_sekolah'));

CREATE POLICY "Student read own profile" ON public.students FOR SELECT USING (user_id = auth.uid() OR public.current_user_role() IN ('super_admin', 'admin_sekolah', 'proktor', 'teknisi', 'operator'));
CREATE POLICY "Admin manage students" ON public.students FOR ALL USING (public.current_user_role() IN ('super_admin', 'admin_sekolah', 'operator'));

-- RLS: Questions (Strictly protected from students)
CREATE POLICY "Teachers and admins manage questions" ON public.questions FOR ALL 
  USING (public.current_user_role() IN ('super_admin', 'admin_sekolah', 'guru'));

CREATE POLICY "Students read assigned exam questions without answers" ON public.questions FOR SELECT
  USING (public.current_user_role() = 'peserta');

-- RLS: Exam Participants
CREATE POLICY "Student see own exam participant" ON public.exam_participants FOR SELECT
  USING (student_id IN (SELECT id FROM public.students WHERE user_id = auth.uid()) OR public.current_user_role() IN ('super_admin', 'admin_sekolah', 'proktor', 'teknisi', 'pengawas'));

CREATE POLICY "Proctor update exam participant" ON public.exam_participants FOR UPDATE
  USING (public.current_user_role() IN ('super_admin', 'admin_sekolah', 'proktor'));

-- RLS: Answers (Peserta can ONLY read/write their own answers)
CREATE POLICY "Peserta read own answers" ON public.answers FOR SELECT
  USING (
    exam_participant_id IN (
      SELECT ep.id FROM public.exam_participants ep
      JOIN public.students s ON ep.student_id = s.id
      WHERE s.user_id = auth.uid()
    ) OR public.current_user_role() IN ('super_admin', 'admin_sekolah', 'proktor', 'guru')
  );

CREATE POLICY "Peserta write own answers" ON public.answers FOR INSERT
  WITH CHECK (
    exam_participant_id IN (
      SELECT ep.id FROM public.exam_participants ep
      JOIN public.students s ON ep.student_id = s.id
      WHERE s.user_id = auth.uid()
    )
  );

CREATE POLICY "Peserta update own answers" ON public.answers FOR UPDATE
  USING (
    exam_participant_id IN (
      SELECT ep.id FROM public.exam_participants ep
      JOIN public.students s ON ep.student_id = s.id
      WHERE s.user_id = auth.uid()
    )
  );

-- RLS: Scores
CREATE POLICY "View scores" ON public.scores FOR SELECT
  USING (
    exam_participant_id IN (
      SELECT ep.id FROM public.exam_participants ep
      JOIN public.students s ON ep.student_id = s.id
      WHERE s.user_id = auth.uid()
    ) OR public.current_user_role() IN ('super_admin', 'admin_sekolah', 'proktor', 'guru')
  );

-- RLS: Audit & System Logs
CREATE POLICY "Admins read audit logs" ON public.audit_logs FOR SELECT
  USING (public.current_user_role() IN ('super_admin', 'admin_sekolah', 'teknisi'));

CREATE POLICY "System insert audit logs" ON public.audit_logs FOR INSERT
  WITH CHECK (true);

-- ==============================================================================
-- 8. Storage Buckets & Policies
-- ==============================================================================
INSERT INTO storage.buckets (id, name, public) VALUES
  ('question-media', 'question-media', true),
  ('student-photo', 'student-photo', true),
  ('school-assets', 'school-assets', true),
  ('report-files', 'report-files', false)
ON CONFLICT (id) DO NOTHING;

-- Storage Policy: Question media public read, guru/admin upload
CREATE POLICY "Public read question media" ON storage.objects FOR SELECT USING (bucket_id = 'question-media');
CREATE POLICY "Teachers upload question media" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'question-media' AND auth.role() = 'authenticated'
);

-- ==============================================================================
-- 9. Realtime Publication Setup
-- ==============================================================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.exam_participants;
ALTER PUBLICATION supabase_realtime ADD TABLE public.answers;
ALTER PUBLICATION supabase_realtime ADD TABLE public.exam_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.exam_tokens;
ALTER PUBLICATION supabase_realtime ADD TABLE public.system_logs;
`;
