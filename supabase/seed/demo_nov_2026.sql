-- supabase/seed/demo_nov_2026.sql
-- Seed demo data for November 2026 (Number Log, Habit Tracker, Bar Chart)
-- Target user: newuser@gmail.com
-- Idempotent: safe to run multiple times without duplicating rows or creating overlaps.

DO $$
DECLARE
  v_user_id uuid;
  v_book_id uuid;
  v_month_id uuid;
  v_number_log_id uuid;
  v_habit_tracker_id uuid;
  v_bar_chart_id uuid;
BEGIN
  -- 1. Look up user id in auth.users
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE email = 'newuser@gmail.com';

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Target user newuser@gmail.com not found in auth.users';
  END IF;

  -- 2. Ensure book for 2026 exists
  INSERT INTO books (user_id, year)
  VALUES (v_user_id, 2026)
  ON CONFLICT (user_id, year) DO UPDATE SET year = EXCLUDED.year
  RETURNING id INTO v_book_id;

  IF v_book_id IS NULL THEN
    SELECT id INTO v_book_id FROM books WHERE user_id = v_user_id AND year = 2026;
  END IF;

  -- 3. Ensure month 11 exists with setup_done = true and dotted paper
  INSERT INTO months (book_id, month, setup_done, paper_left, paper_right, setup_config)
  VALUES (
    v_book_id,
    11,
    true,
    'dotted',
    'dotted',
    jsonb_build_object(
      'habits', jsonb_build_array(
        jsonb_build_object('name', 'Walk', 'isRed', false),
        jsonb_build_object('name', 'Read', 'isRed', false),
        jsonb_build_object('name', 'Water', 'isRed', false),
        jsonb_build_object('name', 'Sugar', 'isRed', true),
        jsonb_build_object('name', 'Social media', 'isRed', true)
      ),
      'startingLayout', 'journal',
      'trackedNumbers', jsonb_build_object(
        'weight', true,
        'sleepScore', true,
        'mood', true,
        'custom', '[]'::jsonb
      )
    )
  )
  ON CONFLICT (book_id, month) DO UPDATE SET
    setup_done = true,
    paper_left = 'dotted',
    paper_right = 'dotted',
    setup_config = coalesce(months.setup_config, '{}'::jsonb) || jsonb_build_object(
      'habits', jsonb_build_array(
        jsonb_build_object('name', 'Walk', 'isRed', false),
        jsonb_build_object('name', 'Read', 'isRed', false),
        jsonb_build_object('name', 'Water', 'isRed', false),
        jsonb_build_object('name', 'Sugar', 'isRed', true),
        jsonb_build_object('name', 'Social media', 'isRed', true)
      ),
      'startingLayout', coalesce(months.setup_config->>'startingLayout', 'journal'),
      'trackedNumbers', coalesce(months.setup_config->'trackedNumbers', jsonb_build_object(
        'weight', true,
        'sleepScore', true,
        'mood', true,
        'custom', '[]'::jsonb
      ))
    )
  RETURNING id INTO v_month_id;

  IF v_month_id IS NULL THEN
    SELECT id INTO v_month_id FROM months WHERE book_id = v_book_id AND month = 11;
  END IF;

  -- 4. Number Log widget (Left page, x=0, y=4, w=6, h=24)
  -- Look for existing Sleep score widget first, otherwise any number-log
  SELECT id INTO v_number_log_id
  FROM widgets
  WHERE month_id = v_month_id
    AND type = 'number-log'
    AND (config->>'title' = 'Sleep score' OR config->>'label' = 'Sleep score')
  ORDER BY created_at ASC
  LIMIT 1;

  IF v_number_log_id IS NULL THEN
    SELECT id INTO v_number_log_id
    FROM widgets
    WHERE month_id = v_month_id
      AND type = 'number-log'
    ORDER BY created_at ASC
    LIMIT 1;
  END IF;

  IF v_number_log_id IS NOT NULL THEN
    UPDATE widgets
    SET
      page = 'left',
      x = 0,
      y = 4,
      w = 6,
      h = 24,
      config = jsonb_build_object('title', 'Sleep score', 'label', 'Sleep score', 'unit', '/100'),
      z = 0
    WHERE id = v_number_log_id;
  ELSE
    INSERT INTO widgets (month_id, page, type, x, y, w, h, config, z)
    VALUES (
      v_month_id,
      'left',
      'number-log',
      0,
      4,
      6,
      24,
      jsonb_build_object('title', 'Sleep score', 'label', 'Sleep score', 'unit', '/100'),
      0
    )
    RETURNING id INTO v_number_log_id;
  END IF;

  -- Remove any duplicate number-log widgets for this month
  DELETE FROM widgets
  WHERE month_id = v_month_id
    AND type = 'number-log'
    AND id != v_number_log_id;

  -- 5. Habit Tracker widget (Left page, x=6, y=4, w=14, h=24)
  SELECT id INTO v_habit_tracker_id
  FROM widgets
  WHERE month_id = v_month_id
    AND type = 'habit-tracker'
    AND config->>'title' = 'Habits'
  ORDER BY created_at ASC
  LIMIT 1;

  IF v_habit_tracker_id IS NULL THEN
    SELECT id INTO v_habit_tracker_id
    FROM widgets
    WHERE month_id = v_month_id
      AND type = 'habit-tracker'
    ORDER BY created_at ASC
    LIMIT 1;
  END IF;

  IF v_habit_tracker_id IS NOT NULL THEN
    UPDATE widgets
    SET
      page = 'left',
      x = 6,
      y = 4,
      w = 14,
      h = 24,
      config = jsonb_build_object('title', 'Habits'),
      z = 0
    WHERE id = v_habit_tracker_id;
  ELSE
    INSERT INTO widgets (month_id, page, type, x, y, w, h, config, z)
    VALUES (
      v_month_id,
      'left',
      'habit-tracker',
      6,
      4,
      14,
      24,
      jsonb_build_object('title', 'Habits'),
      0
    )
    RETURNING id INTO v_habit_tracker_id;
  END IF;

  -- Remove any duplicate habit-tracker widgets for this month
  DELETE FROM widgets
  WHERE month_id = v_month_id
    AND type = 'habit-tracker'
    AND id != v_habit_tracker_id;

  -- 6. Bar Chart widget (Right page, x=2, y=4, w=14, h=12)
  -- If two empty "Daily Bars" exist, turn ONE into this Bar Chart and delete the other.
  SELECT id INTO v_bar_chart_id
  FROM widgets
  WHERE month_id = v_month_id
    AND type = 'bar-chart'
    AND config->>'title' = 'Sleep this month'
  ORDER BY created_at ASC
  LIMIT 1;

  IF v_bar_chart_id IS NULL THEN
    SELECT id INTO v_bar_chart_id
    FROM widgets
    WHERE month_id = v_month_id
      AND type = 'bar-chart'
    ORDER BY created_at ASC
    LIMIT 1;
  END IF;

  IF v_bar_chart_id IS NOT NULL THEN
    UPDATE widgets
    SET
      page = 'right',
      x = 2,
      y = 4,
      w = 14,
      h = 12,
      config = jsonb_build_object('title', 'Sleep this month', 'sourceWidgetId', v_number_log_id::text),
      z = 0
    WHERE id = v_bar_chart_id;
  ELSE
    INSERT INTO widgets (month_id, page, type, x, y, w, h, config, z)
    VALUES (
      v_month_id,
      'right',
      'bar-chart',
      2,
      4,
      14,
      12,
      jsonb_build_object('title', 'Sleep this month', 'sourceWidgetId', v_number_log_id::text),
      0
    )
    RETURNING id INTO v_bar_chart_id;
  END IF;

  -- Delete the other "Daily Bars" / duplicate bar-charts
  DELETE FROM widgets
  WHERE month_id = v_month_id
    AND type = 'bar-chart'
    AND id != v_bar_chart_id;

  -- Delete any spurious entries attached to bar chart (bar chart sources entries from number log)
  DELETE FROM entries
  WHERE widget_id = v_bar_chart_id;

  -- 7. Remove any widget that overlaps with our 3 placed widgets.
  -- Leave any non-overlapping widgets (including Sticky Notes) alone.
  -- Left page occupied:
  --   Number Log: (x: 0..6, y: 4..28)
  --   Habit Tracker: (x: 6..20, y: 4..28)
  --   Combined footprint: (x: 0..20, y: 4..28)
  -- Right page occupied:
  --   Bar Chart: (x: 2..16, y: 4..16)
  DELETE FROM widgets
  WHERE month_id = v_month_id
    AND id NOT IN (v_number_log_id, v_habit_tracker_id, v_bar_chart_id)
    AND (
      (page = 'left' AND x < 20 AND (x + w) > 0 AND y < 28 AND (y + h) > 4)
      OR
      (page = 'right' AND x < 16 AND (x + w) > 2 AND y < 16 AND (y + h) > 4)
    );

  -- 8. Number Log entries for days 1 to 8:
  -- Sleep score: 72, 65, 80, 77, 58, 85, 90, 74
  INSERT INTO entries (widget_id, day, value)
  VALUES
    (v_number_log_id, 1, '{"value": 72}'::jsonb),
    (v_number_log_id, 2, '{"value": 65}'::jsonb),
    (v_number_log_id, 3, '{"value": 80}'::jsonb),
    (v_number_log_id, 4, '{"value": 77}'::jsonb),
    (v_number_log_id, 5, '{"value": 58}'::jsonb),
    (v_number_log_id, 6, '{"value": 85}'::jsonb),
    (v_number_log_id, 7, '{"value": 90}'::jsonb),
    (v_number_log_id, 8, '{"value": 74}'::jsonb)
  ON CONFLICT (widget_id, day) DO UPDATE
    SET value = EXCLUDED.value;

  -- Clean up any extra entries > 8 for Number Log to keep demo state clean
  DELETE FROM entries
  WHERE widget_id = v_number_log_id
    AND day > 8;

  -- 9. Habit Tracker entries for days 1 to 8:
  -- Habits: 0=Walk, 1=Read, 2=Water, 3=Sugar, 4=Social media
  -- Walk on 1,2,4,6,7,8; Read on 1,3,4,5,8; Water on 1 to 8; Sugar on 3,5; Social media on 2,3,5,6
  INSERT INTO entries (widget_id, day, value)
  VALUES
    (v_habit_tracker_id, 1, '{"marks": {"0": true, "1": true, "2": true}}'::jsonb),
    (v_habit_tracker_id, 2, '{"marks": {"0": true, "2": true, "4": true}}'::jsonb),
    (v_habit_tracker_id, 3, '{"marks": {"1": true, "2": true, "3": true, "4": true}}'::jsonb),
    (v_habit_tracker_id, 4, '{"marks": {"0": true, "1": true, "2": true}}'::jsonb),
    (v_habit_tracker_id, 5, '{"marks": {"1": true, "2": true, "3": true, "4": true}}'::jsonb),
    (v_habit_tracker_id, 6, '{"marks": {"0": true, "2": true, "4": true}}'::jsonb),
    (v_habit_tracker_id, 7, '{"marks": {"0": true, "2": true}}'::jsonb),
    (v_habit_tracker_id, 8, '{"marks": {"0": true, "1": true, "2": true}}'::jsonb)
  ON CONFLICT (widget_id, day) DO UPDATE
    SET value = EXCLUDED.value;

  -- Clean up any extra entries > 8 for Habit Tracker to keep demo state clean
  DELETE FROM entries
  WHERE widget_id = v_habit_tracker_id
    AND day > 8;

END $$;
