-- Drop ai_chat_history table and related objects
-- This removes the AI nutrition assistant chat functionality

-- Drop RLS policies first
DROP POLICY IF EXISTS "Users can view own chat history" ON ai_chat_history;
DROP POLICY IF EXISTS "Users can manage own chat history" ON ai_chat_history;

-- Drop indexes
DROP INDEX IF EXISTS idx_ai_chat_history_user_id;

-- Drop the table (CASCADE will remove foreign key constraints)
DROP TABLE IF EXISTS ai_chat_history CASCADE;
