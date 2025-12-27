import React, { useState, useEffect } from 'react';
import {
  Upload,
  FileText,
  Code,
  MessageSquare,
  User,
  Brain,
  Target,
  CheckCircle,
  Clock,
  BarChart3,
  Download,
  ChevronRight,
  ChevronDown,
  Settings,
  Activity,
  TrendingUp,
  Users,
  Award,
  LineChart,
  PieChart,
  Zap,
  Filter,
  CheckSquare
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { useAiraInterview } from '@/hooks/useAiraInterview';
import { useAiraAnalytics } from '@/hooks/useAiraAnalytics';
import { useElevenLabsConversation } from '@/hooks/useElevenLabsConversation';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useMemo } from 'react';

// Wavy Animation Component for Voice Activity
const WaveAnimation = ({ isActive, isAISpeaking }: { isActive: boolean; isAISpeaking: boolean }) => {
  const waves = Array.from({ length: 5 }, (_, i) => i);

  return (
    <div className="flex items-center justify-center gap-1">
      {waves.map((wave) => (
        <motion.div
          key={wave}
          className={`w-1 rounded-full ${
            isAISpeaking
              ? 'bg-blue-600'
              : isActive
                ? 'bg-primary'
                : 'bg-muted-foreground'
          }`}
          animate={
            isActive || isAISpeaking
              ? {
                  height: [8, 32, 16, 40, 12, 28, 8],
                  opacity: [0.4, 1, 0.6, 1, 0.8, 1, 0.4],
                }
              : {
                  height: 8,
                  opacity: 0.4,
                }
          }
          transition={{
            duration: 1.5,
            repeat: isActive || isAISpeaking ? Infinity : 0,
            delay: wave * 0.1,
            ease: "easeInOut",
          }}
          style={{ height: 8 }}
        />
      ))}
    </div>
  );
};



interface StageData {
  id: number;
  title: string;
  status: 'completed' | 'current' | 'pending';
  icon: React.ReactNode;
}



// Interfaces moved to hooks - no longer needed here



const AiraDashboard: React.FC = () => {
  const navigate = useNavigate();

  // Database-driven hooks
  const {
    currentSession,
    conversations,
    activities,
    codeSnippets,
    loading: interviewLoading,
    createSession,
    updateSessionStage,
    updateSessionRole,
    startNewInterview,
    addConversation,
    addActivity,
    updateCodeSnippet
  } = useAiraInterview();

  const {
    skillScores,
    sessionMetrics,
    loading: analyticsLoading,
    getMetricCards,
    initializeDefaultSkills
  } = useAiraAnalytics(currentSession?.id);

  // Local UI state
  const [currentMessage, setCurrentMessage] = useState('');
  const [voiceAmplitude, setVoiceAmplitude] = useState(0.3);
  const [showNotepad, setShowNotepad] = useState(true);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<{full_name: string | null, email: string | null} | null>(null);
  const [showLoadingScreen, setShowLoadingScreen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [resumeUploaded, setResumeUploaded] = useState(false);
  const [skillsInitialized, setSkillsInitialized] = useState(false);

  // Timer state
  const [interviewStartTime, setInterviewStartTime] = useState<Date | null>(null);
  const [interviewEndTime, setInterviewEndTime] = useState<Date | null>(null);
  const [currentDuration, setCurrentDuration] = useState<string>('00:00');

  // Timer utility functions
  const formatDuration = (startTime: Date, endTime?: Date) => {
    const end = endTime || new Date();
    const diffMs = end.getTime() - startTime.getTime();
    const minutes = Math.floor(diffMs / 60000);
    const seconds = Math.floor((diffMs % 60000) / 1000);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const startInterviewTimer = () => {
    const now = new Date();
    setInterviewStartTime(now);
    setInterviewEndTime(null);
  };

  const stopInterviewTimer = () => {
    if (interviewStartTime) {
      const now = new Date();
      setInterviewEndTime(now);
      return formatDuration(interviewStartTime, now);
    }
    return '00:00';
  };

  // Add timeout for loading state and prevent flash
  useEffect(() => {
    let loadingTimer: NodeJS.Timeout;

    if (interviewLoading || analyticsLoading) {
      // Show loading screen only after a significant delay to prevent unnecessary loading screens
      loadingTimer = setTimeout(() => {
        setShowLoadingScreen(true);
      }, 2000); // 2 second delay before showing loading
    } else {
      setShowLoadingScreen(false);
    }

    return () => {
      if (loadingTimer) clearTimeout(loadingTimer);
    };
  }, [interviewLoading, analyticsLoading]);

  // Derived state from database
  const currentStage = currentSession?.current_stage || 0;
  const conversationHistory = conversations.map(conv => ({
    id: conv.id,
    speaker: conv.speaker,
    message: conv.message,
    timestamp: new Date(conv.timestamp).toLocaleTimeString()
  }));
  const activityFeed = activities.map(activity => ({
    id: activity.id,
    type: activity.activity_type,
    message: activity.message,
    timestamp: new Date(activity.timestamp).toLocaleString(),
    status: activity.status
  }));

  // Memoize userProfile to prevent unnecessary re-renders
  const memoizedUserProfile = useMemo(() => userProfile, [userProfile?.full_name, userProfile?.email]);

  // Memoize callbacks to prevent unnecessary re-renders
  const onStageComplete = useMemo(() => (stage: number) => {
    console.log(`Stage ${stage} completed`);
    // Handle stage completion logic here
  }, []);

  const onError = useMemo(() => (error: string) => {
    console.error('ElevenLabs error:', error);
    toast.error(error);
  }, []);

  // ElevenLabs Conversation Integration
  const {
    conversationState
  } = useElevenLabsConversation({
    stage: currentStage,
    userProfile: memoizedUserProfile,
    onStageComplete,
    onError
  });

  // Extract conversation state for UI
  const isListening = conversationState.isListening;
  const isAISpeaking = conversationState.isSpeaking;
  const notepadContent = codeSnippets.find(snippet => snippet.filename === 'solution.js')?.content ||
    `// AI Interview Code Challenge
function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

// TODO: Optimize this solution
console.log(fibonacci(10));`;

  // Fetch user profile
  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, email')
        .eq('id', userId)
        .single();

      if (error) throw error;
      setUserProfile(data);
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  // Set up auth state listener
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_, session) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          fetchUserProfile(session.user.id);
        } else {
          setUserProfile(null);
          // Redirect to auth if user is not authenticated
          navigate('/auth?redirect=aira');
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserProfile(session.user.id);
      } else {
        // Redirect to auth if user is not authenticated
        navigate('/auth?redirect=aira');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  // Initialize default skills when session is available (only once)
  useEffect(() => {
    if (currentSession && skillScores.length === 0 && !skillsInitialized) {
      setSkillsInitialized(true);
      initializeDefaultSkills(currentSession.id);
    }
  }, [currentSession, skillScores.length, skillsInitialized]);

  // Restore state from current session
  useEffect(() => {
    if (currentSession) {
      // Set selected role from session
      if (currentSession.role_title && !selectedRole) {
        setSelectedRole(currentSession.role_title);
      }

      // Set resume uploaded status from session
      if (currentSession.resume_data && !resumeUploaded) {
        setResumeUploaded(true);
      }

      // Only restore timer if we're resuming an active interview at stage 2+
      // Don't auto-start timer - let it start naturally when user progresses
      // This prevents timer from starting automatically on page load
    }
  }, [currentSession, selectedRole, resumeUploaded, interviewStartTime]);

  // Timer effect - update current duration every second
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (interviewStartTime && !interviewEndTime) {
      interval = setInterval(() => {
        setCurrentDuration(formatDuration(interviewStartTime));
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [interviewStartTime, interviewEndTime]);

  // Stage-specific conversation starters
  const getStageConversation = (stage: number) => {
    const stageConversations = {
      2: [{ // Warm-up
        id: '1',
        speaker: 'ai' as const,
        message: 'Hello! I\'m Aira, your AI interviewer. I\'m excited to get to know you better. Shall we begin with you telling me a bit about yourself?',
        timestamp: new Date().toLocaleTimeString()
      }],
      3: [{ // Knowledge Assessment
        id: '1',
        speaker: 'ai' as const,
        message: 'Great! Now let\'s dive into some technical questions to assess your knowledge. Can you explain the difference between \'let\', \'const\', and \'var\' in JavaScript and when you would use each one?',
        timestamp: new Date().toLocaleTimeString()
      }],
      4: [{ // Deep Dive
        id: '1',
        speaker: 'ai' as const,
        message: 'Excellent technical knowledge! Now I\'d like to learn more about your practical experience. Can you walk me through a challenging project you\'ve worked on recently? What technologies did you use and what obstacles did you overcome?',
        timestamp: new Date().toLocaleTimeString()
      }],
      5: [{ // Follow-up
        id: '1',
        speaker: 'ai' as const,
        message: 'Thank you for sharing those insights! I have a few follow-up questions to better understand your experience. You mentioned working with React - can you describe a specific performance optimization you implemented and the impact it had?',
        timestamp: new Date().toLocaleTimeString()
      }]
    };
    return stageConversations[stage] || [];
  };


  const stageTemplates = [
    { id: 0, title: 'Role Selection', icon: <Target className="w-4 h-4" /> },
    { id: 1, title: 'Resume Upload', icon: <Upload className="w-4 h-4" /> },
    { id: 2, title: 'Warm-up', icon: <MessageSquare className="w-4 h-4" /> },
    { id: 3, title: 'Knowledge Assessment', icon: <Brain className="w-4 h-4" /> },
    { id: 4, title: 'Deep Dive', icon: <FileText className="w-4 h-4" /> },
    { id: 5, title: 'Follow-up', icon: <User className="w-4 h-4" /> },
    { id: 6, title: 'Analytics', icon: <BarChart3 className="w-4 h-4" /> }
  ];

  const stages: StageData[] = stageTemplates.map((stage, index) => ({
    ...stage,
    status: currentStage >= stageTemplates.length ? 'completed' :
            index < currentStage ? 'completed' :
            index === currentStage ? 'current' : 'pending'
  }));

  // Get metrics cards from analytics hook
  const metricsCards = getMetricCards().map((card, index) => {
    const icons = [
      <Award className="w-4 h-4" />,
      <TrendingUp className="w-4 h-4" />,
      <Zap className="w-4 h-4" />,
      <Clock className="w-4 h-4" />
    ];
    return { ...card, icon: icons[index] };
  });





  // Initialize conversation when stage changes
  useEffect(() => {
    if (!currentSession) return;

    const stageConversation = getStageConversation(currentStage);
    if (stageConversation.length > 0 && conversations.length === 0) {
      // Add initial AI message for the stage
      addConversation(currentSession.id, 'ai', stageConversation[0].message, currentStage);
    }

    // Add activity feed item when code editor becomes available
    if (currentStage === 2 && activities.length === 0) {
      addActivity(currentSession.id, 'system', 'AI Code Assistant activated - Ready for technical challenges', 'success');
    }

    // Enhanced voice amplitude simulation for more dynamic visual effects
    const amplitudeInterval = setInterval(() => {
      if (!isAISpeaking) {
        // Listening state: moderate, natural amplitude variations
        setVoiceAmplitude(0.3 + Math.sin(Date.now() * 0.003) * 0.2 + Math.random() * 0.1);
      } else {
        // Speaking state: more dynamic amplitude
        const time = Date.now() * 0.001;
        const baseAmplitude = 0.7;
        const variation = Math.sin(time * 3) * 0.2 + Math.sin(time * 7) * 0.1;
        const randomNoise = (Math.random() - 0.5) * 0.3;
        const finalAmplitude = Math.max(0.4, Math.min(1.0, baseAmplitude + variation + randomNoise));
        setVoiceAmplitude(finalAmplitude);
      }
    }, 50); // Faster updates for smoother animation

    return () => clearInterval(amplitudeInterval);
  }, [currentStage, isAISpeaking, currentSession, conversations.length, activities.length]);



  // Validation function to check if current stage requirements are met
  const canProceedToNextStage = () => {
    switch (currentStage) {
      case 0: // Role Selection
        return selectedRole !== null;
      case 1: // Resume Upload
        return resumeUploaded;
      default:
        return true; // Other stages don't have specific requirements
    }
  };

  const nextStage = async () => {
    if (!currentSession) return;

    // Check if current stage requirements are met
    if (!canProceedToNextStage()) {
      let message = '';
      switch (currentStage) {
        case 0:
          message = 'Please select a role before proceeding';
          break;
        case 1:
          message = 'Please upload your resume before proceeding';
          break;
        default:
          message = 'Please complete the current step before proceeding';
      }
      toast.error(message);
      return;
    }

    if (currentStage < stages.length - 1) {
      const nextStageNumber = currentStage + 1;

      // Start timer when entering warm-up stage (stage 2)
      if (nextStageNumber === 2 && !interviewStartTime) {
        startInterviewTimer();
        toast.success('Interview timer started!');
      }

      await updateSessionStage(currentSession.id, nextStageNumber);
    } else {
      // Complete the interview
      await completeInterview();
    }
  };

  const completeInterview = async () => {
    if (!currentSession) return;

    try {
      // Stop the interview timer and get final duration
      const finalDuration = stopInterviewTimer();
      const durationInSeconds = interviewStartTime ?
        Math.floor((new Date().getTime() - interviewStartTime.getTime()) / 1000) : 0;

      // Update session status to completed
      const { error } = await supabase
        .from('aira_interview_sessions')
        .update({
          session_status: 'completed',
          completed_at: new Date().toISOString(),
          total_duration_seconds: durationInSeconds
        })
        .eq('id', currentSession.id);

      if (error) throw error;

      // Add completion activity with duration
      await addActivity(currentSession.id, 'system', `Interview completed successfully! Duration: ${finalDuration}`, 'success');

      // Move to completion stage (beyond normal stages)
      updateSessionStage(currentSession.id, stages.length);

      toast.success(`Interview completed in ${finalDuration}!`);

    } catch (error) {
      console.error('Error completing interview:', error);
    }
  };

  const generateInterviewReport = () => {
    if (!currentSession) return;

    const reportData = {
      interviewDetails: {
        role: currentSession.role_title,
        duration: sessionMetrics.duration,
        completedAt: new Date().toLocaleDateString(),
        interviewer: 'Aira AI Assistant'
      },
      performance: {
        overallScore: sessionMetrics.overallScore,
        grade: sessionMetrics.grade,
        responseQuality: sessionMetrics.responseQuality,
        confidenceScore: sessionMetrics.confidenceScore,
        questionsAnswered: sessionMetrics.questionsAnswered
      },
      skillBreakdown: skillScores,
      recommendations: generateRecommendations()
    };

    // Create and download the report
    const reportContent = formatReportAsText(reportData);
    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Aira_Interview_Report_${currentSession.role_title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const generateRecommendations = () => {
    const recommendations = [];

    skillScores.forEach(skill => {
      if (skill.score < 70) {
        recommendations.push(`Focus on improving ${skill.skill} - Consider additional practice in ${skill.category.toLowerCase()} areas`);
      } else if (skill.score >= 90) {
        recommendations.push(`Excellent ${skill.skill} performance - Consider mentoring others in this area`);
      }
    });

    if (sessionMetrics.responseQuality < 80) {
      recommendations.push('Work on providing more detailed and structured responses during interviews');
    }

    if (sessionMetrics.confidenceScore < 75) {
      recommendations.push('Practice mock interviews to build confidence and reduce hesitation');
    }

    return recommendations.length > 0 ? recommendations : ['Great overall performance! Continue practicing to maintain your skills.'];
  };

  const formatReportAsText = (data: any) => {
    return `
AIRA AI INTERVIEW REPORT
========================

Interview Details:
- Role: ${data.interviewDetails.role}
- Duration: ${data.interviewDetails.duration}
- Completed: ${data.interviewDetails.completedAt}
- Interviewer: ${data.interviewDetails.interviewer}

Performance Summary:
- Overall Score: ${data.performance.overallScore}%
- Grade: ${data.performance.grade}
- Response Quality: ${data.performance.responseQuality}%
- Confidence Score: ${data.performance.confidenceScore}
- Questions Answered: ${data.performance.questionsAnswered}

Skill Breakdown:
${data.skillBreakdown.map((skill: any) => `- ${skill.skill}: ${skill.score}/${skill.maxScore} (${skill.category})`).join('\n')}

Recommendations:
${data.recommendations.map((rec: string, index: number) => `${index + 1}. ${rec}`).join('\n')}

Generated by Aira AI Interview System
Report Date: ${new Date().toLocaleString()}
    `.trim();
  };

  // Removed unused ConversationalInterface component

  const renderCompletionScreen = () => {
    const totalDuration = sessionMetrics.duration;
    const overallScore = sessionMetrics.overallScore;
    const grade = sessionMetrics.grade;

    return (
      <div className="space-y-8">
        {/* Completion Header */}
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-gradient-to-br from-green-100 to-emerald-200 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-4">Interview Complete!</h1>
          <p className="text-xl text-muted-foreground mb-2">
            Congratulations on completing your AI interview session
          </p>
          <p className="text-lg text-muted-foreground">
            Role: <span className="font-semibold text-foreground">{currentSession?.role_title}</span>
          </p>
        </div>

        {/* Results Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bright-card text-center">
            <CardContent className="p-6">
              <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-2">{totalDuration}</h3>
              <p className="text-muted-foreground">Total Duration</p>
            </CardContent>
          </Card>

          <Card className="bright-card text-center">
            <CardContent className="p-6">
              <div className="w-16 h-16 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-2">{overallScore}%</h3>
              <p className="text-muted-foreground">Overall Score</p>
            </CardContent>
          </Card>

          <Card className="bright-card text-center">
            <CardContent className="p-6">
              <div className="w-16 h-16 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-2">Grade {grade}</h3>
              <p className="text-muted-foreground">Performance Grade</p>
            </CardContent>
          </Card>
        </div>

        {/* Skill Breakdown */}
        <Card className="bright-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Skill Assessment Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {skillScores.map((skill, index) => (
                <div key={`completion-${skill.skill}-${index}`} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-foreground">{skill.skill}</span>
                    <span className="text-sm font-semibold text-muted-foreground">
                      {skill.score}/{skill.maxScore}
                    </span>
                  </div>
                  <Progress value={skill.score} className="h-2" />
                  <p className="text-xs text-muted-foreground">{skill.category}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Next Steps */}
        <Card className="bright-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ChevronRight className="w-5 h-5" />
              What's Next?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-semibold text-foreground">Immediate Actions</h4>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckSquare className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-muted-foreground">Download your interview report</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckSquare className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-muted-foreground">Review skill feedback and recommendations</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckSquare className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-muted-foreground">Practice areas identified for improvement</span>
                  </li>
                </ul>
              </div>
              <div className="space-y-4">
                <h4 className="font-semibold text-foreground">Continue Learning</h4>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <Target className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-muted-foreground">Take practice assessments to improve</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Target className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-muted-foreground">Explore domain-specific modules</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Target className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-muted-foreground">Schedule another AI interview session</span>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={() => {
              // Generate and download report
              generateInterviewReport();
            }}
            className="brand-button-primary flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Download Report
          </Button>

          <Button
            variant="outline"
            onClick={() => {
              // Navigate to practice hub
              window.location.href = '/practice-hub';
            }}
            className="flex items-center gap-2"
          >
            <Target className="w-4 h-4" />
            Practice More
          </Button>

          <Button
            variant="outline"
            onClick={async () => {
              await startNewInterview();
              setSelectedRole(null);
              setResumeUploaded(false);
              // Reset timer state
              setInterviewStartTime(null);
              setInterviewEndTime(null);
              setCurrentDuration('00:00');
              toast.success('Started new interview!');
            }}
            className="flex items-center gap-2"
          >
            <Brain className="w-4 h-4" />
            New Interview
          </Button>
        </div>
      </div>
    );
  };

  const renderStageContent = () => {
    // Check if interview is completed (beyond normal stages)
    if (currentStage >= stages.length) {
      return renderCompletionScreen();
    }

    switch (currentStage) {
      case 0:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-foreground mb-2">Select Your Role</h2>
              <p className="text-muted-foreground">Choose the position you're interviewing for</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {['Frontend Developer', 'Backend Developer', 'Full Stack Developer', 'Data Scientist', 'Product Manager', 'UI/UX Designer'].map((role) => (
                <Card
                  key={role}
                  className={`bright-card cursor-pointer transition-colors group ${
                    selectedRole === role
                      ? 'border-primary bg-primary/5'
                      : 'hover:border-primary'
                  }`}
                  onClick={async () => {
                    setSelectedRole(role);
                    // Since we always start fresh, there should be no existing session
                    // But handle the case just in case
                    if (!currentSession) {
                      await createSession(role);
                    } else {
                      // Update existing session with new role
                      await updateSessionRole(currentSession.id, role);
                    }
                    // Don't auto-advance, let user click Next button
                  }}
                >
                  <CardContent className="p-6 text-center">
                    <div className={`w-12 h-12 bg-gradient-to-br rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform ${
                      selectedRole === role
                        ? 'from-primary/20 to-primary/30 border-2 border-primary'
                        : 'from-purple-100 to-purple-200'
                    }`}>
                      <Code className={`w-6 h-6 ${
                        selectedRole === role ? 'text-primary' : 'text-purple-600'
                      }`} />
                      {selectedRole === role && (
                        <CheckCircle className="w-4 h-4 text-primary absolute -top-1 -right-1 bg-background rounded-full" />
                      )}
                    </div>
                    <h3 className={`font-semibold ${
                      selectedRole === role ? 'text-primary' : 'text-foreground'
                    }`}>{role}</h3>
                    {selectedRole === role && (
                      <Badge variant="outline" className="mt-2 border-primary text-primary">
                        Selected
                      </Badge>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-foreground mb-2">Upload Your Resume</h2>
              <p className="text-muted-foreground">Upload your resume for personalized questions</p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className={`border-dashed border-2 transition-colors cursor-pointer ${
                resumeUploaded
                  ? 'border-green-300 bg-green-50/50'
                  : 'border-border hover:border-primary'
              }`}>
                <CardContent className="p-8 text-center">
                  {resumeUploaded ? (
                    <>
                      <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
                      <h3 className="font-semibold text-green-700 mb-2">Resume Uploaded</h3>
                      <p className="text-green-600 mb-4">Click to upload a different file</p>
                    </>
                  ) : (
                    <>
                      <Upload className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                      <h3 className="font-semibold text-foreground mb-2">Drag & Drop</h3>
                      <p className="text-muted-foreground mb-4">or click to browse files</p>
                    </>
                  )}
                  <input
                    type="file"
                    id="resume-upload"
                    accept=".pdf,.doc,.docx"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        console.log('Selected file:', file.name);
                        setResumeUploaded(true);

                        // Store resume data in session
                        if (currentSession) {
                          const resumeData = {
                            filename: file.name,
                            size: file.size,
                            type: file.type,
                            uploadedAt: new Date().toISOString()
                          };

                          // Update session with resume data
                          const updateResume = async () => {
                            try {
                              const { error } = await supabase
                                .from('aira_interview_sessions')
                                .update({ resume_data: resumeData })
                                .eq('id', currentSession.id);

                              if (error) throw error;
                              toast.success(`Resume "${file.name}" uploaded successfully!`);
                            } catch (error) {
                              console.error('Error saving resume data:', error);
                              toast.error('Failed to save resume data');
                            }
                          };
                          updateResume();
                        } else {
                          toast.success(`Resume "${file.name}" selected!`);
                        }
                      }
                    }}
                  />
                  <Button
                    variant="outline"
                    className="border-blue-500 text-blue-600 hover:bg-blue-50"
                    onClick={() => document.getElementById('resume-upload')?.click()}
                  >
                    Browse Files
                  </Button>
                </CardContent>
              </Card>
              <Card className="bright-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-orange-600" />
                    Resume Preview
                    {resumeUploaded && (
                      <Badge variant="outline" className="border-green-200 text-green-700 ml-auto">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Uploaded
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {resumeUploaded ? (
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold">{userProfile?.full_name || user?.email?.split('@')[0] || 'User'}</h4>
                        <p className="text-sm text-muted-foreground">{currentSession?.role_title || selectedRole || 'Software Developer'}</p>
                      </div>
                      <Separator />
                      <div>
                        <h5 className="font-medium mb-2">Status</h5>
                        <p className="text-sm text-green-600">✓ Resume uploaded successfully</p>
                        <p className="text-sm text-muted-foreground">Ready for technical assessment</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4 text-center py-8">
                      <div className="w-16 h-16 bg-muted/30 rounded-lg flex items-center justify-center mx-auto">
                        <Upload className="w-8 h-8 text-muted-foreground" />
                      </div>
                      <div>
                        <h4 className="font-medium text-muted-foreground">No resume uploaded</h4>
                        <p className="text-sm text-muted-foreground">Please upload your resume to continue</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-8">
            {/* AI Avatar - Centered */}
            <div className="flex justify-center">
              <Card className="bright-card p-12 text-center">
                <div className="relative mb-8">
                  {/* AI Voice Icon */}
                  <div className="w-80 h-80 mx-auto flex items-center justify-center">
                    <div className={`relative p-16 rounded-full transition-all duration-300 ${
                      isAISpeaking
                        ? 'bg-gradient-to-br from-primary/10 to-primary/20 shadow-lg shadow-primary/20'
                        : isListening
                        ? 'bg-gradient-to-br from-secondary/50 to-secondary/70 shadow-lg shadow-secondary/30'
                        : 'bg-gradient-to-br from-muted/50 to-muted/70 shadow-lg shadow-muted/30'
                    }`} style={{
                      transform: `scale(${1 + (isListening || isAISpeaking ? voiceAmplitude * 0.1 : 0)})`,
                      animation: isListening || isAISpeaking ? 'pulse 2s infinite' : 'none'
                    }}>
                      <div className="scale-[4] transform">
                        <WaveAnimation isActive={isListening} isAISpeaking={isAISpeaking} />
                      </div>

                      {/* Pulsing rings for voice activity */}
                      {(isListening || isAISpeaking) && (
                        <>
                          <div className="absolute inset-0 rounded-full border-2 border-current opacity-30 animate-ping"></div>
                          <div className="absolute inset-2 rounded-full border border-current opacity-20 animate-ping" style={{ animationDelay: '0.5s' }}></div>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <h2 className="text-3xl font-bold text-foreground mb-3">Aira AI Assistant</h2>
                    <p className="text-lg text-muted-foreground mb-4">
                      {isAISpeaking ? 'Speaking...' : isListening ? 'Listening and analyzing...' : 'Ready for conversation'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Use the conversation panel on the left to interact with Aira
                    </p>
                  </div>

                  <div className="flex items-center justify-center">
                    <div className="text-sm text-muted-foreground bg-muted px-4 py-2 rounded-lg">
                      Stage {currentStage + 1} of {stages.length} • {isListening ? 'Listening...' : isAISpeaking ? 'AI Speaking...' : 'Ready'}
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Stage Information */}
            <Card className="bright-card">
              <CardContent className="p-6 text-center">
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  Warm-up Questions
                </h3>
                <p className="text-muted-foreground">
                  Let's start with some warm-up questions to get to know you better. Use the conversation panel on the left to chat with Aira.
                </p>
              </CardContent>
            </Card>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-foreground mb-2">Advanced Analytics Dashboard</h2>
              <p className="text-muted-foreground">Comprehensive performance analysis and insights</p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bright-card">
                <CardHeader className="border-b border-border">
                  <CardTitle className="flex items-center gap-2">
                    <LineChart className="w-5 h-5 text-blue-600" />
                    Skill Assessment Matrix
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                  {skillScores.map((skill, index) => (
                    <div key={`${skill.skill}-${skill.category}-${index}`}>
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-sm font-medium">{skill.skill}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">{skill.score}/{skill.maxScore}</span>
                          <Badge variant="outline" className={
                            skill.score >= 90 ? "border-emerald-200 text-emerald-700" :
                            skill.score >= 80 ? "border-blue-200 text-blue-700" :
                            "border-orange-200 text-orange-700"
                          }>
                            {skill.score >= 90 ? "Excellent" : skill.score >= 80 ? "Good" : "Average"}
                          </Badge>
                        </div>
                      </div>
                      <Progress value={(skill.score / skill.maxScore) * 100} className="h-3" />
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="bright-card">
                <CardHeader className="border-b border-border">
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="w-5 h-5 text-purple-600" />
                    Performance Overview
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="text-center mb-6">
                    <div className="relative inline-block">
                      <div className="text-6xl font-bold text-primary mb-2">{sessionMetrics.overallScore}%</div>
                      <Badge variant="outline" className="border-primary/30 text-primary absolute -top-2 -right-4">
                        {sessionMetrics.grade}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground">Overall Interview Score</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    {skillScores.slice(0, 2).map((skill, index) => (
                      <div key={skill.skill} className={`text-center p-3 rounded-lg ${
                        index === 0 ? 'bg-emerald-50' : 'bg-blue-50'
                      }`}>
                        <div className={`text-lg font-bold ${
                          index === 0 ? 'text-emerald-700' : 'text-blue-700'
                        }`}>
                          {Math.round((skill.score / skill.maxScore) * 100)}%
                        </div>
                        <div className={`text-xs ${
                          index === 0 ? 'text-emerald-600' : 'text-blue-600'
                        }`}>
                          {skill.skill}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-3">
                    <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 w-full py-2">
                      <CheckCircle className="w-3 h-3 mr-2" />
                      Strong Technical Foundation
                    </Badge>
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800 w-full py-2">
                      <Award className="w-3 h-3 mr-2" />
                      Excellent Communication
                    </Badge>
                    <Badge variant="secondary" className="bg-purple-100 text-purple-800 w-full py-2">
                      <Brain className="w-3 h-3 mr-2" />
                      Advanced Problem Solving
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-8">
            <div className="flex justify-center">
              <Card className="bright-card p-12 text-center">
                <div className="relative mb-8">
                  <div className="w-80 h-80 mx-auto flex items-center justify-center">
                    <div className={`relative p-16 rounded-full transition-all duration-300 ${
                      isAISpeaking
                        ? 'bg-gradient-to-br from-primary/10 to-primary/20 shadow-lg shadow-primary/20'
                        : isListening
                        ? 'bg-gradient-to-br from-secondary/50 to-secondary/70 shadow-lg shadow-secondary/30'
                        : 'bg-gradient-to-br from-muted/50 to-muted/70 shadow-lg shadow-muted/30'
                    }`} style={{
                      transform: `scale(${1 + (isListening || isAISpeaking ? voiceAmplitude * 0.1 : 0)})`,
                      animation: isListening || isAISpeaking ? 'pulse 2s infinite' : 'none'
                    }}>
                      <div className="scale-[4] transform">
                        <WaveAnimation isActive={isListening} isAISpeaking={isAISpeaking} />
                      </div>

                      {/* Pulsing rings for voice activity */}
                      {(isListening || isAISpeaking) && (
                        <>
                          <div className="absolute inset-0 rounded-full border-2 border-current opacity-30 animate-ping"></div>
                          <div className="absolute inset-2 rounded-full border border-current opacity-20 animate-ping" style={{ animationDelay: '0.5s' }}></div>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <h2 className="text-3xl font-bold text-foreground mb-3">Knowledge Assessment</h2>
                    <p className="text-lg text-muted-foreground mb-4">
                      {isAISpeaking ? 'Speaking...' : isListening ? 'Listening and analyzing...' : 'Ready for conversation'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      I'll assess your technical knowledge and problem-solving skills. Use the conversation panel on the left.
                    </p>
                  </div>

                  <div className="flex items-center justify-center">
                    <div className="text-sm text-muted-foreground bg-muted px-4 py-2 rounded-lg">
                      Stage {currentStage + 1} of {stages.length} • {isListening ? 'Listening...' : isAISpeaking ? 'AI Speaking...' : 'Ready'}
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Stage Information */}
            <Card className="bright-card">
              <CardContent className="p-6 text-center">
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  Technical Assessment
                </h3>
                <p className="text-muted-foreground">
                  Demonstrate your technical knowledge through problem-solving discussions and experience sharing.
                </p>
              </CardContent>
            </Card>
          </div>
        );

      case 4:
        return (
          <div className="space-y-8">
            <div className="flex justify-center">
              <Card className="bright-card p-12 text-center">
                <div className="relative mb-8">
                  <div className="w-80 h-80 mx-auto flex items-center justify-center">
                    <div className={`relative p-16 rounded-full transition-all duration-300 ${
                      isAISpeaking
                        ? 'bg-gradient-to-br from-primary/10 to-primary/20 shadow-lg shadow-primary/20'
                        : isListening
                        ? 'bg-gradient-to-br from-secondary/50 to-secondary/70 shadow-lg shadow-secondary/30'
                        : 'bg-gradient-to-br from-muted/50 to-muted/70 shadow-lg shadow-muted/30'
                    }`} style={{
                      transform: `scale(${1 + (isListening || isAISpeaking ? voiceAmplitude * 0.1 : 0)})`,
                      animation: isListening || isAISpeaking ? 'pulse 2s infinite' : 'none'
                    }}>
                      <div className="scale-[4] transform">
                        <WaveAnimation isActive={isListening} isAISpeaking={isAISpeaking} />
                      </div>

                      {/* Pulsing rings for voice activity */}
                      {(isListening || isAISpeaking) && (
                        <>
                          <div className="absolute inset-0 rounded-full border-2 border-current opacity-30 animate-ping"></div>
                          <div className="absolute inset-2 rounded-full border border-current opacity-20 animate-ping" style={{ animationDelay: '0.5s' }}></div>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <h2 className="text-3xl font-bold text-foreground mb-3">Deep Dive Discussion</h2>
                    <p className="text-lg text-muted-foreground mb-4">
                      {isAISpeaking ? 'Speaking...' : isListening ? 'Listening and analyzing...' : 'Ready for conversation'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Let's dive deeper into your experience and expertise. Use the conversation panel on the left.
                    </p>
                  </div>

                  <div className="flex items-center justify-center">
                    <div className="text-sm text-muted-foreground bg-muted px-4 py-2 rounded-lg">
                      Stage {currentStage + 1} of {stages.length} • {isListening ? 'Listening...' : isAISpeaking ? 'AI Speaking...' : 'Ready'}
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Stage Information */}
            <Card className="bright-card">
              <CardContent className="p-6 text-center">
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  Experience Deep Dive
                </h3>
                <p className="text-muted-foreground">
                  Share detailed examples from your professional experience. Discuss challenges you've faced and how you solved them.
                </p>
              </CardContent>
            </Card>
          </div>
        );

      case 5:
        return (
          <div className="space-y-8">
            <div className="flex justify-center">
              <Card className="bright-card p-12 text-center">
                <div className="relative mb-8">
                  <div className="w-80 h-80 mx-auto flex items-center justify-center">
                    <div className={`relative p-16 rounded-full transition-all duration-300 ${
                      isAISpeaking
                        ? 'bg-gradient-to-br from-primary/10 to-primary/20 shadow-lg shadow-primary/20'
                        : isListening
                        ? 'bg-gradient-to-br from-secondary/50 to-secondary/70 shadow-lg shadow-secondary/30'
                        : 'bg-gradient-to-br from-muted/50 to-muted/70 shadow-lg shadow-muted/30'
                    }`} style={{
                      transform: `scale(${1 + (isListening || isAISpeaking ? voiceAmplitude * 0.1 : 0)})`,
                      animation: isListening || isAISpeaking ? 'pulse 2s infinite' : 'none'
                    }}>
                      <div className="scale-[4] transform">
                        <WaveAnimation isActive={isListening} isAISpeaking={isAISpeaking} />
                      </div>

                      {/* Pulsing rings for voice activity */}
                      {(isListening || isAISpeaking) && (
                        <>
                          <div className="absolute inset-0 rounded-full border-2 border-current opacity-30 animate-ping"></div>
                          <div className="absolute inset-2 rounded-full border border-current opacity-20 animate-ping" style={{ animationDelay: '0.5s' }}></div>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <h2 className="text-3xl font-bold text-foreground mb-3">Final Questions</h2>
                    <p className="text-lg text-muted-foreground mb-4">
                      {isAISpeaking ? 'Speaking...' : isListening ? 'Listening and analyzing...' : 'Ready for conversation'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Let's wrap up our conversation with some final questions. Almost done!
                    </p>
                  </div>

                  <div className="flex items-center justify-center">
                    <div className="text-sm text-muted-foreground bg-muted px-4 py-2 rounded-lg">
                      Stage {currentStage + 1} of {stages.length} • {isListening ? 'Listening...' : isAISpeaking ? 'AI Speaking...' : 'Ready'}
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Stage Information */}
            <Card className="bright-card">
              <CardContent className="p-6 text-center">
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  Wrap-up Questions
                </h3>
                <p className="text-muted-foreground">
                  Final questions about your goals, expectations, and any additional topics you'd like to discuss.
                </p>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Brain className="w-8 h-8 text-purple-600" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">
              {currentStage >= stageTemplates.length
                ? 'Interview Complete'
                : `${stageTemplates[currentStage]?.title || `Stage ${currentStage + 1}`} - In Progress`}
            </h2>
            <p className="text-muted-foreground">AI is preparing advanced assessment content...</p>
          </div>
        );
    }
  };

  // Only show loading state if it's been loading for more than 800ms AND we don't have any data to show
  // This prevents the flash when switching tabs
  const hasDataToShow = currentSession || conversations.length > 0 || activities.length > 0;

  if ((interviewLoading || analyticsLoading) && showLoadingScreen && !hasDataToShow) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Brain className="w-8 h-8 text-primary animate-pulse" />
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">Loading Aira</h2>
          <p className="text-muted-foreground">Just a moment...</p>
        </div>
      </div>
    );
  }

  // If no session and not loading, just render the normal Aira interface
  // The user will start fresh and create a session when they select a role

  return (
    <div className="min-h-screen bg-background">

      {/* Advanced Dashboard Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center shadow-lg">
                    <Brain className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full border-2 border-background animate-pulse"></div>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
                    Aira
                    <Badge variant="secondary" className="text-xs bg-primary/10 text-primary border-primary/20">
                      v1.0
                    </Badge>
                  </h1>
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Activity className="w-3 h-3 text-primary" />
                    Enterprise Interview Platform
                  </p>
                </div>
              </div>
              
              {/* Real-time Status Indicators */}
              <div className="hidden lg:flex items-center gap-4 pl-6 border-l border-border">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                  <span className="text-xs text-muted-foreground">AI Active</span>
                </div>
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-blue-500" />
                  <span className="text-xs text-muted-foreground">Audio: 98.5%</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-orange-500" />
                  <span className="text-xs text-muted-foreground">Latency: 23ms</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Metrics Summary */}
              <div className="hidden md:flex items-center gap-4 px-4 py-2 bg-blue-50 rounded-lg border border-blue-200">
                <div className="text-center">
                  <div className="text-sm font-semibold text-blue-700">{sessionMetrics.responseQuality}%</div>
                  <div className="text-xs text-blue-600">Quality</div>
                </div>
                <Separator orientation="vertical" className="h-8" />
                <div className="text-center">
                  <div className="text-sm font-semibold text-blue-700">
                    {interviewStartTime && !interviewEndTime ? currentDuration :
                     (interviewEndTime ? formatDuration(interviewStartTime!, interviewEndTime) : '00:00')}
                  </div>
                  <div className="text-xs text-blue-600">Duration</div>
                </div>
              </div>

              <Badge variant="outline" className="border-purple-200 text-purple-700 px-3 py-1">
                <User className="w-3 h-3 mr-2" />
                {userProfile?.full_name || user?.email?.split('@')[0] || 'User'}
                <div className="w-2 h-2 bg-emerald-500 rounded-full ml-2"></div>
              </Badge>

              {/* Start New Interview button - only show if there's a current session */}
              {currentSession && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    await startNewInterview();
                    setSelectedRole(null);
                    setResumeUploaded(false);
                    // Reset timer state
                    setInterviewStartTime(null);
                    setInterviewEndTime(null);
                    setCurrentDuration('00:00');
                    toast.success('Started new interview!');
                  }}
                  className="text-xs"
                >
                  New Interview
                </Button>
              )}
              
              <Button variant="outline" size="sm" className="relative">
                <MessageSquare className="w-4 h-4" />
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></div>
              </Button>
              
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-6">
        {/* Enhanced Tech AI Progress Bar */}
        <div className="mb-6 flex items-center gap-4">
          <div className="flex-1 relative overflow-hidden rounded-lg border border-border bg-gradient-to-br from-secondary/30 via-secondary/10 to-primary/10 backdrop-blur-sm shadow-lg">
            {/* Animated Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 animate-pulse"></div>
              <div className="absolute top-0 left-0 w-full h-full">
                <div className="grid grid-cols-12 h-full opacity-30">
                  {Array.from({ length: 24 }).map((_, i) => (
                    <div
                      key={i}
                      className="border-r border-border/30 animate-pulse"
                      style={{ animationDelay: `${i * 0.1}s` }}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Floating Particles */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="absolute w-1 h-1 bg-primary/60 rounded-full animate-bounce"
                  style={{
                    left: `${15 + i * 20}%`,
                    top: `${30 + (i % 2) * 40}%`,
                    animationDelay: `${i * 0.5}s`,
                    animationDuration: `${2 + i * 0.3}s`
                  }}
                />
              ))}
            </div>

            <div className="relative p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  {/* Enhanced Stage Icon */}
                  <div className="relative">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center backdrop-blur-sm border transition-all duration-500 ${
                      stages[currentStage]?.status === 'completed'
                        ? 'bg-gradient-to-br from-primary/20 to-primary/30 border-primary/40 text-primary'
                        : 'bg-gradient-to-br from-primary/10 to-primary/20 border-primary/30 text-primary'
                    }`}>
                      {/* Show completion icon if interview is completed or stage is completed */}
                      {(currentStage >= stages.length || stages[currentStage]?.status === 'completed') ? (
                        <CheckCircle className="w-4 h-4 animate-pulse" />
                      ) : stages[currentStage]?.icon ? (
                        <div className="relative">
                          {React.cloneElement(stages[currentStage].icon as React.ReactElement, { className: "w-4 h-4" })}
                          <div className="absolute inset-0 animate-ping opacity-30">
                            {React.cloneElement(stages[currentStage].icon as React.ReactElement, { className: "w-4 h-4" })}
                          </div>
                        </div>
                      ) : (
                        <CheckCircle className="w-4 h-4" />
                      )}
                    </div>
                    {/* Neural Network Nodes */}
                    <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-primary rounded-full animate-pulse opacity-60"></div>
                    <div className="absolute -bottom-0.5 -left-0.5 w-1.5 h-1.5 bg-primary rounded-full animate-pulse opacity-40" style={{ animationDelay: '0.5s' }}></div>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-foreground">
                      {currentStage >= stages.length ? 'Interview Complete' : stages[currentStage]?.title}
                    </h3>
                    <p className="text-xs text-muted-foreground font-mono">
                      <span className="text-primary font-semibold">
                        {currentStage >= stages.length ? 'COMPLETE' : `STAGE_${String(currentStage + 1).padStart(2, '0')}`}
                      </span>
                      <span className="mx-1 text-muted-foreground">|</span>
                      <span className="text-primary">
                        {currentStage >= stages.length ? '100' : Math.round(((currentStage + 1) / stages.length) * 100)}%
                      </span>
                      <span className="mx-1 text-muted-foreground">|</span>
                      <span className="text-primary">
                        {currentStage >= stages.length ? 'FINISHED' : 'PROCESSING'}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-2xl font-bold font-mono text-primary">
                    {currentStage >= stages.length ? '100' : Math.round(((currentStage + 1) / stages.length) * 100)}%
                  </div>
                  <div className="text-xs text-muted-foreground font-mono uppercase tracking-wider">
                    COMPLETION
                  </div>
                </div>
              </div>

              {/* Advanced Progress Bar */}
              <div className="relative mb-2">
                {/* Background Track */}
                <div className="h-2 bg-gradient-to-r from-green-50 to-green-100 rounded-full overflow-hidden backdrop-blur-sm">
                  {/* Animated Progress Fill */}
                  <div
                    className="h-full bg-gradient-to-r from-primary via-primary to-primary/80 rounded-full relative overflow-hidden transition-all duration-1000 ease-out"
                    style={{
                      width: `${currentStage >= stages.length ? 100 : ((currentStage + 1) / stages.length) * 100}%`
                    }}
                  >
                    {/* Data Flow Animation */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
                  </div>
                </div>

                {/* Enhanced Stage Markers */}
                <div className="flex justify-between absolute -top-1 left-0 right-0">
                  {stages.map((stage, index) => (
                    <div
                      key={stage.id}
                      className={`relative w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all duration-500 ${
                        (currentStage >= stages.length || index <= currentStage)
                          ? 'bg-gradient-to-br from-primary to-primary/80 border-white shadow-md'
                          : 'bg-green-100 border-green-300 shadow-sm'
                      }`}
                    >
                      {(currentStage >= stages.length || index <= currentStage) && (
                        <>
                          <CheckCircle className="w-2 h-2 text-primary-foreground" />
                          {index === currentStage && (
                            <div className="absolute inset-0 rounded-full bg-primary/30 animate-ping"></div>
                          )}
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Simplified Stage Labels */}
              <div className="flex justify-between text-xs font-mono mt-2">
                {stages.map((stage, index) => (
                  <span
                    key={stage.id}
                    className={`transition-all duration-300 ${
                      index === currentStage
                        ? 'text-primary font-semibold'
                        : index < currentStage
                        ? 'text-primary'
                        : 'text-green-600 font-medium'
                    }`}
                  >
                    {stage.title.split(' ')[0]}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Next Button - Only show if interview is not completed */}
          {currentStage < stages.length && (
            <Button
              onClick={nextStage}
              disabled={!canProceedToNextStage()}
              className={`relative overflow-hidden shadow-lg border-0 px-4 py-2 group transition-all duration-300 flex-shrink-0 ${
                canProceedToNextStage()
                  ? 'brand-button-primary'
                  : 'bg-muted text-muted-foreground cursor-not-allowed'
              }`}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <span className="relative z-10 font-medium text-sm">
                {!canProceedToNextStage() ? (
                  currentStage === 0 ? 'Select a Role' :
                  currentStage === 1 ? 'Upload Resume' : 'Complete Step'
                ) : (
                  currentStage === stages.length - 1 ? 'Complete Interview' : 'Next'
                )}
              </span>
              <ChevronRight className="w-4 h-4 ml-1 relative z-10 group-hover:translate-x-1 transition-transform duration-300" />
            </Button>
          )}
        </div>

        {/* Advanced Metrics Dashboard - Only show in Analytics stage */}
        {currentStage === 6 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {metricsCards.map((metric, index) => (
            <Card key={index} className="relative overflow-hidden group hover:shadow-lg transition-all duration-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className={`p-2 rounded-lg bg-opacity-10 ${metric.color.replace('text-', 'bg-')}`}>
                    <div className={metric.color}>{metric.icon}</div>
                  </div>
                  <div className={`flex items-center gap-1 text-xs ${
                    metric.trend === 'up' ? 'text-green-600' : 
                    metric.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    {metric.trend === 'up' ? <TrendingUp className="w-3 h-3" /> :
                     metric.trend === 'down' ? <TrendingUp className="w-3 h-3 rotate-180" /> :
                     <Activity className="w-3 h-3" />}
                    {metric.change > 0 ? '+' : ''}{metric.change}%
                  </div>
                </div>
                <div className="space-y-1">
                  <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{metric.title}</h3>
                  <p className="text-2xl font-bold text-foreground">{metric.value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
          </div>
        )}

        <div className={`grid gap-6 ${currentStage >= stages.length ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-4'}`}>
          {/* Advanced Sidebar - Progress Tracker & System Monitoring - Hide when completed */}
          {currentStage < stages.length && (
            <div className="lg:col-span-1 space-y-6">

            {/* Live Conversation - Show during conversational stages (2-5) */}
            {currentStage >= 2 && currentStage <= 5 && (
              <Card className="bright-card">
                <CardHeader className="border-b border-border bg-gradient-to-r from-secondary/30 to-transparent">
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <MessageSquare className="w-4 h-4 text-blue-600" />
                    Live Conversation
                    <div className="ml-auto flex items-center gap-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                      <span className="text-xs text-red-600 font-medium">Live</span>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  {/* Conversation History */}
                  <ScrollArea className="h-48 mb-4">
                    <div className="space-y-3">
                      {conversationHistory.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
                          <p className="text-sm">Start the conversation...</p>
                        </div>
                      ) : (
                        conversationHistory.map((msg, index) => (
                          <div key={index} className={`flex gap-2 ${msg.speaker === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[80%] p-2 rounded-lg text-xs ${
                              msg.speaker === 'user'
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted text-muted-foreground'
                            }`}>
                              <p>{msg.message}</p>
                              <p className="text-xs opacity-70 mt-1">{msg.timestamp}</p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </ScrollArea>

                  {/* Input Area */}
                  <div className="flex gap-2">
                    <Textarea
                      value={currentMessage}
                      onChange={(e) => setCurrentMessage(e.target.value)}
                      placeholder="Type your response..."
                      className="flex-1 min-h-[60px] text-xs resize-none"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey && currentMessage.trim() && currentSession) {
                          e.preventDefault();
                          addConversation(currentSession.id, 'user', currentMessage, currentStage);
                          setCurrentMessage('');
                          // Message sent to ElevenLabs conversation
                        }
                      }}
                    />
                    <Button
                      onClick={() => {
                        if (currentMessage.trim() && currentSession) {
                          addConversation(currentSession.id, 'user', currentMessage, currentStage);
                          setCurrentMessage('');
                          // Message sent to ElevenLabs conversation
                        }
                      }}
                      size="sm"
                      className="self-end"
                    >
                      Send
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Conversation Insights */}
            <Card className="bright-card">
              <CardHeader className="border-b border-border">
                <CardTitle className="text-lg flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-blue-600" />
                  {currentStage >= 2 ? 'Conversation Insights' : 'Stage Overview'}
                  <div className="ml-auto">
                    <Badge variant="outline" className="text-xs border-emerald-200 text-emerald-700">
                      {currentStage >= 2 ? 'Live' : 'Ready'}
                    </Badge>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {currentStage >= 2 ? (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{conversationHistory.length}</div>
                        <div className="text-xs text-muted-foreground">Messages</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">
                          {conversationHistory.filter(msg => msg.speaker === 'user').length}
                        </div>
                        <div className="text-xs text-muted-foreground">Your Responses</div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="text-xs text-muted-foreground">Conversation Flow</div>
                      <div className="flex items-center gap-1">
                        {conversationHistory.slice(-8).map((msg, i) => (
                          <div
                            key={i}
                            className={`w-3 h-3 rounded-full ${
                              msg.speaker === 'ai' ? 'bg-blue-400' : 'bg-purple-400'
                            }`}
                            title={msg.speaker === 'ai' ? 'AI Message' : 'Your Message'}
                          ></div>
                        ))}
                      </div>
                    </div>

                    <div className="text-center">
                      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${
                        isAISpeaking
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        <div className={`w-2 h-2 rounded-full ${
                          isAISpeaking ? 'bg-blue-500 animate-pulse' : 'bg-emerald-500 animate-pulse'
                        }`}></div>
                        {isAISpeaking ? 'AI is thinking...' : 'Ready for your response'}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="space-y-4">
                    {/* Current Stage Info */}
                    <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-100">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        {React.cloneElement(stages[currentStage]?.icon as React.ReactElement, {
                          className: "w-5 h-5 text-blue-600"
                        })}
                        <h3 className="font-semibold text-blue-800">
                          {stages[currentStage]?.title}
                        </h3>
                      </div>
                      <p className="text-sm text-blue-700">
                        {currentStage === 0 && "Choose your target role to customize the interview experience"}
                        {currentStage === 1 && "Upload your resume for personalized questions"}
                        {currentStage >= 2 && "Complete the setup stages to begin your AI interview conversation"}
                      </p>
                    </div>

                    {/* Progress Overview */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-emerald-50 rounded-lg border border-emerald-100">
                        <div className="text-lg font-bold text-emerald-700">{currentStage + 1}</div>
                        <div className="text-xs text-emerald-600">Current Stage</div>
                      </div>
                      <div className="text-center p-3 bg-orange-50 rounded-lg border border-orange-100">
                        <div className="text-lg font-bold text-orange-700">{stages.length}</div>
                        <div className="text-xs text-orange-600">Total Stages</div>
                      </div>
                    </div>

                    {/* Next Steps */}
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <h4 className="text-sm font-medium text-gray-800 mb-2">Next Steps:</h4>
                      <ul className="text-xs text-gray-600 space-y-1">
                        {currentStage === 0 && (
                          <li>• Select your target role from the available options</li>
                        )}
                        {currentStage === 1 && (
                          <>
                            <li>• Upload your resume (PDF, DOC, or DOCX)</li>
                            <li>• Review the auto-generated profile preview</li>
                          </>
                        )}
                        {currentStage >= 2 && (
                          <li>• Begin the interactive AI interview conversation</li>
                        )}
                      </ul>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions - Only show in Analytics stage */}
            {currentStage === 6 && (
              <Card className="bright-card">
                <CardHeader className="border-b border-border">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Zap className="w-5 h-5 text-orange-600" />
                    Quick Actions
                    <Button variant="ghost" size="sm" className="ml-auto p-1">
                      <Settings className="w-3 h-3" />
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" size="sm" className="border-emerald-200 text-emerald-700 hover:bg-emerald-50">
                      <Download className="w-3 h-3 mr-1" />
                      Export
                    </Button>
                    <Button variant="outline" size="sm" className="border-blue-200 text-blue-700 hover:bg-blue-50">
                      <BarChart3 className="w-3 h-3 mr-1" />
                      Review
                    </Button>
                    <Button variant="outline" size="sm" className="border-orange-200 text-orange-700 hover:bg-orange-50">
                      <Clock className="w-3 h-3 mr-1" />
                      Pause
                    </Button>
                    <Button variant="outline" size="sm" className="border-purple-200 text-purple-700 hover:bg-purple-50">
                      <Brain className="w-3 h-3 mr-1" />
                      Analyze
                    </Button>
                  </div>

                  <Separator className="my-3" />

                  <Button variant="outline" className="w-full justify-start border-destructive/20 text-destructive hover:bg-destructive/10">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    End Interview
                  </Button>

                  <div className="pt-2 space-y-2">
                    <Button variant="ghost" size="sm" className="w-full justify-start text-xs">
                      <Settings className="w-3 h-3 mr-2" />
                      Security Settings
                    </Button>
                    <Button variant="ghost" size="sm" className="w-full justify-start text-xs">
                      <Users className="w-3 h-3 mr-2" />
                      Share Session
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

          </div>
          )}

          {/* Main Content */}
          <div className={currentStage >= stages.length ? 'col-span-1' : 'lg:col-span-2'}>
            <Card className="bright-card min-h-[600px]">
              <CardContent className="p-6">
                {renderStageContent()}
              </CardContent>
            </Card>


          </div>

          {/* Advanced Right Panel - Activity Feed & Tools - Hide when completed */}
          {currentStage < stages.length && (
            <div className="lg:col-span-1 space-y-6">
            {/* Advanced Code Editor & AI Assistant - Only show during live interview (stage 2+) but not in Analytics */}
            {showNotepad && currentStage >= 2 && currentStage !== 6 && (
              <Card className="bright-card animate-in slide-in-from-right-5 duration-500">
                <CardHeader className="border-b border-border bg-gradient-to-r from-secondary/30 to-transparent">
                  <CardTitle className="flex items-center justify-between text-lg">
                    <div className="flex items-center gap-2">
                      <Code className="w-5 h-5 text-purple-600" />
                      <span>AI Code Assistant</span>
                      <Badge variant="outline" className="text-xs border-emerald-200 text-emerald-700">
                        Active
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" className="text-xs">
                        <Filter className="w-3 h-3 mr-1" />
                        Format
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowNotepad(false)}
                      >
                        <ChevronDown className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="relative">
                    {/* Code Editor Header */}
                    <div className="flex items-center justify-between p-3 bg-secondary/30 border-b border-border">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <FileText className="w-3 h-3" />
                        solution.js
                        <Badge variant="outline" className="text-xs border-orange-200 text-orange-700">
                          Modified
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                        <span className="text-xs text-muted-foreground">Auto-save</span>
                      </div>
                    </div>

                    <Textarea
                      value={notepadContent}
                      onChange={(e) => {
                        if (currentSession) {
                          updateCodeSnippet(currentSession.id, e.target.value, 'solution.js');
                        }
                      }}
                      className="min-h-[250px] font-mono text-sm border-0 resize-none focus-visible:ring-0 bg-background"
                      placeholder="// Write your code here...\n// AI will provide real-time suggestions"
                    />

                    {/* AI Analysis Panel */}
                    <div className="p-3 bg-blue-50 border-t border-border">
                      <div className="flex items-center gap-2 mb-2">
                        <Brain className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-700">AI Analysis</span>
                        <Badge variant="outline" className="text-xs border-orange-200 text-orange-700 ml-auto">
                          Complexity: O(n²)
                        </Badge>
                      </div>
                      <p className="text-xs text-blue-600 mb-3">Consider memoization for optimization. Current solution has exponential time complexity.</p>

                      <div className="grid grid-cols-2 gap-2">
                        <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white text-xs">
                          <Brain className="w-3 h-3 mr-1" />
                          Optimize
                        </Button>
                        <Button variant="outline" size="sm" className="border-blue-200 text-blue-700 hover:bg-blue-50 text-xs">
                          <CheckSquare className="w-3 h-3 mr-1" />
                          Test
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Real-time Activity Feed - Hide in Analytics Dashboard */}
            {currentStage !== 6 && (
              <Card className="bright-card">
              <CardHeader className="border-b border-border">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Activity className="w-5 h-5 text-orange-600" />
                  Live Activity
                  <Badge variant="outline" className="ml-auto text-xs border-purple-200 text-purple-700">
                    {activityFeed.length} events
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-48">
                  <div className="space-y-3">
                    {activityFeed.map((activity) => (
                      <div key={activity.id} className="flex items-start gap-3 group">
                        <div className={`w-2 h-2 rounded-full mt-2 ${
                          activity.status === 'success' ? 'bg-emerald-500' :
                          activity.status === 'warning' ? 'bg-orange-500' :
                          'bg-blue-500'
                        } group-hover:scale-125 transition-transform`}></div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-foreground leading-relaxed">{activity.message}</p>
                          <p className="text-xs text-muted-foreground mt-1">{activity.timestamp}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
            )}

            {/* Enhanced Session Stats - Only show in Analytics stage */}
            {currentStage === 6 && (
              <Card className="bright-card">
              <CardHeader className="border-b border-border">
                <CardTitle className="text-lg flex items-center gap-2">
                  <LineChart className="w-5 h-5 text-emerald-600" />
                  Session Analytics
                  <Button variant="ghost" size="sm" className="ml-auto p-1">
                    <BarChart3 className="w-3 h-3" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="text-lg font-bold text-blue-700">15:32</div>
                    <div className="text-xs text-blue-600">Duration</div>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded-lg border border-purple-200">
                    <div className="text-lg font-bold text-purple-700">8/12</div>
                    <div className="text-xs text-purple-600">Questions</div>
                  </div>
                  <div className="text-center p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                    <div className="text-lg font-bold text-emerald-700">94%</div>
                    <div className="text-xs text-emerald-600">Accuracy</div>
                  </div>
                  <div className="text-center p-3 bg-orange-50 rounded-lg border border-orange-200">
                    <div className="text-lg font-bold text-orange-700">A+</div>
                    <div className="text-xs text-orange-600">Grade</div>
                  </div>
                </div>

                {/* Mini Progress Indicators */}
                <div className="space-y-3">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Response Quality</span>
                    <span className="font-medium text-emerald-600">{sessionMetrics.responseQuality}%</span>
                  </div>
                  <Progress value={sessionMetrics.responseQuality} className="h-1" />

                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Confidence Score</span>
                    <span className="font-medium text-blue-600">{sessionMetrics.confidenceScore}/100</span>
                  </div>
                  <Progress value={sessionMetrics.confidenceScore} className="h-1" />

                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Avg Response Time</span>
                    <span className="font-medium text-orange-600">{sessionMetrics.processingTime}</span>
                  </div>
                  <Progress value={Math.min(100, Math.max(0, 100 - (parseFloat(sessionMetrics.processingTime) * 20)))} className="h-1" />
                </div>
              </CardContent>
            </Card>
            )}


          </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AiraDashboard;