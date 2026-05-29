-- ============================================================
-- BuiltUp — New Workout Plan (v2 split)
-- Paste this entire script into Supabase SQL editor and Run
-- Safe: preserves all existing set_logs / session history
-- ============================================================

-- 1. Clear old workout structure (no downstream dependencies)
DELETE FROM workout_day_exercises;

-- 2. Update workout day names in-place (keeps IDs → session history stays intact)
UPDATE workout_days SET name = 'Back + Biceps',    subtitle = 'Width · Thickness · Peak',  is_rest_day = false WHERE day_of_week = 1;
UPDATE workout_days SET name = 'Chest + Triceps',  subtitle = 'Upper chest · Full triceps', is_rest_day = false WHERE day_of_week = 2;
UPDATE workout_days SET name = 'Quads + Abs',      subtitle = 'Quad focus · Core',          is_rest_day = false WHERE day_of_week = 3;
UPDATE workout_days SET name = 'Shoulders + Hamstrings', subtitle = 'Aesthetic day',        is_rest_day = false WHERE day_of_week = 4;
UPDATE workout_days SET name = 'Full Legs',        subtitle = 'Heavy + Aesthetic focus',    is_rest_day = false WHERE day_of_week = 5;
UPDATE workout_days SET name = 'Upper Body Pump',  subtitle = 'Weak points · Arms',         is_rest_day = false WHERE day_of_week = 6;
UPDATE workout_days SET name = 'Rest',             subtitle = null,                          is_rest_day = true  WHERE day_of_week = 7;

-- 3. Remove old exercises that have no history (safe to purge)
DELETE FROM exercises
WHERE id NOT IN (SELECT DISTINCT exercise_id FROM set_logs);

-- 4. Insert new exercises — skip any name that already exists
INSERT INTO exercises (name, muscle_group, secondary_muscles, equipment)
SELECT v.name, v.muscle_group, v.secondary_muscles, v.equipment
FROM (VALUES
  -- Back
  ('Wide Grip Lat Pulldown',   'Back',       'Biceps',          'cable'),
  ('Close Grip Pulldown',      'Back',       'Biceps',          'cable'),
  ('Seated Cable Row',         'Back',       'Rear Delts',      'cable'),
  ('Single Arm Seated Row',    'Back',       null,              'cable'),
  ('Lower Back Extensions',    'Back',       null,              'machine'),
  ('Pull Ups',                 'Back',       'Biceps',          'bodyweight'),
  -- Shoulders
  ('Rear Delt Fly',            'Shoulders',  null,              'machine'),
  ('Dumbbell Shoulder Press',  'Shoulders',  'Triceps',         'dumbbell'),
  ('Lateral Raises',           'Shoulders',  null,              'dumbbell'),
  ('Cable Lateral Raise',      'Shoulders',  null,              'cable'),
  ('Reverse Pec Deck',         'Shoulders',  null,              'machine'),
  ('Face Pulls',               'Shoulders',  null,              'cable'),
  -- Traps
  ('Shrugs',                   'Traps',      null,              'dumbbell'),
  -- Biceps
  ('Incline Dumbbell Curl',    'Biceps',     null,              'dumbbell'),
  ('Preacher Curl',            'Biceps',     null,              'machine'),
  ('Hammer Curl',              'Biceps',     'Forearms',        'dumbbell'),
  ('EZ Bar Curl',              'Biceps',     null,              'barbell'),
  -- Chest
  ('Incline Dumbbell Press',   'Chest',      'Shoulders',       'dumbbell'),
  ('Flat Bench Press',         'Chest',      'Triceps',         'barbell'),
  ('Pec Deck Fly',             'Chest',      null,              'machine'),
  ('Cable Fly High to Low',    'Chest',      null,              'cable'),
  ('Chest Dips',               'Chest',      'Triceps',         'bodyweight'),
  ('Incline Smith Machine Press', 'Chest',   'Shoulders',       'machine'),
  -- Triceps
  ('Skull Crushers',           'Triceps',    null,              'barbell'),
  ('Rope Pushdown',            'Triceps',    null,              'cable'),
  ('Single Arm Pushdown',      'Triceps',    null,              'cable'),
  ('Overhead Cable Extension', 'Triceps',    null,              'cable'),
  -- Quads / Legs
  ('Barbell Squat',            'Quads',      'Glutes',          'barbell'),
  ('Leg Press',                'Quads',      'Glutes',          'machine'),
  ('Walking Lunges',           'Quads',      'Glutes',          'dumbbell'),
  ('Leg Extension',            'Quads',      null,              'machine'),
  ('Bulgarian Split Squat',    'Quads',      'Glutes',          'dumbbell'),
  -- Hamstrings
  ('Romanian Deadlift',        'Hamstrings', 'Lower Back',      'barbell'),
  ('Seated Leg Curl',          'Hamstrings', null,              'machine'),
  ('Leg Curl',                 'Hamstrings', null,              'machine'),
  ('Hip Adductors',            'Hamstrings', 'Groin',           'machine'),
  -- Glutes
  ('Hip Abduction',            'Glutes',     null,              'machine'),
  -- Calves
  ('Calf Raises',              'Calves',     null,              'machine'),
  -- Core
  ('Hanging Leg Raises',       'Core',       null,              'bodyweight'),
  ('Cable Crunches',           'Core',       null,              'cable'),
  ('Mountain Climbers',        'Core',       null,              'bodyweight'),
  ('Decline Crunches',         'Core',       null,              'bodyweight')
) AS v(name, muscle_group, secondary_muscles, equipment)
WHERE NOT EXISTS (
  SELECT 1 FROM exercises e WHERE e.name = v.name
);

-- 5. Link exercises to workout days
-- (Uses LIMIT 1 subqueries in case of any legacy duplicate rows)

INSERT INTO workout_day_exercises
  (workout_day_id, exercise_id, order_index, target_sets, target_reps_per_set, rest_seconds, notes)
VALUES

-- ── MONDAY — Back + Biceps ────────────────────────────────────────────────────
  ((SELECT id FROM workout_days WHERE day_of_week=1 LIMIT 1),(SELECT id FROM exercises WHERE name='Wide Grip Lat Pulldown' LIMIT 1),     1,3,'{10,10,10}',     90, null),
  ((SELECT id FROM workout_days WHERE day_of_week=1 LIMIT 1),(SELECT id FROM exercises WHERE name='Close Grip Pulldown' LIMIT 1),        2,3,'{11,11,11}',     90, null),
  ((SELECT id FROM workout_days WHERE day_of_week=1 LIMIT 1),(SELECT id FROM exercises WHERE name='Seated Cable Row' LIMIT 1),           3,3,'{10,10,10}',     90, null),
  ((SELECT id FROM workout_days WHERE day_of_week=1 LIMIT 1),(SELECT id FROM exercises WHERE name='Single Arm Seated Row' LIMIT 1),      4,3,'{11,11,11}',     90, null),
  ((SELECT id FROM workout_days WHERE day_of_week=1 LIMIT 1),(SELECT id FROM exercises WHERE name='Lower Back Extensions' LIMIT 1),      5,3,'{15,15,15}',     60, null),
  ((SELECT id FROM workout_days WHERE day_of_week=1 LIMIT 1),(SELECT id FROM exercises WHERE name='Rear Delt Fly' LIMIT 1),              6,4,'{13,13,13,13}',  60, null),
  ((SELECT id FROM workout_days WHERE day_of_week=1 LIMIT 1),(SELECT id FROM exercises WHERE name='Shrugs' LIMIT 1),                     7,3,'{12,12,12}',     60, null),
  ((SELECT id FROM workout_days WHERE day_of_week=1 LIMIT 1),(SELECT id FROM exercises WHERE name='Incline Dumbbell Curl' LIMIT 1),      8,3,'{10,10,10}',     60, null),
  ((SELECT id FROM workout_days WHERE day_of_week=1 LIMIT 1),(SELECT id FROM exercises WHERE name='Preacher Curl' LIMIT 1),              9,3,'{11,11,11}',     60, null),
  ((SELECT id FROM workout_days WHERE day_of_week=1 LIMIT 1),(SELECT id FROM exercises WHERE name='Hammer Curl' LIMIT 1),               10,3,'{12,12,12}',     60, null),

-- ── TUESDAY — Chest + Triceps ─────────────────────────────────────────────────
  ((SELECT id FROM workout_days WHERE day_of_week=2 LIMIT 1),(SELECT id FROM exercises WHERE name='Incline Dumbbell Press' LIMIT 1),     1,4,'{9,9,9,9}',     120, null),
  ((SELECT id FROM workout_days WHERE day_of_week=2 LIMIT 1),(SELECT id FROM exercises WHERE name='Flat Bench Press' LIMIT 1),           2,3,'{9,9,9}',        120, null),
  ((SELECT id FROM workout_days WHERE day_of_week=2 LIMIT 1),(SELECT id FROM exercises WHERE name='Pec Deck Fly' LIMIT 1),              3,3,'{12,12,12}',      60, null),
  ((SELECT id FROM workout_days WHERE day_of_week=2 LIMIT 1),(SELECT id FROM exercises WHERE name='Cable Fly High to Low' LIMIT 1),      4,3,'{13,13,13}',     60, null),
  ((SELECT id FROM workout_days WHERE day_of_week=2 LIMIT 1),(SELECT id FROM exercises WHERE name='Chest Dips' LIMIT 1),                5,3,'{10,10,10}',     90, 'To failure'),
  ((SELECT id FROM workout_days WHERE day_of_week=2 LIMIT 1),(SELECT id FROM exercises WHERE name='Skull Crushers' LIMIT 1),            6,3,'{10,10,10}',     90, null),
  ((SELECT id FROM workout_days WHERE day_of_week=2 LIMIT 1),(SELECT id FROM exercises WHERE name='Rope Pushdown' LIMIT 1),             7,3,'{12,12,12}',     60, null),
  ((SELECT id FROM workout_days WHERE day_of_week=2 LIMIT 1),(SELECT id FROM exercises WHERE name='Single Arm Pushdown' LIMIT 1),       8,2,'{15,15}',         60, null),
  ((SELECT id FROM workout_days WHERE day_of_week=2 LIMIT 1),(SELECT id FROM exercises WHERE name='Overhead Cable Extension' LIMIT 1),  9,3,'{11,11,11}',     60, null),

-- ── WEDNESDAY — Quads + Abs ───────────────────────────────────────────────────
  ((SELECT id FROM workout_days WHERE day_of_week=3 LIMIT 1),(SELECT id FROM exercises WHERE name='Barbell Squat' LIMIT 1),             1,4,'{7,7,7,7}',      120, null),
  ((SELECT id FROM workout_days WHERE day_of_week=3 LIMIT 1),(SELECT id FROM exercises WHERE name='Leg Press' LIMIT 1),                2,3,'{11,11,11}',      90, 'Low foot placement'),
  ((SELECT id FROM workout_days WHERE day_of_week=3 LIMIT 1),(SELECT id FROM exercises WHERE name='Walking Lunges' LIMIT 1),           3,3,'{12,12,12}',      90, 'Each leg'),
  ((SELECT id FROM workout_days WHERE day_of_week=3 LIMIT 1),(SELECT id FROM exercises WHERE name='Leg Extension' LIMIT 1),            4,3,'{13,13,13}',      60, null),
  ((SELECT id FROM workout_days WHERE day_of_week=3 LIMIT 1),(SELECT id FROM exercises WHERE name='Hip Abduction' LIMIT 1),            5,3,'{15,15,15}',      60, null),
  ((SELECT id FROM workout_days WHERE day_of_week=3 LIMIT 1),(SELECT id FROM exercises WHERE name='Hanging Leg Raises' LIMIT 1),       6,3,'{15,15,15}',      60, null),
  ((SELECT id FROM workout_days WHERE day_of_week=3 LIMIT 1),(SELECT id FROM exercises WHERE name='Cable Crunches' LIMIT 1),           7,3,'{15,15,15}',      60, null),
  ((SELECT id FROM workout_days WHERE day_of_week=3 LIMIT 1),(SELECT id FROM exercises WHERE name='Mountain Climbers' LIMIT 1),        8,3,'{40,40,40}',      60, '40 sec per set'),

-- ── THURSDAY — Shoulders + Hamstrings ────────────────────────────────────────
  ((SELECT id FROM workout_days WHERE day_of_week=4 LIMIT 1),(SELECT id FROM exercises WHERE name='Romanian Deadlift' LIMIT 1),         1,4,'{9,9,9,9}',      120, null),
  ((SELECT id FROM workout_days WHERE day_of_week=4 LIMIT 1),(SELECT id FROM exercises WHERE name='Seated Leg Curl' LIMIT 1),           2,3,'{11,11,11}',      90, null),
  ((SELECT id FROM workout_days WHERE day_of_week=4 LIMIT 1),(SELECT id FROM exercises WHERE name='Hip Adductors' LIMIT 1),             3,3,'{15,15,15}',      60, null),
  ((SELECT id FROM workout_days WHERE day_of_week=4 LIMIT 1),(SELECT id FROM exercises WHERE name='Calf Raises' LIMIT 1),               4,4,'{15,15,15,15}',  60, null),
  ((SELECT id FROM workout_days WHERE day_of_week=4 LIMIT 1),(SELECT id FROM exercises WHERE name='Dumbbell Shoulder Press' LIMIT 1),   5,4,'{9,9,9,9}',      120, null),
  ((SELECT id FROM workout_days WHERE day_of_week=4 LIMIT 1),(SELECT id FROM exercises WHERE name='Lateral Raises' LIMIT 1),            6,4,'{15,15,15,15}',  60, null),
  ((SELECT id FROM workout_days WHERE day_of_week=4 LIMIT 1),(SELECT id FROM exercises WHERE name='Cable Lateral Raise' LIMIT 1),       7,3,'{15,15,15}',      60, null),
  ((SELECT id FROM workout_days WHERE day_of_week=4 LIMIT 1),(SELECT id FROM exercises WHERE name='Reverse Pec Deck' LIMIT 1),          8,4,'{15,15,15,15}',  60, null),
  ((SELECT id FROM workout_days WHERE day_of_week=4 LIMIT 1),(SELECT id FROM exercises WHERE name='Face Pulls' LIMIT 1),                9,3,'{15,15,15}',      60, null),

-- ── FRIDAY — Full Legs ────────────────────────────────────────────────────────
  ((SELECT id FROM workout_days WHERE day_of_week=5 LIMIT 1),(SELECT id FROM exercises WHERE name='Barbell Squat' LIMIT 1),             1,4,'{6,6,6,6}',      120, null),
  ((SELECT id FROM workout_days WHERE day_of_week=5 LIMIT 1),(SELECT id FROM exercises WHERE name='Romanian Deadlift' LIMIT 1),         2,3,'{8,8,8}',         120, null),
  ((SELECT id FROM workout_days WHERE day_of_week=5 LIMIT 1),(SELECT id FROM exercises WHERE name='Leg Press' LIMIT 1),                3,3,'{12,12,12}',      90, null),
  ((SELECT id FROM workout_days WHERE day_of_week=5 LIMIT 1),(SELECT id FROM exercises WHERE name='Bulgarian Split Squat' LIMIT 1),     4,3,'{10,10,10}',     90, 'Each leg'),
  ((SELECT id FROM workout_days WHERE day_of_week=5 LIMIT 1),(SELECT id FROM exercises WHERE name='Leg Curl' LIMIT 1),                 5,3,'{12,12,12}',      90, null),
  ((SELECT id FROM workout_days WHERE day_of_week=5 LIMIT 1),(SELECT id FROM exercises WHERE name='Leg Extension' LIMIT 1),            6,3,'{15,15,15}',      60, null),
  ((SELECT id FROM workout_days WHERE day_of_week=5 LIMIT 1),(SELECT id FROM exercises WHERE name='Calf Raises' LIMIT 1),               7,4,'{15,15,15,15}',  60, null),
  ((SELECT id FROM workout_days WHERE day_of_week=5 LIMIT 1),(SELECT id FROM exercises WHERE name='Decline Crunches' LIMIT 1),          8,3,'{15,15,15}',     60, null),

-- ── SATURDAY — Upper Body Pump ────────────────────────────────────────────────
  ((SELECT id FROM workout_days WHERE day_of_week=6 LIMIT 1),(SELECT id FROM exercises WHERE name='Pull Ups' LIMIT 1),                  1,3,'{10,10,10}',     90, 'To failure'),
  ((SELECT id FROM workout_days WHERE day_of_week=6 LIMIT 1),(SELECT id FROM exercises WHERE name='Incline Smith Machine Press' LIMIT 1),2,3,'{10,10,10}',     90, null),
  ((SELECT id FROM workout_days WHERE day_of_week=6 LIMIT 1),(SELECT id FROM exercises WHERE name='Seated Cable Row' LIMIT 1),          3,3,'{12,12,12}',     90, null),
  ((SELECT id FROM workout_days WHERE day_of_week=6 LIMIT 1),(SELECT id FROM exercises WHERE name='Lateral Raises' LIMIT 1),            4,4,'{15,15,15,15}',  60, null),
  ((SELECT id FROM workout_days WHERE day_of_week=6 LIMIT 1),(SELECT id FROM exercises WHERE name='Rear Delt Fly' LIMIT 1),             5,3,'{15,15,15}',      60, null),
  ((SELECT id FROM workout_days WHERE day_of_week=6 LIMIT 1),(SELECT id FROM exercises WHERE name='EZ Bar Curl' LIMIT 1),               6,3,'{12,12,12}',     60, null),
  ((SELECT id FROM workout_days WHERE day_of_week=6 LIMIT 1),(SELECT id FROM exercises WHERE name='Rope Pushdown' LIMIT 1),             7,3,'{12,12,12}',     60, null);

-- Done. Sunday (day_of_week = 7) is Rest — no exercises needed.
