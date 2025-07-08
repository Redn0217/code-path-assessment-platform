-- Create achievements system
CREATE TABLE public.achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  category TEXT NOT NULL,
  criteria JSONB NOT NULL, -- Stores conditions to unlock this achievement
  points INTEGER NOT NULL DEFAULT 0,
  badge_color TEXT DEFAULT '#10b981',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user achievements junction table
CREATE TABLE public.user_achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  achievement_id UUID NOT NULL REFERENCES public.achievements(id) ON DELETE CASCADE,
  earned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  progress INTEGER DEFAULT 100, -- Percentage of completion
  UNIQUE(user_id, achievement_id)
);

-- Create skill progress tracking
CREATE TABLE public.skill_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  domain TEXT NOT NULL,
  skill_name TEXT NOT NULL,
  current_level INTEGER NOT NULL DEFAULT 1,
  experience_points INTEGER NOT NULL DEFAULT 0,
  mastery_percentage DECIMAL(5,2) NOT NULL DEFAULT 0.00,
  last_updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, domain, skill_name)
);

-- Create learning recommendations table
CREATE TABLE public.learning_recommendations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  domain TEXT NOT NULL,
  recommendation_type TEXT NOT NULL, -- 'skill_gap', 'next_level', 'review'
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  priority INTEGER NOT NULL DEFAULT 1, -- 1=high, 2=medium, 3=low
  resource_links JSONB, -- Links to learning materials
  is_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS on all new tables
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skill_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_recommendations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for achievements (public read)
CREATE POLICY "Anyone can view achievements" 
ON public.achievements 
FOR SELECT 
USING (true);

-- RLS Policies for user_achievements
CREATE POLICY "Users can view their own achievements" 
ON public.user_achievements 
FOR SELECT 
USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert their own achievements" 
ON public.user_achievements 
FOR INSERT 
WITH CHECK (auth.uid()::text = user_id::text);

-- RLS Policies for skill_progress
CREATE POLICY "Users can view their own skill progress" 
ON public.skill_progress 
FOR SELECT 
USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert their own skill progress" 
ON public.skill_progress 
FOR INSERT 
WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update their own skill progress" 
ON public.skill_progress 
FOR UPDATE 
USING (auth.uid()::text = user_id::text);

-- RLS Policies for learning_recommendations
CREATE POLICY "Users can view their own recommendations" 
ON public.learning_recommendations 
FOR SELECT 
USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update their own recommendations" 
ON public.learning_recommendations 
FOR UPDATE 
USING (auth.uid()::text = user_id::text);

-- Insert some default achievements
INSERT INTO public.achievements (name, description, icon, category, criteria, points) VALUES
('First Steps', 'Complete your first assessment', '🎯', 'Getting Started', '{"type": "assessment_completed", "count": 1}', 10),
('Quick Learner', 'Complete 3 assessments in one day', '⚡', 'Speed', '{"type": "assessments_per_day", "count": 3}', 25),
('Persistent', 'Complete 10 assessments total', '💪', 'Persistence', '{"type": "total_assessments", "count": 10}', 50),
('High Scorer', 'Score above 80% on any assessment', '🏆', 'Performance', '{"type": "high_score", "threshold": 80}', 30),
('Perfect Score', 'Score 100% on any assessment', '💯', 'Performance', '{"type": "perfect_score", "threshold": 100}', 100),
('Domain Master', 'Score above 90% in all domains', '👑', 'Mastery', '{"type": "domain_mastery", "threshold": 90}', 200),
('Code Warrior', 'Complete 50 coding challenges', '⚔️', 'Coding', '{"type": "coding_challenges", "count": 50}', 75),
('Streak Runner', 'Complete assessments for 7 consecutive days', '🔥', 'Consistency', '{"type": "daily_streak", "days": 7}', 150);