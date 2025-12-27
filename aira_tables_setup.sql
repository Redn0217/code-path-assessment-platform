-- Run this SQL in your Supabase SQL Editor to create the Aira interview tables

-- Create Aira interview system tables

-- Interview sessions table to track each interview session
CREATE TABLE IF NOT EXISTS public.aira_interview_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role_title TEXT NOT NULL,
  attempt_number INTEGER NOT NULL DEFAULT 1,
  current_stage INTEGER NOT NULL DEFAULT 0,
  session_status TEXT NOT NULL DEFAULT 'active' CHECK (session_status IN ('active', 'completed', 'paused', 'cancelled')),
  resume_data JSONB,
  total_duration_seconds INTEGER DEFAULT 0,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Conversation history table to store AI-user conversations
CREATE TABLE IF NOT EXISTS public.aira_conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.aira_interview_sessions(id) ON DELETE CASCADE,
  speaker TEXT NOT NULL CHECK (speaker IN ('ai', 'user')),
  message TEXT NOT NULL,
  stage INTEGER NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Interview analytics table to store performance metrics
CREATE TABLE IF NOT EXISTS public.aira_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.aira_interview_sessions(id) ON DELETE CASCADE,
  skill_name TEXT NOT NULL,
  score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
  max_score INTEGER NOT NULL DEFAULT 100,
  category TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Activity feed table to track real-time activities
CREATE TABLE IF NOT EXISTS public.aira_activities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.aira_interview_sessions(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL CHECK (activity_type IN ('question', 'answer', 'analysis', 'system')),
  message TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('success', 'warning', 'info', 'error')),
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Code snippets table to store shared code during interviews
CREATE TABLE IF NOT EXISTS public.aira_code_snippets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.aira_interview_sessions(id) ON DELETE CASCADE,
  filename TEXT NOT NULL DEFAULT 'solution.js',
  content TEXT NOT NULL,
  language TEXT NOT NULL DEFAULT 'javascript',
  analysis JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.aira_interview_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aira_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aira_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aira_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aira_code_snippets ENABLE ROW LEVEL SECURITY;

-- RLS policies for interview sessions
CREATE POLICY "Users can view own interview sessions" ON public.aira_interview_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own interview sessions" ON public.aira_interview_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own interview sessions" ON public.aira_interview_sessions
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS policies for conversations
CREATE POLICY "Users can view own conversations" ON public.aira_conversations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.aira_interview_sessions 
      WHERE id = session_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own conversations" ON public.aira_conversations
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.aira_interview_sessions 
      WHERE id = session_id AND user_id = auth.uid()
    )
  );

-- RLS policies for analytics
CREATE POLICY "Users can view own analytics" ON public.aira_analytics
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.aira_interview_sessions 
      WHERE id = session_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own analytics" ON public.aira_analytics
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.aira_interview_sessions 
      WHERE id = session_id AND user_id = auth.uid()
    )
  );

-- RLS policies for activities
CREATE POLICY "Users can view own activities" ON public.aira_activities
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.aira_interview_sessions 
      WHERE id = session_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own activities" ON public.aira_activities
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.aira_interview_sessions 
      WHERE id = session_id AND user_id = auth.uid()
    )
  );

-- RLS policies for code snippets
CREATE POLICY "Users can view own code snippets" ON public.aira_code_snippets
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.aira_interview_sessions 
      WHERE id = session_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own code snippets" ON public.aira_code_snippets
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.aira_interview_sessions 
      WHERE id = session_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own code snippets" ON public.aira_code_snippets
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.aira_interview_sessions 
      WHERE id = session_id AND user_id = auth.uid()
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_aira_sessions_user_id ON public.aira_interview_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_aira_conversations_session_id ON public.aira_conversations(session_id);
CREATE INDEX IF NOT EXISTS idx_aira_analytics_session_id ON public.aira_analytics(session_id);
CREATE INDEX IF NOT EXISTS idx_aira_activities_session_id ON public.aira_activities(session_id);
CREATE INDEX IF NOT EXISTS idx_aira_code_snippets_session_id ON public.aira_code_snippets(session_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_aira_sessions_updated_at ON public.aira_interview_sessions;
CREATE TRIGGER update_aira_sessions_updated_at BEFORE UPDATE ON public.aira_interview_sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_aira_code_snippets_updated_at ON public.aira_code_snippets;
CREATE TRIGGER update_aira_code_snippets_updated_at BEFORE UPDATE ON public.aira_code_snippets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
