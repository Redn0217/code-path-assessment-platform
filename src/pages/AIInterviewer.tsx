import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AnimatedFooter } from '@/components/ui/animated-footer';
import { 
  Brain, 
  Code, 
  MessageSquare, 
  BarChart3, 
  Users, 
  Zap, 
  Target, 
  CheckCircle, 
  Clock, 
  Star,
  ArrowRight,
  Play,
  FileText,
  Monitor,
  Lightbulb,
  Trophy,
  Rocket,
  GitBranch,
  Terminal,
  Eye,
  Settings,
  Award
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import AuthenticatedLayout from '@/components/AuthenticatedLayout';
import { ThemeToggle } from '@/components/ui/theme-toggle';

const AIInterviewer = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_, session) => {
        setSession(session);
        setUser(session?.user ?? null);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const interviewStages = [
    {
      stage: 1,
      title: "Role & Resume Analysis",
      icon: <FileText className="h-5 w-5" />,
      description: "AI analyzes your background and target role",
      features: ["Background analysis", "Role matching", "Personalized parameters"]
    },
    {
      stage: 2,
      title: "Warm-up Questions",
      icon: <MessageSquare className="h-5 w-5" />,
      description: "Comfortable introduction to build rapport",
      features: ["Basic background", "Motivation questions", "Interview rhythm"]
    },
    {
      stage: 3,
      title: "Knowledge Assessment",
      icon: <Brain className="h-5 w-5" />,
      description: "Technical and domain-specific questions",
      features: ["Live coding", "Problem-solving", "Skills validation"]
    },
    {
      stage: 4,
      title: "Deep Dive Discussion",
      icon: <Code className="h-5 w-5" />,
      description: "In-depth exploration of your experience",
      features: ["Complex challenges", "System design", "Collaborative sessions"]
    },
    {
      stage: 5,
      title: "Follow-up & Clarification",
      icon: <Eye className="h-5 w-5" />,
      description: "Code review and optimization discussions",
      features: ["Code review", "Technical approaches", "Alternative solutions"]
    },
    {
      stage: 6,
      title: "Comprehensive Analytics",
      icon: <BarChart3 className="h-5 w-5" />,
      description: "Real-time performance analysis",
      features: ["Performance metrics", "Technical scoring", "Career recommendations"]
    }
  ];

  const features = [
    {
      title: "Shared Digital Workspace",
      icon: <FileText className="h-6 w-6 text-blue-500" />,
      description: "Interactive whiteboard for AI-human collaboration during interviews",
      highlights: ["Real-time interaction", "Problem-solving focus", "Interview simulation"]
    },
    {
      title: "Collaborative Code Environment",
      icon: <Code className="h-6 w-6 text-green-500" />,
      description: "Shared coding space for demonstrating technical thinking",
      highlights: ["Logic building", "AI analysis", "Technical communication"]
    },
    {
      title: "Performance Analytics",
      icon: <BarChart3 className="h-6 w-6 text-purple-500" />,
      description: "Comprehensive assessment across all dimensions",
      highlights: ["Code quality", "Communication skills", "Detailed reports"]
    },
    {
      title: "AI-Powered Intelligence",
      icon: <Brain className="h-6 w-6 text-orange-500" />,
      description: "Continuous analysis with dynamic questioning and feedback",
      highlights: ["Real-time analysis", "Contextual follow-ups", "Intelligent responses"]
    }
  ];

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        {/* Modern Header */}
        <header className="modern-navbar sticky top-0 z-50 rounded-b-3xl">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-3">
              <div className="flex items-center">
                <img src="/logo.png" alt="evalu8 Logo" className="h-8 w-auto navbar-logo cursor-pointer" onClick={() => navigate('/')} />
              </div>
              <div className="flex items-center space-x-3">
                <ThemeToggle />
                <Button variant="outline" onClick={() => navigate('/')}>
                  Back to Home
                </Button>
                <Button onClick={() => navigate('/auth')}>
                  Login / Register
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="py-20 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950/20 dark:via-indigo-950/20 dark:to-purple-950/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-6">
              AI Interviewer
            </h1>
            <p className="text-2xl md:text-3xl font-semibold text-gray-700 dark:text-gray-300 mb-4">
              Revolutionary Interview Experience
            </p>
            <p className="text-xl text-muted-foreground mb-8 max-w-4xl mx-auto">
              🚀 Transform Your Interview Process with AI-Powered Intelligence. Experience the future of interviews with our cutting-edge AI Interviewer - a sophisticated, interactive platform that combines advanced artificial intelligence with real-time collaboration tools.
            </p>
            <div className="flex flex-wrap justify-center gap-4 mb-12">
              <Badge variant="secondary" className="px-4 py-2 text-sm">
                <Zap className="h-4 w-4 mr-2" />
                7 Comprehensive Stages
              </Badge>
              <Badge variant="secondary" className="px-4 py-2 text-sm">
                <Code className="h-4 w-4 mr-2" />
                Real-time Collaboration
              </Badge>
              <Badge variant="secondary" className="px-4 py-2 text-sm">
                <Brain className="h-4 w-4 mr-2" />
                Advanced AI Capabilities
              </Badge>
            </div>
            <Button size="lg" onClick={() => navigate('/auth')} className="px-8 py-4 text-lg">
              <Play className="h-5 w-5 mr-2" />
              Start Your AI Interview
            </Button>
          </div>
        </section>

        {/* Key Features Section */}
        <section className="py-20 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-foreground mb-4">
                ✨ Key Features That Set Us Apart
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Experience unparalleled interview preparation with our comprehensive feature set
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <Card key={index} className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  <CardHeader>
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 bg-muted rounded-lg group-hover:scale-110 transition-transform">
                        {feature.icon}
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="mb-4">
                      {feature.description}
                    </CardDescription>
                    <div className="space-y-2">
                      {feature.highlights.map((highlight, idx) => (
                        <div key={idx} className="flex items-center space-x-2 text-sm">
                          <CheckCircle className="h-3 w-3 text-green-500" />
                          <span>{highlight}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Interview Stages Breakdown */}
        <section className="py-20 bg-muted/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-foreground mb-4">
                🎪 Interview Stages Breakdown
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Navigate through our comprehensive 7-stage interview process designed to evaluate every aspect of your skills
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {interviewStages.map((stage, index) => (
                <Card key={index} className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-primary/20 to-primary/10 rounded-bl-3xl flex items-center justify-center">
                    <span className="text-sm font-bold text-primary">{stage.stage}</span>
                  </div>
                  <CardHeader className="pb-4">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                        {stage.icon}
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-lg">{stage.title}</CardTitle>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="mb-4 text-base">
                      {stage.description}
                    </CardDescription>
                    <div className="space-y-2">
                      {stage.features.map((feature, idx) => (
                        <div key={idx} className="flex items-center space-x-2 text-sm">
                          <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Progress Visualization */}
            <div className="mt-16 bg-background rounded-2xl p-8 shadow-lg">
              <h3 className="text-2xl font-bold text-center mb-8">Interview Progress Flow</h3>
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium">Stage Progress</span>
                <span className="text-sm text-muted-foreground">6 of 6 stages</span>
              </div>
              <Progress value={100} className="h-3 mb-6" />
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {interviewStages.map((stage, index) => (
                  <div key={index} className="text-center">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
                      {stage.icon}
                    </div>
                    <p className="text-xs font-medium">{stage.title}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Interactive Collaborative Workspace */}
        <section className="py-20 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-foreground mb-4">
                💻 Interactive Collaborative Workspace
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Experience a shared digital workspace that simulates real-world interview scenarios - just like using pen and paper or whiteboards in traditional interviews
              </p>
            </div>

            {/* Key Concept Clarification */}
            <div className="mb-16 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 rounded-2xl p-8 border border-amber-200 dark:border-amber-800">
              <div className="text-center mb-6">
                <div className="p-3 bg-amber-500/10 rounded-lg mx-auto w-fit mb-4">
                  <Lightbulb className="h-8 w-8 text-amber-500" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-2">Not Traditional Development Tools</h3>
                <p className="text-lg text-muted-foreground">These are collaborative interview workspaces, not standalone code compilers or IDEs</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-6">
                  <h4 className="font-semibold text-green-600 mb-3 flex items-center">
                    <CheckCircle className="h-5 w-5 mr-2" />
                    What This IS
                  </h4>
                  <ul className="space-y-2 text-sm">
                    <li>• Shared digital whiteboard for problem-solving</li>
                    <li>• AI-human collaborative workspace</li>
                    <li>• Interview simulation environment</li>
                    <li>• Logic building and communication platform</li>
                    <li>• Real-time analysis and feedback system</li>
                  </ul>
                </div>
                <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-6">
                  <h4 className="font-semibold text-red-600 mb-3 flex items-center">
                    <Target className="h-5 w-5 mr-2" />
                    What This is NOT
                  </h4>
                  <ul className="space-y-2 text-sm">
                    <li>• Traditional code execution environment</li>
                    <li>• Standalone development IDE</li>
                    <li>• Code compilation and testing platform</li>
                    <li>• Independent programming workspace</li>
                    <li>• Production development environment</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
              {/* Shared Digital Whiteboard */}
              <Card className="p-8 hover:shadow-lg transition-shadow">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="p-3 bg-blue-500/10 rounded-lg">
                    <FileText className="h-8 w-8 text-blue-500" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">Shared Digital Whiteboard</h3>
                    <p className="text-muted-foreground">Interactive workspace for problem-solving communication</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">AI-Human Interaction: AI poses questions, you provide explanations and solutions</span>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Real-time AI Analysis: Your responses are analyzed for intelligent follow-ups</span>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Thought Process Documentation: Write pseudocode, diagrams, and explanations</span>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Interview Simulation: Mimics pen-and-paper problem-solving scenarios</span>
                  </div>
                </div>
              </Card>

              {/* Collaborative Code Workspace */}
              <Card className="p-8 hover:shadow-lg transition-shadow">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="p-3 bg-green-500/10 rounded-lg">
                    <Code className="h-8 w-8 text-green-500" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">Collaborative Code Workspace</h3>
                    <p className="text-muted-foreground">Shared coding environment for interview problem-solving</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Interactive Problem Solving: AI presents coding challenges, you demonstrate solutions</span>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Logic Building Focus: Emphasizes algorithmic thinking and code structure over execution</span>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Dynamic AI Feedback: AI analyzes your approach and asks clarifying questions</span>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Technical Communication: Practice explaining complex concepts and code logic</span>
                  </div>
                </div>
              </Card>
            </div>

            {/* Interview Experience Features */}
            <Card className="p-8 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950/20 dark:to-indigo-950/20">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold mb-4">Real-World Interview Simulation</h3>
                <p className="text-muted-foreground">Experience authentic interview scenarios with intelligent AI interaction</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="text-center p-4">
                  <div className="p-3 bg-red-500/10 rounded-lg mx-auto w-fit mb-3">
                    <Brain className="h-6 w-6 text-red-500" />
                  </div>
                  <h4 className="font-semibold mb-2">Continuous AI Analysis</h4>
                  <p className="text-sm text-muted-foreground">Every input is analyzed in real-time for intelligent responses</p>
                </div>
                <div className="text-center p-4">
                  <div className="p-3 bg-yellow-500/10 rounded-lg mx-auto w-fit mb-3">
                    <MessageSquare className="h-6 w-6 text-yellow-500" />
                  </div>
                  <h4 className="font-semibold mb-2">Dynamic Questioning</h4>
                  <p className="text-sm text-muted-foreground">AI generates contextual follow-up questions based on your responses</p>
                </div>
                <div className="text-center p-4">
                  <div className="p-3 bg-indigo-500/10 rounded-lg mx-auto w-fit mb-3">
                    <Lightbulb className="h-6 w-6 text-indigo-500" />
                  </div>
                  <h4 className="font-semibold mb-2">Problem-Solving Focus</h4>
                  <p className="text-sm text-muted-foreground">Emphasizes logical thinking and solution approach over code execution</p>
                </div>
                <div className="text-center p-4">
                  <div className="p-3 bg-green-600/10 rounded-lg mx-auto w-fit mb-3">
                    <Users className="h-6 w-6 text-green-600" />
                  </div>
                  <h4 className="font-semibold mb-2">Interactive Collaboration</h4>
                  <p className="text-sm text-muted-foreground">Shared workspace mimics real interview whiteboard sessions</p>
                </div>
              </div>
            </Card>
          </div>
        </section>

        {/* Performance Analytics Dashboard */}
        <section className="py-20 bg-muted/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-foreground mb-4">
                📈 Performance Analytics Dashboard
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Comprehensive assessment and detailed insights across all performance dimensions
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
              {/* Technical Assessment */}
              <Card className="p-8 hover:shadow-lg transition-shadow">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="p-3 bg-blue-500/10 rounded-lg">
                    <Code className="h-8 w-8 text-blue-500" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">Technical Assessment</h3>
                    <p className="text-muted-foreground">Code quality and technical skills evaluation</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <span className="text-sm font-medium">Code Quality Score</span>
                    <div className="flex items-center space-x-2">
                      <Progress value={85} className="w-20 h-2" />
                      <span className="text-sm font-bold">85%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <span className="text-sm font-medium">Problem-Solving Approach</span>
                    <div className="flex items-center space-x-2">
                      <Progress value={92} className="w-20 h-2" />
                      <span className="text-sm font-bold">92%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <span className="text-sm font-medium">Algorithm Efficiency</span>
                    <div className="flex items-center space-x-2">
                      <Progress value={78} className="w-20 h-2" />
                      <span className="text-sm font-bold">78%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <span className="text-sm font-medium">Testing & Debugging</span>
                    <div className="flex items-center space-x-2">
                      <Progress value={88} className="w-20 h-2" />
                      <span className="text-sm font-bold">88%</span>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Communication & Collaboration */}
              <Card className="p-8 hover:shadow-lg transition-shadow">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="p-3 bg-green-500/10 rounded-lg">
                    <MessageSquare className="h-8 w-8 text-green-500" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">Communication & Collaboration</h3>
                    <p className="text-muted-foreground">Soft skills and teamwork evaluation</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <span className="text-sm font-medium">Explanation Clarity</span>
                    <div className="flex items-center space-x-2">
                      <Progress value={90} className="w-20 h-2" />
                      <span className="text-sm font-bold">90%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <span className="text-sm font-medium">Collaboration Skills</span>
                    <div className="flex items-center space-x-2">
                      <Progress value={87} className="w-20 h-2" />
                      <span className="text-sm font-bold">87%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <span className="text-sm font-medium">Question Handling</span>
                    <div className="flex items-center space-x-2">
                      <Progress value={83} className="w-20 h-2" />
                      <span className="text-sm font-bold">83%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <span className="text-sm font-medium">Time Management</span>
                    <div className="flex items-center space-x-2">
                      <Progress value={91} className="w-20 h-2" />
                      <span className="text-sm font-bold">91%</span>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Comprehensive Reporting */}
            <Card className="p-8 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold mb-4">Comprehensive Reporting</h3>
                <p className="text-muted-foreground">Detailed insights and personalized recommendations</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="text-center p-4">
                  <div className="p-3 bg-green-500/10 rounded-lg mx-auto w-fit mb-3">
                    <Award className="h-6 w-6 text-green-500" />
                  </div>
                  <h4 className="font-semibold mb-2">Overall Grade</h4>
                  <p className="text-sm text-muted-foreground">A+ to F rating across all assessment areas</p>
                </div>
                <div className="text-center p-4">
                  <div className="p-3 bg-blue-500/10 rounded-lg mx-auto w-fit mb-3">
                    <BarChart3 className="h-6 w-6 text-blue-500" />
                  </div>
                  <h4 className="font-semibold mb-2">Detailed Breakdown</h4>
                  <p className="text-sm text-muted-foreground">Performance metrics for each interview stage</p>
                </div>
                <div className="text-center p-4">
                  <div className="p-3 bg-purple-500/10 rounded-lg mx-auto w-fit mb-3">
                    <Code className="h-6 w-6 text-purple-500" />
                  </div>
                  <h4 className="font-semibold mb-2">Code Portfolio</h4>
                  <p className="text-sm text-muted-foreground">Save and showcase your best interview solutions</p>
                </div>
                <div className="text-center p-4">
                  <div className="p-3 bg-orange-500/10 rounded-lg mx-auto w-fit mb-3">
                    <Target className="h-6 w-6 text-orange-500" />
                  </div>
                  <h4 className="font-semibold mb-2">Improvement Roadmap</h4>
                  <p className="text-sm text-muted-foreground">Personalized learning path recommendations</p>
                </div>
              </div>
            </Card>
          </div>
        </section>

        {/* Perfect For Section */}
        <section className="py-20 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-foreground mb-4">
                🎯 Perfect For
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Designed for professionals, students, and organizations seeking excellence in technical interviews
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Software Developers */}
              <Card className="p-8 hover:shadow-lg transition-shadow">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="p-3 bg-blue-500/10 rounded-lg">
                    <Code className="h-8 w-8 text-blue-500" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">Software Developers</h3>
                    <p className="text-muted-foreground">Enhance your interview skills</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Practice coding interviews with real-time feedback</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Improve problem-solving speed and accuracy</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Build confidence in technical communication</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Create a portfolio of interview solutions</span>
                  </div>
                </div>
              </Card>

              {/* Technical Recruiters */}
              <Card className="p-8 hover:shadow-lg transition-shadow">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="p-3 bg-green-500/10 rounded-lg">
                    <Users className="h-8 w-8 text-green-500" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">Technical Recruiters</h3>
                    <p className="text-muted-foreground">Streamline your hiring process</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Conduct standardized technical assessments</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Evaluate candidates' coding skills objectively</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Generate comprehensive technical reports</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Streamline the technical screening process</span>
                  </div>
                </div>
              </Card>

              {/* Coding Bootcamps & Universities */}
              <Card className="p-8 hover:shadow-lg transition-shadow">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="p-3 bg-purple-500/10 rounded-lg">
                    <Trophy className="h-8 w-8 text-purple-500" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">Coding Bootcamps & Universities</h3>
                    <p className="text-muted-foreground">Prepare students for success</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Prepare students for technical interviews</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Provide hands-on coding practice</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Track student progress in real-time</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Simulate real-world interview scenarios</span>
                  </div>
                </div>
              </Card>

              {/* Engineering Teams */}
              <Card className="p-8 hover:shadow-lg transition-shadow">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="p-3 bg-orange-500/10 rounded-lg">
                    <Settings className="h-8 w-8 text-orange-500" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">Engineering Teams</h3>
                    <p className="text-muted-foreground">Internal assessment and growth</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Assess internal candidates for promotions</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Standardize technical evaluation processes</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Identify skill gaps and training needs</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Conduct pair programming sessions</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </section>

        {/* Why Choose Our AI Interviewer */}
        <section className="py-20 bg-muted/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-foreground mb-4">
                🌟 Why Choose Our AI Interviewer?
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Experience the most comprehensive and intelligent interview preparation platform available
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card className="p-8 hover:shadow-lg transition-shadow">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="p-3 bg-blue-500/10 rounded-lg">
                    <Monitor className="h-8 w-8 text-blue-500" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">Complete Interview Simulation</h3>
                  </div>
                </div>
                <p className="text-muted-foreground">
                  Experience real interview conditions with live coding, collaborative editing, and technical discussions - just like you'd encounter at top tech companies.
                </p>
              </Card>

              <Card className="p-8 hover:shadow-lg transition-shadow">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="p-3 bg-green-500/10 rounded-lg">
                    <Brain className="h-8 w-8 text-green-500" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">Intelligent Code Analysis</h3>
                  </div>
                </div>
                <p className="text-muted-foreground">
                  Our AI doesn't just check if your code works - it evaluates efficiency, readability, best practices, and provides constructive feedback for improvement.
                </p>
              </Card>

              <Card className="p-8 hover:shadow-lg transition-shadow">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="p-3 bg-purple-500/10 rounded-lg">
                    <Users className="h-8 w-8 text-purple-500" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">Real-Time Collaboration</h3>
                  </div>
                </div>
                <p className="text-muted-foreground">
                  Practice the collaborative aspects of modern software development with live editing, code review, and pair programming scenarios.
                </p>
              </Card>

              <Card className="p-8 hover:shadow-lg transition-shadow">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="p-3 bg-orange-500/10 rounded-lg">
                    <Star className="h-8 w-8 text-orange-500" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">Comprehensive Skill Assessment</h3>
                  </div>
                </div>
                <p className="text-muted-foreground">
                  Go beyond algorithmic challenges - demonstrate your ability to write production-quality code, explain technical concepts, and work effectively with others.
                </p>
              </Card>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="flex justify-center mb-8">
              <div className="p-4 bg-white/20 rounded-full">
                <Rocket className="h-12 w-12 text-white" />
              </div>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              🚀 Ready to Ace Your Next Technical Interview?
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto">
              Join thousands of developers who have already mastered their interview skills using our AI-powered platform. Practice coding challenges, improve your technical communication, and build confidence for your dream job.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button size="lg" onClick={() => navigate('/auth')} className="px-8 py-4 text-lg bg-white text-blue-600 hover:bg-gray-100">
                <Play className="h-5 w-5 mr-2" />
                Start Your AI Interview
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate('/')} className="px-8 py-4 text-lg border-white text-white hover:bg-white hover:text-blue-600 bg-white/10">
                Learn More
              </Button>
            </div>
            <p className="text-white/80 mt-6 text-lg font-medium">
              Start coding your way to success - where intelligent assessment meets real-world development skills.
            </p>
          </div>
        </section>

        {/* Animated Footer */}
        <AnimatedFooter />
      </div>
    );
  }

  // Authenticated user view
  return (
    <AuthenticatedLayout>
      <div className="py-20 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950/20 dark:via-indigo-950/20 dark:to-purple-950/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex justify-center mb-8">
            <div className="p-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full">
              <Users className="h-12 w-12 text-white" />
            </div>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-6">
            AI Interviewer
          </h1>
          <p className="text-2xl md:text-3xl font-semibold text-gray-700 dark:text-gray-300 mb-4">
            Revolutionary Interview Experience
          </p>
          <p className="text-xl text-muted-foreground mb-8 max-w-4xl mx-auto">
            Welcome back! Ready to practice your interview skills with our AI-powered platform? Start a new session or continue where you left off.
          </p>
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            <Badge variant="secondary" className="px-4 py-2 text-sm">
              <Zap className="h-4 w-4 mr-2" />
              7 Comprehensive Stages
            </Badge>
            <Badge variant="secondary" className="px-4 py-2 text-sm">
              <Code className="h-4 w-4 mr-2" />
              Real-time Collaboration
            </Badge>
            <Badge variant="secondary" className="px-4 py-2 text-sm">
              <Brain className="h-4 w-4 mr-2" />
              Advanced AI Capabilities
            </Badge>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button size="lg" className="px-8 py-4 text-lg">
              <Play className="h-5 w-5 mr-2" />
              Start New Interview
            </Button>
            <Button size="lg" variant="outline" className="px-8 py-4 text-lg">
              <BarChart3 className="h-5 w-5 mr-2" />
              View Past Sessions
            </Button>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
};

export default AIInterviewer;
