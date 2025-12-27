import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

export interface SkillScore {
  skill: string;
  score: number;
  maxScore: number;
  category: string;
}

export interface MetricCard {
  title: string;
  value: string;
  change: number;
  trend: 'up' | 'down' | 'neutral';
  icon: React.ReactNode;
  color: string;
}

export const useAiraAnalytics = (sessionId?: string) => {
  const [user, setUser] = useState<User | null>(null);
  const [skillScores, setSkillScores] = useState<SkillScore[]>([]);
  const [sessionMetrics, setSessionMetrics] = useState({
    duration: '0:00',
    questionsAnswered: 0,
    responseQuality: 0,
    confidenceScore: 0,
    processingTime: '0.0s',
    overallScore: 0,
    grade: 'N/A'
  });
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

  // Add or update skill analytics
  const addSkillAnalytics = async (
    sessionId: string,
    skillName: string,
    score: number,
    category: string,
    maxScore: number = 100
  ) => {
    try {
      const { data, error } = await supabase
        .from('aira_analytics')
        .insert({
          session_id: sessionId,
          skill_name: skillName,
          score,
          category,
          max_score: maxScore
        })
        .select()
        .single();

      if (error) throw error;

      // Update local state
      setSkillScores(prev => {
        const filtered = prev.filter(skill => skill.skill !== skillName);
        return [...filtered, {
          skill: skillName,
          score,
          maxScore,
          category
        }];
      });

      return data;
    } catch (error) {
      console.error('Error adding skill analytics:', error);
      return null;
    }
  };

  // Load analytics for a session
  const loadSessionAnalytics = async (sessionId: string) => {
    try {
      setLoading(true);

      // Load skill scores
      const { data: analyticsData, error: analyticsError } = await supabase
        .from('aira_analytics')
        .select('*')
        .eq('session_id', sessionId);

      if (analyticsError) {
        console.warn('Aira analytics table not found:', analyticsError.message);
        setLoading(false);
        return;
      }

      // Process analytics data
      let uniqueSkills: SkillScore[] = [];
      if (analyticsData) {
        const skills = analyticsData.map(item => ({
          skill: item.skill_name,
          score: item.score,
          maxScore: item.max_score,
          category: item.category
        }));

        // Deduplicate skills by name, keeping the latest score
        uniqueSkills = skills.reduce((acc, current) => {
          const existingIndex = acc.findIndex(skill => skill.skill === current.skill);
          if (existingIndex >= 0) {
            acc[existingIndex] = current; // Replace with latest
          } else {
            acc.push(current);
          }
          return acc;
        }, [] as typeof skills);

        setSkillScores(uniqueSkills);
      }

      // Load session data for metrics
      const { data: sessionData, error: sessionError } = await supabase
        .from('aira_interview_sessions')
        .select('*')
        .eq('id', sessionId)
        .single();

      if (sessionError) throw sessionError;

      // Load conversation count
      const { data: conversationData, error: conversationError } = await supabase
        .from('aira_conversations')
        .select('id, speaker')
        .eq('session_id', sessionId);

      if (conversationError) throw conversationError;

      // Calculate metrics
      const duration = sessionData?.total_duration_seconds || 0;
      const hours = Math.floor(duration / 3600);
      const minutes = Math.floor((duration % 3600) / 60);
      const seconds = duration % 60;
      const formattedDuration = hours > 0
        ? `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
        : `${minutes}:${seconds.toString().padStart(2, '0')}`;

      const userMessages = conversationData?.filter(msg => msg.speaker === 'user').length || 0;
      const avgScore = uniqueSkills.length > 0
        ? Math.round(uniqueSkills.reduce((sum, skill) => sum + skill.score, 0) / uniqueSkills.length)
        : 0;

      // Calculate response quality based on conversation length and skill scores
      const responseQuality = Math.min(94, Math.max(60, avgScore + (userMessages * 2)));
      
      // Calculate confidence score
      const confidenceScore = Math.min(87, Math.max(50, avgScore - 5));

      // Calculate grade
      let grade = 'F';
      if (avgScore >= 90) grade = 'A+';
      else if (avgScore >= 85) grade = 'A';
      else if (avgScore >= 80) grade = 'A-';
      else if (avgScore >= 75) grade = 'B+';
      else if (avgScore >= 70) grade = 'B';
      else if (avgScore >= 65) grade = 'B-';
      else if (avgScore >= 60) grade = 'C';

      setSessionMetrics({
        duration: formattedDuration,
        questionsAnswered: userMessages,
        responseQuality,
        confidenceScore,
        processingTime: '1.2s', // This could be calculated from actual response times
        overallScore: avgScore,
        grade
      });

    } catch (error) {
      console.error('Error loading session analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  // Initialize default skill scores if none exist
  const initializeDefaultSkills = async (sessionId: string) => {
    // Check if skills already exist for this session
    try {
      const { data: existingSkills } = await supabase
        .from('aira_analytics')
        .select('skill_name')
        .eq('session_id', sessionId);

      if (existingSkills && existingSkills.length > 0) {
        // Skills already exist, don't initialize again
        return;
      }
    } catch (error) {
      console.warn('Could not check existing skills:', error);
      // Continue with initialization if check fails
    }

    const defaultSkills = [
      { name: 'Technical Knowledge', score: 85, category: 'Technical' },
      { name: 'Communication', score: 92, category: 'Soft Skills' },
      { name: 'Problem Solving', score: 78, category: 'Technical' },
      { name: 'Leadership', score: 88, category: 'Soft Skills' }
    ];

    for (const skill of defaultSkills) {
      await addSkillAnalytics(sessionId, skill.name, skill.score, skill.category);
    }
  };

  // Generate metric cards based on current data
  const getMetricCards = (): MetricCard[] => {
    return [
      {
        title: 'Response Quality',
        value: `${sessionMetrics.responseQuality}%`,
        change: +12,
        trend: 'up',
        icon: null, // Will be set in component
        color: 'text-emerald-600'
      },
      {
        title: 'Confidence Score',
        value: sessionMetrics.confidenceScore.toString(),
        change: +5,
        trend: 'up',
        icon: null,
        color: 'text-blue-600'
      },
      {
        title: 'Processing Time',
        value: sessionMetrics.processingTime,
        change: -8,
        trend: 'down',
        icon: null,
        color: 'text-orange-600'
      },
      {
        title: 'Session Duration',
        value: sessionMetrics.duration,
        change: +2,
        trend: 'up',
        icon: null,
        color: 'text-purple-600'
      }
    ];
  };

  // Load analytics when sessionId changes
  useEffect(() => {
    if (sessionId) {
      setLoading(true); // Only set loading when actually starting to load
      loadSessionAnalytics(sessionId);
    } else {
      setLoading(false);
    }
  }, [sessionId]);

  return {
    skillScores,
    sessionMetrics,
    loading,
    addSkillAnalytics,
    loadSessionAnalytics,
    initializeDefaultSkills,
    getMetricCards
  };
};
