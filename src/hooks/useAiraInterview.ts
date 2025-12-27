import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { toast } from 'sonner';

// Global state to persist session across component mounts
let globalSession: AiraInterviewSession | null = null;
let globalConversations: AiraConversation[] = [];
let globalActivities: AiraActivity[] = [];
let globalCodeSnippets: AiraCodeSnippet[] = [];

export interface AiraInterviewSession {
  id: string;
  user_id: string;
  role_title: string;
  attempt_number?: number; // Optional for backward compatibility
  current_stage: number;
  session_status: 'active' | 'completed' | 'paused' | 'cancelled';
  resume_data?: any;
  total_duration_seconds?: number;
  started_at: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface AiraConversation {
  id: string;
  session_id: string;
  speaker: 'ai' | 'user';
  message: string;
  stage: number;
  timestamp: string;
  metadata?: any;
}

export interface AiraAnalytics {
  id: string;
  session_id: string;
  skill_name: string;
  score: number;
  max_score: number;
  category: string;
  created_at: string;
}

export interface AiraActivity {
  id: string;
  session_id: string;
  activity_type: 'question' | 'answer' | 'analysis' | 'system';
  message: string;
  status: 'success' | 'warning' | 'info' | 'error';
  timestamp: string;
  metadata?: any;
}

export interface AiraCodeSnippet {
  id: string;
  session_id: string;
  filename: string;
  content: string;
  language: string;
  analysis?: any;
  created_at: string;
  updated_at: string;
}

export const useAiraInterview = () => {
  const [user, setUser] = useState<User | null>(null);
  const [currentSession, setCurrentSession] = useState<AiraInterviewSession | null>(globalSession);
  const [conversations, setConversations] = useState<AiraConversation[]>(globalConversations);
  const [analytics, setAnalytics] = useState<AiraAnalytics[]>([]);
  const [activities, setActivities] = useState<AiraActivity[]>(globalActivities);
  const [codeSnippets, setCodeSnippets] = useState<AiraCodeSnippet[]>(globalCodeSnippets);
  const [loading, setLoading] = useState(false); // Start with false to prevent flash

  // Set up auth state listener
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_, session) => {
        setUser(session?.user ?? null);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Create a new interview session
  const createSession = async (roleTitle: string) => {
    if (!user) return null;

    try {
      // Try to get the next attempt number, but handle missing column gracefully
      let nextAttemptNumber = 1;

      try {
        const { data: previousSessions, error: countError } = await supabase
          .from('aira_interview_sessions')
          .select('attempt_number')
          .eq('user_id', user.id)
          .order('attempt_number', { ascending: false })
          .limit(1);

        if (countError) {
          // If attempt_number column doesn't exist, just use 1
          console.warn('attempt_number column not found, using default value 1');
        } else if (previousSessions && previousSessions.length > 0) {
          nextAttemptNumber = previousSessions[0].attempt_number + 1;
        }
      } catch (attemptError) {
        console.warn('Could not fetch attempt number, using default:', attemptError);
      }

      // Try to create session with attempt_number, fallback without it
      let sessionData;
      try {
        const { data, error } = await supabase
          .from('aira_interview_sessions')
          .insert({
            user_id: user.id,
            role_title: roleTitle,
            attempt_number: nextAttemptNumber,
            current_stage: 0,
            session_status: 'active'
          })
          .select()
          .single();

        if (error) throw error;
        sessionData = data;
      } catch (insertError: any) {
        // If attempt_number column doesn't exist, create without it
        if (insertError.code === '42703') {
          console.warn('Creating session without attempt_number column');
          const { data, error } = await supabase
            .from('aira_interview_sessions')
            .insert({
              user_id: user.id,
              role_title: roleTitle,
              current_stage: 0,
              session_status: 'active'
            })
            .select()
            .single();

          if (error) throw error;
          sessionData = data;
        } else {
          throw insertError;
        }
      }

      // Update both local and global state
      globalSession = sessionData;
      setCurrentSession(sessionData);

      // Update cache
      const cacheKey = `aira_session_${user.id}`;
      const sessionWithCache = { ...sessionData, _cacheTime: new Date().toISOString() };
      localStorage.setItem(cacheKey, JSON.stringify(sessionWithCache));

      // Add initial system activity
      const attemptText = sessionData.attempt_number ? `Attempt #${sessionData.attempt_number}` : 'New session';
      await addActivity(sessionData.id, 'system', `Interview session started - ${attemptText}`, 'info');

      return sessionData;
    } catch (error) {
      console.error('Error creating session:', error);
      toast.error('Failed to create interview session');
      return null;
    }
  };

  // Get or create current active session - check for existing active session first
  const getCurrentSession = async () => {
    if (!user) return null;

    try {
      // Check if there's already an active session for this page load
      const { data: existingSessions, error: fetchError } = await supabase
        .from('aira_interview_sessions')
        .select('*')
        .eq('user_id', user.id)
        .eq('session_status', 'active')
        .order('created_at', { ascending: false })
        .limit(1);

      if (fetchError) {
        // If table doesn't exist, return null and let component handle gracefully
        console.warn('Aira tables not found. Please run the database migration.');
        return null;
      }

      // If there's an active session, use it (don't complete it)
      if (existingSessions && existingSessions.length > 0) {
        const session = existingSessions[0];

        // Update both local and global state
        globalSession = session;
        setCurrentSession(session);

        // Cache the session
        const cacheKey = `aira_session_${user.id}`;
        const sessionWithCache = { ...session, _cacheTime: new Date().toISOString() };
        localStorage.setItem(cacheKey, JSON.stringify(sessionWithCache));

        return session;
      }

      // No active session found, return null to start fresh
      return null;
    } catch (error) {
      console.error('Error getting current session:', error);
      return null;
    }
  };

  // Update session stage
  const updateSessionStage = async (sessionId: string, stage: number) => {
    try {
      const { data, error } = await supabase
        .from('aira_interview_sessions')
        .update({ current_stage: stage })
        .eq('id', sessionId)
        .select()
        .single();

      if (error) throw error;

      // Update both local and global state
      console.log('Updated session stage to:', data.current_stage);
      globalSession = data;
      setCurrentSession(data);

      // Update cache with new stage
      if (user) {
        const cacheKey = `aira_session_${user.id}`;
        const sessionWithCache = { ...data, _cacheTime: new Date().toISOString() };
        localStorage.setItem(cacheKey, JSON.stringify(sessionWithCache));
      }

      // Add stage transition activity
      await addActivity(sessionId, 'system', `Advanced to stage ${stage + 1}`, 'info');

      return data;
    } catch (error) {
      console.error('Error updating session stage:', error);
      toast.error('Failed to update interview stage');
      return null;
    }
  };

  // Add conversation message
  const addConversation = async (sessionId: string, speaker: 'ai' | 'user', message: string, stage: number) => {
    try {
      const { data, error } = await supabase
        .from('aira_conversations')
        .insert({
          session_id: sessionId,
          speaker,
          message,
          stage
        })
        .select()
        .single();

      if (error) throw error;

      // Update both local and global state
      globalConversations = [...globalConversations, data];
      setConversations(globalConversations);
      return data;
    } catch (error) {
      console.error('Error adding conversation:', error);
      return null;
    }
  };

  // Add activity
  const addActivity = async (
    sessionId: string, 
    activityType: 'question' | 'answer' | 'analysis' | 'system', 
    message: string, 
    status: 'success' | 'warning' | 'info' | 'error'
  ) => {
    try {
      const { data, error } = await supabase
        .from('aira_activities')
        .insert({
          session_id: sessionId,
          activity_type: activityType,
          message,
          status
        })
        .select()
        .single();

      if (error) throw error;

      // Update both local and global state
      globalActivities = [data, ...globalActivities.slice(0, 9)]; // Keep only latest 10 activities
      setActivities(globalActivities);
      return data;
    } catch (error) {
      console.error('Error adding activity:', error);
      return null;
    }
  };

  // Update or create code snippet
  const updateCodeSnippet = async (sessionId: string, content: string, filename: string = 'solution.js') => {
    try {
      // First try to get existing snippet
      const { data: existing } = await supabase
        .from('aira_code_snippets')
        .select('*')
        .eq('session_id', sessionId)
        .eq('filename', filename)
        .single();

      let result;
      if (existing) {
        // Update existing
        const { data, error } = await supabase
          .from('aira_code_snippets')
          .update({ content })
          .eq('id', existing.id)
          .select()
          .single();

        if (error) throw error;
        result = data;
      } else {
        // Create new
        const { data, error } = await supabase
          .from('aira_code_snippets')
          .insert({
            session_id: sessionId,
            filename,
            content,
            language: 'javascript'
          })
          .select()
          .single();

        if (error) throw error;
        result = data;
      }

      setCodeSnippets(prev => {
        const filtered = prev.filter(snippet => !(snippet.session_id === sessionId && snippet.filename === filename));
        return [...filtered, result];
      });

      return result;
    } catch (error) {
      console.error('Error updating code snippet:', error);
      return null;
    }
  };

  // Load session data
  const loadSessionData = async (sessionId: string) => {
    try {
      setLoading(true);

      // Load conversations
      const { data: conversationData } = await supabase
        .from('aira_conversations')
        .select('*')
        .eq('session_id', sessionId)
        .order('timestamp', { ascending: true });

      if (conversationData) {
        globalConversations = conversationData;
        setConversations(conversationData);
      }

      // Load activities
      const { data: activityData } = await supabase
        .from('aira_activities')
        .select('*')
        .eq('session_id', sessionId)
        .order('timestamp', { ascending: false })
        .limit(10);

      if (activityData) {
        globalActivities = activityData;
        setActivities(activityData);
      }

      // Load analytics
      const { data: analyticsData } = await supabase
        .from('aira_analytics')
        .select('*')
        .eq('session_id', sessionId);

      if (analyticsData) setAnalytics(analyticsData);

      // Load code snippets
      const { data: codeData } = await supabase
        .from('aira_code_snippets')
        .select('*')
        .eq('session_id', sessionId)
        .order('updated_at', { ascending: false });

      if (codeData) setCodeSnippets(codeData);

    } catch (error) {
      console.error('Error loading session data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Initialize session on mount with debouncing
  useEffect(() => {
    let isMounted = true;

    const initializeSession = async () => {
      if (!user || !isMounted) return;

      // Check if we already have global session data to avoid unnecessary loading
      if (globalSession && globalSession.user_id === user.id) {
        console.log('Loading session from global state, stage:', globalSession.current_stage);
        setCurrentSession(globalSession);
        setConversations(globalConversations);
        setActivities(globalActivities);
        setCodeSnippets(globalCodeSnippets);
        setLoading(false);
        return;
      }

      setLoading(true);

      try {
        const session = await getCurrentSession();
        if (session && isMounted) {
          await loadSessionData(session.id);
        }
      } catch (error) {
        console.error('Error initializing session:', error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    // Add a small delay to prevent flash on quick tab switches
    const timer = setTimeout(initializeSession, 100);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [user]); // Remove currentSession from dependencies to prevent loops

  // Update session role
  const updateSessionRole = async (sessionId: string, roleTitle: string) => {
    try {
      const { data, error } = await supabase
        .from('aira_interview_sessions')
        .update({ role_title: roleTitle })
        .eq('id', sessionId)
        .select()
        .single();

      if (error) throw error;

      // Update both local and global state
      globalSession = data;
      setCurrentSession(data);

      // Update cache
      if (user) {
        const cacheKey = `aira_session_${user.id}`;
        const sessionWithCache = { ...data, _cacheTime: new Date().toISOString() };
        localStorage.setItem(cacheKey, JSON.stringify(sessionWithCache));
      }

      return data;
    } catch (error) {
      console.error('Error updating session role:', error);
      toast.error('Failed to update role');
      return null;
    }
  };



  // Start a completely new interview (complete current session and clear state)
  const startNewInterview = async () => {
    if (!user) return;

    try {
      // Complete any existing active sessions
      const { data: existingSessions } = await supabase
        .from('aira_interview_sessions')
        .select('*')
        .eq('user_id', user.id)
        .eq('session_status', 'active');

      if (existingSessions && existingSessions.length > 0) {
        for (const session of existingSessions) {
          await supabase
            .from('aira_interview_sessions')
            .update({
              session_status: 'completed',
              completed_at: new Date().toISOString()
            })
            .eq('id', session.id);
        }
      }

      // Clear all state
      setCurrentSession(null);
      setConversations([]);
      setActivities([]);
      setCodeSnippets([]);
      setAnalytics([]);

      // Clear global state
      globalSession = null;
      globalConversations = [];
      globalActivities = [];
      globalCodeSnippets = [];

      // Clear cache
      const cacheKey = `aira_session_${user.id}`;
      localStorage.removeItem(cacheKey);

    } catch (error) {
      console.error('Error starting new interview:', error);
    }
  };

  return {
    currentSession,
    conversations,
    analytics,
    activities,
    codeSnippets,
    loading,
    createSession,
    getCurrentSession,
    updateSessionStage,
    updateSessionRole,
    startNewInterview,
    addConversation,
    addActivity,
    updateCodeSnippet,
    loadSessionData
  };
};
