/*
  # Add due_time column to tasks table

  1. Changes
    - Add `due_time` column to store specific time for tasks
    - This allows users to set both date and time for their tasks
    - Column is optional (nullable) for backward compatibility

  2. Notes
    - Existing tasks will have null due_time initially
    - New tasks can optionally include specific time
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tasks' AND column_name = 'due_time'
  ) THEN
    ALTER TABLE tasks ADD COLUMN due_time text;
  END IF;
END $$;