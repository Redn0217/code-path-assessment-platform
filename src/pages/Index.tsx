
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Brain, Code, Cloud, Server, Network, Database, Monitor, FileText, Bot, Shield, BarChart3 } from 'lucide-react';
import AuthModal from '@/components/AuthModal';
import AssessmentDashboard from '@/components/AssessmentDashboard';

const domains = [
  {
    id: 'python',
    name: 'Python',
    icon: Code,
    description: 'Test your Python programming skills including OOP, data structures, and libraries',
    color: 'bg-blue-500',
    questions: 50
  },
  {
    id: 'devops',
    name: 'DevOps',
    icon: Server,
    description: 'Evaluate CI/CD, Docker, Kubernetes, and automation knowledge',
    color: 'bg-green-500',
    questions: 50
  },
  {
    id: 'cloud',
    name: 'Cloud Computing',
    icon: Cloud,
    description: 'AWS, Azure, GCP fundamentals and cloud architecture',
    color: 'bg-sky-500',
    questions: 50
  },
  {
    id: 'linux',
    name: 'Linux',
    icon: Monitor,
    description: 'Command line, shell scripting, and system administration',
    color: 'bg-orange-500',
    questions: 50
  },
  {
    id: 'networking',
    name: 'Networking',
    icon: Network,
    description: 'TCP/IP, DNS, routing, and network security concepts',
    color: 'bg-purple-500',
    questions: 50
  },
  {
    id: 'storage',
    name: 'Storage',
    icon: Database,
    description: 'SAN, NAS, RAID, and backup strategies',
    color: 'bg-indigo-500',
    questions: 50
  },
  {
    id: 'virtualization',
    name: 'Virtualization',
    icon: Monitor,
    description: 'Hypervisors, VMs, and resource management',
    color: 'bg-pink-500',
    questions: 50
  },
  {
    id: 'object-storage',
    name: 'Object Storage',
    icon: FileText,
    description: 'S3, versioning, lifecycle policies, and data consistency',
    color: 'bg-cyan-500',
    questions: 50
  },
  {
    id: 'ai-ml',
    name: 'AI & ML',
    icon: Bot,
    description: 'Machine learning models, data preprocessing, and frameworks',
    color: 'bg-red-500',
    questions: 50
  },
  {
    id: 'data-security',
    name: 'Data Security',
    icon: Shield,
    description: 'Encryption, access control, vulnerability assessment, and compliance',
    color: 'bg-emerald-500',
    questions: 50
  },
  {
    id: 'data-science',
    name: 'Data Science',
    icon: BarChart3,
    description: 'Statistics, data analysis, visualization, and research methods',
    color: 'bg-violet-500',
    questions: 50
  }
];

const Index = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [user, setUser] = useState(null);

  const handleLogin = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
    setShowAuthModal(false);
  };

  const handleLogout = () => {
    setUser(null);
    setIsAuthenticated(false);
  };

  if (isAuthenticated) {
    return <AssessmentDashboard user={user} domains={domains} onLogout={handleLogout} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <Brain className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">TechAssess Pro</h1>
            </div>
            <Button 
              onClick={() => setShowAuthModal(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Login / Register
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Comprehensive Technical Assessment Platform
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Evaluate your skills across 9 critical technology domains with interactive coding challenges, 
            detailed reports, and personalized improvement suggestions.
          </p>
          <Button 
            size="lg" 
            onClick={() => setShowAuthModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-3"
          >
            Start Your Assessment
          </Button>
        </div>
      </section>

      {/* Domains Grid */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Assessment Domains
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {domains.map((domain) => {
              const IconComponent = domain.icon;
              return (
                <Card key={domain.id} className="hover:shadow-lg transition-shadow duration-300">
                  <CardHeader>
                    <div className="flex items-center space-x-3">
                      <div className={`p-3 rounded-lg ${domain.color}`}>
                        <IconComponent className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{domain.name}</CardTitle>
                        <Badge variant="secondary">{domain.questions} Questions</Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-sm text-gray-600">
                      {domain.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Platform Features
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Code className="h-8 w-8 text-blue-600" />
              </div>
              <h4 className="text-xl font-semibold mb-2">Interactive Coding</h4>
              <p className="text-gray-600">
                Real-time code execution with instant feedback and test case validation
              </p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="h-8 w-8 text-green-600" />
              </div>
              <h4 className="text-xl font-semibold mb-2">Detailed Reports</h4>
              <p className="text-gray-600">
                Comprehensive assessment reports with performance analytics and insights
              </p>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Brain className="h-8 w-8 text-purple-600" />
              </div>
              <h4 className="text-xl font-semibold mb-2">Smart Suggestions</h4>
              <p className="text-gray-600">
                Personalized learning recommendations based on your performance
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Auth Modal */}
      <AuthModal 
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onLogin={handleLogin}
      />
    </div>
  );
};

export default Index;
