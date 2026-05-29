-- ============================================================
-- BuiltUp — Exercise Video URLs
-- Paste into Supabase SQL editor and Run AFTER migrate-plan-v2.sql
-- All videos are YouTube tutorial/form guides from reputable channels
-- ============================================================

-- Back
UPDATE exercises SET video_url = 'https://www.youtube.com/watch?v=PAXkl-AdJFg'  WHERE name = 'Wide Grip Lat Pulldown';
UPDATE exercises SET video_url = 'https://www.youtube.com/watch?v=PAXkl-AdJFg'  WHERE name = 'Close Grip Pulldown';
UPDATE exercises SET video_url = 'https://www.youtube.com/watch?v=UCXxvVItLoM'  WHERE name = 'Seated Cable Row';
UPDATE exercises SET video_url = 'https://www.youtube.com/watch?v=Hdc7Mw6BIEE'  WHERE name = 'Pull Ups';

-- Shoulders
UPDATE exercises SET video_url = 'https://www.youtube.com/watch?v=lq9K3lnHWKk'  WHERE name = 'Rear Delt Fly';
UPDATE exercises SET video_url = 'https://www.youtube.com/watch?v=fuQpuu--bMI'  WHERE name = 'Dumbbell Shoulder Press';
UPDATE exercises SET video_url = 'https://www.youtube.com/watch?v=pgrWjBfaFe8'  WHERE name = 'Lateral Raises';
UPDATE exercises SET video_url = 'https://www.youtube.com/watch?v=pgrWjBfaFe8'  WHERE name = 'Cable Lateral Raise';
UPDATE exercises SET video_url = 'https://www.youtube.com/watch?v=v0rJuhEa59c'  WHERE name = 'Reverse Pec Deck';
UPDATE exercises SET video_url = 'https://www.youtube.com/watch?v=eIq5CB9JfKE'  WHERE name = 'Face Pulls';

-- Biceps
UPDATE exercises SET video_url = 'https://www.youtube.com/watch?v=i1YgFZB6alI'  WHERE name = 'Incline Dumbbell Curl';
UPDATE exercises SET video_url = 'https://www.youtube.com/watch?v=BPmUhDtdQfw'  WHERE name = 'Preacher Curl';
UPDATE exercises SET video_url = 'https://www.youtube.com/watch?v=8XLxfXROrTo'  WHERE name = 'Hammer Curl';
UPDATE exercises SET video_url = 'https://www.youtube.com/watch?v=i1YgFZB6alI'  WHERE name = 'EZ Bar Curl';

-- Chest
UPDATE exercises SET video_url = 'https://www.youtube.com/watch?v=VDU5bzE2qOE'  WHERE name = 'Incline Dumbbell Press';
UPDATE exercises SET video_url = 'https://www.youtube.com/watch?v=vcBig73ojpE'  WHERE name = 'Flat Bench Press';
UPDATE exercises SET video_url = 'https://www.youtube.com/watch?v=H4mVGHaK2f4'  WHERE name = 'Pec Deck Fly';
UPDATE exercises SET video_url = 'https://www.youtube.com/watch?v=VDU5bzE2qOE'  WHERE name = 'Incline Smith Machine Press';

-- Triceps
UPDATE exercises SET video_url = 'https://www.youtube.com/watch?v=RavQHfFxbdA'  WHERE name = 'Skull Crushers';
UPDATE exercises SET video_url = 'https://www.youtube.com/watch?v=qHDrQglWgS4'  WHERE name = 'Rope Pushdown';
UPDATE exercises SET video_url = 'https://www.youtube.com/watch?v=qHDrQglWgS4'  WHERE name = 'Single Arm Pushdown';
UPDATE exercises SET video_url = 'https://www.youtube.com/watch?v=eyPNDwZlpSg'  WHERE name = 'Overhead Cable Extension';

-- Quads / Legs
UPDATE exercises SET video_url = 'https://www.youtube.com/watch?v=bEv6CCg2BC8'  WHERE name = 'Barbell Squat';
UPDATE exercises SET video_url = 'https://www.youtube.com/watch?v=B6rGDcfyPto'  WHERE name = 'Leg Press';
UPDATE exercises SET video_url = 'https://www.youtube.com/watch?v=_DLIS8SySzs'  WHERE name = 'Walking Lunges';
UPDATE exercises SET video_url = 'https://www.youtube.com/watch?v=ljO4jkwv8wQ'  WHERE name = 'Leg Extension';
UPDATE exercises SET video_url = 'https://www.youtube.com/watch?v=hiLF_pF3EJM'  WHERE name = 'Bulgarian Split Squat';

-- Hamstrings
UPDATE exercises SET video_url = 'https://www.youtube.com/watch?v=_oyxCn2iSjU'  WHERE name = 'Romanian Deadlift';
UPDATE exercises SET video_url = 'https://www.youtube.com/watch?v=Wy1SwoY2aaQ'  WHERE name = 'Seated Leg Curl';
UPDATE exercises SET video_url = 'https://www.youtube.com/watch?v=S367qaHeYWU'  WHERE name = 'Leg Curl';
UPDATE exercises SET video_url = 'https://www.youtube.com/watch?v=MLBm7i341Rw'  WHERE name = 'Hip Adductors';

-- Glutes / Calves
UPDATE exercises SET video_url = 'https://www.youtube.com/watch?v=OjI5OpV6IWA'  WHERE name = 'Hip Abduction';
UPDATE exercises SET video_url = 'https://www.youtube.com/watch?v=ORY-ke6vcgk'  WHERE name = 'Calf Raises';

-- Core
UPDATE exercises SET video_url = 'https://www.youtube.com/watch?v=Pr1ieGZ5atk'  WHERE name = 'Hanging Leg Raises';
UPDATE exercises SET video_url = 'https://www.youtube.com/watch?v=aBd6T01PBqw'  WHERE name = 'Cable Crunches';
