create table exercises (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  muscle_group text not null,
  secondary_muscles text,
  video_url text,
  form_cues text,
  created_at timestamp default now()
);

create table workout_days (
  id uuid primary key default gen_random_uuid(),
  day_of_week int not null,           -- 1=Mon, 2=Tue, ..., 7=Sun
  name text not null,
  subtitle text,
  is_rest_day boolean default false,
  created_at timestamp default now()
);

create table workout_day_exercises (
  id uuid primary key default gen_random_uuid(),
  workout_day_id uuid references workout_days(id) on delete cascade,
  exercise_id uuid references exercises(id),
  order_index int not null,
  target_sets int not null,
  target_reps_per_set int[] not null,
  rest_seconds int default 90,
  notes text
);

create table workout_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,                        -- nullable for MVP
  workout_day_id uuid references workout_days(id),
  started_at timestamp not null default now(),
  completed_at timestamp,
  duration_seconds int,
  notes text
);

create table set_logs (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references workout_sessions(id) on delete cascade,
  exercise_id uuid references exercises(id),
  set_number int not null,
  weight_kg numeric(6,2),
  reps int,
  completed_at timestamp default now(),
  notes text,
  is_personal_record boolean default false
);

create table body_weight_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  weight_kg numeric(5,2) not null,
  logged_at timestamp not null default now()
);

create table user_preferences (
  id uuid primary key default gen_random_uuid(),
  weight_unit text default 'kg',
  default_rest_seconds int default 90,
  sound_enabled boolean default true,
  vibration_enabled boolean default true,
  name text,
  starting_weight_kg numeric(5,2),
  starting_date date
);

-- Indexes
create index idx_wde_day_order on workout_day_exercises (workout_day_id, order_index);
create index idx_set_logs_session on set_logs (session_id);
create index idx_set_logs_exercise_completed on set_logs (exercise_id, completed_at desc);
create index idx_sessions_completed on workout_sessions (completed_at desc) where completed_at is not null;
