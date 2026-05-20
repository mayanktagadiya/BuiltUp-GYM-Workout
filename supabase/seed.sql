-- Run this once on a fresh database after running 001_initial_schema.sql
-- Verify after: select count(*) from exercises;  → should return 44


-- ============================================================
-- EXERCISES
-- ============================================================

insert into exercises (name, muscle_group, video_url, form_cues) values

-- Back
('Lat Pulldown',          'Back', 'https://www.youtube.com/watch?v=PLACEHOLDER_lat-pulldown',
 'Drive your elbows down toward your hips, not your hands toward your shoulders. Lean back slightly and pull the bar to your upper chest.'),
('Close-grip Lat Pulldown', 'Back', 'https://www.youtube.com/watch?v=PLACEHOLDER_close-grip-lat-pulldown',
 'Use a neutral or supinated grip shoulder-width apart. Focus on driving elbows down and squeezing lats at full contraction.'),
('Barbell Row',            'Back', 'https://www.youtube.com/watch?v=PLACEHOLDER_barbell-row',
 'Hinge forward 45–60 degrees with a flat back and pull the bar to your lower ribcage. Hold the squeeze at the top for one second.'),
('Single-arm Seated Row',  'Back', 'https://www.youtube.com/watch?v=PLACEHOLDER_single-arm-seated-row',
 'Keep your torso upright and pull your elbow back past your side. Fully extend on the way out to stretch the lat.'),
('Seated Cable Row',       'Back', 'https://www.youtube.com/watch?v=PLACEHOLDER_seated-cable-row',
 'Keep chest tall, row the handle to your navel and squeeze your shoulder blades together. Avoid rounding forward on the eccentric.'),
('Dumbbell Pullover',      'Back', 'https://www.youtube.com/watch?v=PLACEHOLDER_dumbbell-pullover',
 'Keep a slight bend in your elbows throughout. Feel the lat stretch at the top and contract as you bring the weight over your chest.'),
('Back Extension',         'Back', 'https://www.youtube.com/watch?v=PLACEHOLDER_back-extension',
 'Hinge at the hips, not the lower back. Squeeze your glutes and hold the extended position briefly before returning.'),
('Straight-arm Pulldown',  'Back', 'https://www.youtube.com/watch?v=PLACEHOLDER_straight-arm-pulldown',
 'Keep arms straight with a micro-bend in the elbows. Drive the bar down toward your hips using your lats only.'),
('Face Pull',              'Back', 'https://www.youtube.com/watch?v=PLACEHOLDER_face-pull',
 'Pull the rope to your forehead with elbows high and flared. Externally rotate at the top to activate the rear delts and rotator cuff.'),

-- Chest
('Incline Barbell Bench Press', 'Chest', 'https://www.youtube.com/watch?v=PLACEHOLDER_incline-barbell-bench-press',
 'Set incline to 30–45 degrees and grip slightly wider than shoulder-width. Lower the bar to your upper chest with control and press up powerfully.'),
('Flat Bench Press',       'Chest', 'https://www.youtube.com/watch?v=PLACEHOLDER_flat-bench-press',
 'Keep shoulder blades retracted and feet flat on the floor. Lower the bar to mid-chest, pause briefly, then drive up.'),
('Incline DB Press',       'Chest', 'https://www.youtube.com/watch?v=PLACEHOLDER_incline-db-press',
 'Maintain a neutral wrist position and lower dumbbells until elbows reach 90 degrees. Press up and in slightly without locking out.'),
('Cable Fly',              'Chest', 'https://www.youtube.com/watch?v=PLACEHOLDER_cable-fly',
 'Keep a soft bend in your elbows throughout and squeeze your chest as you bring the handles together. Control the negative slowly.'),
('Pec Deck',               'Chest', 'https://www.youtube.com/watch?v=PLACEHOLDER_pec-deck',
 'Sit tall with arms at 90 degrees and the pad at chest height. Drive your elbows together and hold the squeeze before opening.'),
('Cable Crossover',        'Chest', 'https://www.youtube.com/watch?v=PLACEHOLDER_cable-crossover',
 'Stand tall, step forward slightly, and bring handles together in front of your body. Focus on the chest stretch on the way back.'),
('Dips',                   'Chest', 'https://www.youtube.com/watch?v=PLACEHOLDER_dips',
 'Lean forward slightly to target chest over triceps. Lower until your upper arm is parallel to the floor, then press back up.'),
('Push-ups',               'Chest', 'https://www.youtube.com/watch?v=PLACEHOLDER_push-ups',
 'Keep your body in a straight line from head to heel. Touch your chest to the floor at the bottom and fully extend at the top.'),

-- Shoulders
('Seated Shoulder Press',  'Shoulders', 'https://www.youtube.com/watch?v=PLACEHOLDER_seated-shoulder-press',
 'Start with the bar or dumbbells at ear level with elbows at 90 degrees. Press overhead to just short of lockout, then lower with control.'),
('DB Lateral Raise',       'Shoulders', 'https://www.youtube.com/watch?v=PLACEHOLDER_db-lateral-raise',
 'Lead with your elbows, not your wrists. Raise to shoulder height and tilt your pinky up slightly at the top for full lateral delt activation.'),
('Reverse Pec Deck',       'Shoulders', 'https://www.youtube.com/watch?v=PLACEHOLDER_reverse-pec-deck',
 'Set the seat so handles are at shoulder height. Keep arms nearly straight and drive your elbows back, squeezing rear delts hard.'),
('Upright Row',            'Shoulders', 'https://www.youtube.com/watch?v=PLACEHOLDER_upright-row',
 'Grip the bar shoulder-width apart and lead with your elbows as you pull toward your chin. Keep the bar close to your body throughout.'),
('Shrugs',                 'Shoulders', 'https://www.youtube.com/watch?v=PLACEHOLDER_shrugs',
 'Hold dumbbells or a barbell at your sides and shrug straight up. Avoid rolling your shoulders — pure vertical elevation and hold.'),

-- Biceps
('Barbell Curl',           'Biceps', 'https://www.youtube.com/watch?v=PLACEHOLDER_barbell-curl',
 'Keep elbows pinned at your sides throughout. Fully extend at the bottom for a complete stretch and curl to shoulder height.'),
('Incline DB Curl',        'Biceps', 'https://www.youtube.com/watch?v=PLACEHOLDER_incline-db-curl',
 'Set the bench to 45–60 degrees and let your arms hang back behind your torso. Curl up without letting your elbows swing forward.'),
('Hammer Curl',            'Biceps', 'https://www.youtube.com/watch?v=PLACEHOLDER_hammer-curl',
 'Keep a neutral grip (thumbs up) throughout. Curl up without rotating your wrist and lower slowly to fully stretch the brachialis.'),
('Preacher Curl',          'Biceps', 'https://www.youtube.com/watch?v=PLACEHOLDER_preacher-curl',
 'Keep your upper arm flat on the pad and avoid any swinging. Focus on the peak contraction at the top and the full stretch at the bottom.'),
('Cable Curl',             'Biceps', 'https://www.youtube.com/watch?v=PLACEHOLDER_cable-curl',
 'Stand close to the cable stack with elbows pinned to your sides. Curl the bar to your chin and squeeze hard at the top.'),

-- Triceps
('Close-grip Bench Press', 'Triceps', 'https://www.youtube.com/watch?v=PLACEHOLDER_close-grip-bench-press',
 'Grip the bar roughly shoulder-width — not too narrow. Lower with control to your lower chest and focus on the triceps extending on the press.'),
('Skull Crusher',          'Triceps', 'https://www.youtube.com/watch?v=PLACEHOLDER_skull-crusher',
 'Keep elbows pointing straight up toward the ceiling and lower the bar toward your forehead or just behind it. Extend fully to lockout.'),
('Overhead DB Extension',  'Triceps', 'https://www.youtube.com/watch?v=PLACEHOLDER_overhead-db-extension',
 'Hold one dumbbell overhead with both hands, elbows close to your head. Lower behind your head and extend fully without flaring elbows.'),
('Cable Tricep Pushdown',  'Triceps', 'https://www.youtube.com/watch?v=PLACEHOLDER_cable-tricep-pushdown',
 'Keep elbows glued to your sides and push the bar down to full extension. Squeeze hard at the bottom before releasing.'),
('Rope Pushdown',          'Triceps', 'https://www.youtube.com/watch?v=PLACEHOLDER_rope-pushdown',
 'Use a rope attachment and flare your wrists out at the bottom for full tricep contraction. Keep elbows stationary at your sides.'),

-- Legs
('Barbell Squat',          'Legs', 'https://www.youtube.com/watch?v=PLACEHOLDER_barbell-squat',
 'Stand hip-width with toes slightly flared. Brace your core, sit back and down keeping your chest tall, then drive through your heels to stand.'),
('Walking Lunges',         'Legs', 'https://www.youtube.com/watch?v=PLACEHOLDER_walking-lunges',
 'Take a long stride forward and drop your back knee close to the floor. Keep your torso upright and step feet together before the next rep.'),
('Leg Extension',          'Legs', 'https://www.youtube.com/watch?v=PLACEHOLDER_leg-extension',
 'Sit fully back in the seat with your knees aligned to the pivot point. Extend to full lockout and squeeze the quad hard before lowering.'),
('Romanian Deadlift',      'Legs', 'https://www.youtube.com/watch?v=PLACEHOLDER_romanian-deadlift',
 'Push your hips back and lower the bar close to your legs, maintaining a slight knee bend. Feel the hamstring stretch before driving hips forward.'),
('Lying Leg Curl',         'Legs', 'https://www.youtube.com/watch?v=PLACEHOLDER_lying-leg-curl',
 'Keep your hips pressed into the pad and curl your heels toward your glutes. Squeeze at the top and lower slowly for a full hamstring stretch.'),
('Hip Abduction',          'Legs', 'https://www.youtube.com/watch?v=PLACEHOLDER_hip-abduction',
 'Sit upright in the machine and push your knees outward against the pads. Control the return to work the glute med throughout the movement.'),
('Hip Adduction',          'Legs', 'https://www.youtube.com/watch?v=PLACEHOLDER_hip-adduction',
 'Sit upright with pads on the inner thighs and squeeze your legs together. Hold the contracted position briefly before releasing.'),
('Standing Calf Raise',    'Legs', 'https://www.youtube.com/watch?v=PLACEHOLDER_standing-calf-raise',
 'Stand with the balls of your feet on the platform and rise as high as possible onto your toes. Lower all the way for a full stretch at the bottom.'),

-- Core
('Hanging Leg Raise',      'Core', 'https://www.youtube.com/watch?v=PLACEHOLDER_hanging-leg-raise',
 'Hang from a bar and raise your legs to parallel or higher, keeping them as straight as possible. Avoid swinging and control the descent.'),
('Cable Crunch',           'Core', 'https://www.youtube.com/watch?v=PLACEHOLDER_cable-crunch',
 'Kneel facing the cable stack and crunch your elbows toward your knees, rounding your lower back. Focus on flexing the abs, not pulling with your arms.'),
('Plank',                  'Core', 'https://www.youtube.com/watch?v=PLACEHOLDER_plank',
 'Maintain a straight line from head to heel with your core braced. Breathe steadily and avoid letting your hips sag or pike up.'),
('Russian Twists',         'Core', 'https://www.youtube.com/watch?v=PLACEHOLDER_russian-twists',
 'Lean back at 45 degrees with feet lifted and rotate your torso side to side, touching the floor beside each hip. Keep your lower back neutral.');


-- ============================================================
-- WORKOUT DAYS
-- ============================================================

insert into workout_days (day_of_week, name, subtitle, is_rest_day) values
(1, 'Back + Biceps',  'Heavy day', false),
(2, 'Chest + Triceps','Heavy day', false),
(3, 'Shoulders + Abs', null,       false),
(4, 'Back + Chest',  'Pump day',  false),
(5, 'Legs',           null,        false),
(6, 'Rest',           null,        true),
(7, 'Rest',           null,        true);


-- ============================================================
-- WORKOUT DAY EXERCISES
-- Subqueries look up UUIDs by name so IDs don't need to be hard-coded.
-- ============================================================

-- MONDAY — Back + Biceps (Heavy)
insert into workout_day_exercises (workout_day_id, exercise_id, order_index, target_sets, target_reps_per_set, rest_seconds, notes)
select (select id from workout_days where day_of_week = 1), (select id from exercises where name = 'Lat Pulldown'),           1, 4, array[12,10,10,8], 90, null union all
select (select id from workout_days where day_of_week = 1), (select id from exercises where name = 'Close-grip Lat Pulldown'),2, 3, array[10,8,8],    90, null union all
select (select id from workout_days where day_of_week = 1), (select id from exercises where name = 'Barbell Row'),            3, 4, array[10,8,8,6],  90, null union all
select (select id from workout_days where day_of_week = 1), (select id from exercises where name = 'Single-arm Seated Row'),  4, 3, array[10,10,10],  90, null union all
select (select id from workout_days where day_of_week = 1), (select id from exercises where name = 'Dumbbell Pullover'),      5, 3, array[12,10,8],   90, null union all
select (select id from workout_days where day_of_week = 1), (select id from exercises where name = 'Back Extension'),         6, 3, array[12,12,12],  90, null union all
select (select id from workout_days where day_of_week = 1), (select id from exercises where name = 'Barbell Curl'),           7, 4, array[10,8,8,6],  90, null union all
select (select id from workout_days where day_of_week = 1), (select id from exercises where name = 'Incline DB Curl'),        8, 3, array[12,10,8],   90, null union all
select (select id from workout_days where day_of_week = 1), (select id from exercises where name = 'Hammer Curl'),            9, 3, array[12,12,12],  90, null;

-- TUESDAY — Chest + Triceps (Heavy)
insert into workout_day_exercises (workout_day_id, exercise_id, order_index, target_sets, target_reps_per_set, rest_seconds, notes)
select (select id from workout_days where day_of_week = 2), (select id from exercises where name = 'Incline Barbell Bench Press'), 1, 4, array[10,8,8,6],   90, null union all
select (select id from workout_days where day_of_week = 2), (select id from exercises where name = 'Flat Bench Press'),            2, 4, array[8,10,8,6],   90, null union all
select (select id from workout_days where day_of_week = 2), (select id from exercises where name = 'Incline DB Press'),            3, 3, array[10,10,8],    90, null union all
select (select id from workout_days where day_of_week = 2), (select id from exercises where name = 'Cable Fly'),                   4, 4, array[15,12,12,10],90, null union all
select (select id from workout_days where day_of_week = 2), (select id from exercises where name = 'Close-grip Bench Press'),      5, 3, array[10,8,8],     90, null union all
select (select id from workout_days where day_of_week = 2), (select id from exercises where name = 'Skull Crusher'),               6, 3, array[10,8,8],     90, null union all
select (select id from workout_days where day_of_week = 2), (select id from exercises where name = 'Overhead DB Extension'),       7, 3, array[12,10,8],    90, null;

-- WEDNESDAY — Shoulders + Abs
insert into workout_day_exercises (workout_day_id, exercise_id, order_index, target_sets, target_reps_per_set, rest_seconds, notes)
select (select id from workout_days where day_of_week = 3), (select id from exercises where name = 'Seated Shoulder Press'), 1, 4, array[10,8,8,6],    90, null union all
select (select id from workout_days where day_of_week = 3), (select id from exercises where name = 'DB Lateral Raise'),      2, 4, array[15,12,12,10], 90, null union all
select (select id from workout_days where day_of_week = 3), (select id from exercises where name = 'Reverse Pec Deck'),      3, 4, array[15,12,12,10], 90, null union all
select (select id from workout_days where day_of_week = 3), (select id from exercises where name = 'Upright Row'),           4, 3, array[10,10,8],     90, null union all
select (select id from workout_days where day_of_week = 3), (select id from exercises where name = 'Shrugs'),                5, 3, array[12,12,12],    90, null union all
select (select id from workout_days where day_of_week = 3), (select id from exercises where name = 'Hanging Leg Raise'),     6, 3, array[15,15,12],    60, null union all
select (select id from workout_days where day_of_week = 3), (select id from exercises where name = 'Cable Crunch'),          7, 3, array[20,15,15],    60, null;

-- THURSDAY — Back + Chest (Pump/Volume)
insert into workout_day_exercises (workout_day_id, exercise_id, order_index, target_sets, target_reps_per_set, rest_seconds, notes)
select (select id from workout_days where day_of_week = 4), (select id from exercises where name = 'Seated Cable Row'),       1, 4, array[12,10,8,8],   90, null union all
select (select id from workout_days where day_of_week = 4), (select id from exercises where name = 'Straight-arm Pulldown'),  2, 3, array[12,12,12],    90, null union all
select (select id from workout_days where day_of_week = 4), (select id from exercises where name = 'Face Pull'),              3, 3, array[15,15,15],    60, null union all
select (select id from workout_days where day_of_week = 4), (select id from exercises where name = 'Cable Crossover'),        4, 4, array[12,12,10,10], 90, null union all
select (select id from workout_days where day_of_week = 4), (select id from exercises where name = 'Dips'),                   5, 3, array[10,10,10],    90, 'To failure if assisted' union all
select (select id from workout_days where day_of_week = 4), (select id from exercises where name = 'Push-ups'),               6, 2, array[20,20],       60, 'To failure' union all
select (select id from workout_days where day_of_week = 4), (select id from exercises where name = 'Preacher Curl'),          7, 3, array[12,10,8],     90, null union all
select (select id from workout_days where day_of_week = 4), (select id from exercises where name = 'Cable Tricep Pushdown'),  8, 3, array[12,10,10],    90, null;

-- FRIDAY — Legs
insert into workout_day_exercises (workout_day_id, exercise_id, order_index, target_sets, target_reps_per_set, rest_seconds, notes)
select (select id from workout_days where day_of_week = 5), (select id from exercises where name = 'Barbell Squat'),       1, 4, array[10,8,8,6],    120, null union all
select (select id from workout_days where day_of_week = 5), (select id from exercises where name = 'Walking Lunges'),      2, 3, array[12,12,12],    90,  null union all
select (select id from workout_days where day_of_week = 5), (select id from exercises where name = 'Leg Extension'),       3, 4, array[15,12,10,10], 90,  null union all
select (select id from workout_days where day_of_week = 5), (select id from exercises where name = 'Romanian Deadlift'),   4, 3, array[10,8,8],      90,  null union all
select (select id from workout_days where day_of_week = 5), (select id from exercises where name = 'Lying Leg Curl'),      5, 4, array[12,10,10,8],  90,  null union all
select (select id from workout_days where day_of_week = 5), (select id from exercises where name = 'Hip Abduction'),       6, 3, array[15,15,15],    60,  null union all
select (select id from workout_days where day_of_week = 5), (select id from exercises where name = 'Hip Adduction'),       7, 3, array[15,15,15],    60,  null union all
select (select id from workout_days where day_of_week = 5), (select id from exercises where name = 'Standing Calf Raise'), 8, 4, array[20,15,15,15], 60,  null;
