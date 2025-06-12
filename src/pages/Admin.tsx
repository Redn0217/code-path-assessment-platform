
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Target, Dumbbell, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import QuestionManager from '@/components/admin/QuestionManager';
import AssessmentConfigs from '@/components/admin/AssessmentConfigs';
import AdminStats from '@/components/admin/AdminStats';
import UserManagement from '@/components/admin/UserManagement';
import PracticeHubAdmin from '@/components/admin/PracticeHubAdmin';
import MasteryAssessmentsAdmin from '@/components/admin/MasteryAssessmentsAdmin';
import { useToast } from '@/hooks/use-toast';

const Admin = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('practice-hub');
  const [selectedModule, setSelectedModule] = useState(null);
  const [moduleManagementTab, setModuleManagementTab] = useState('questions');

  // Check if user is admin
  const { data: isAdmin, isLoading } = useQuery({
    queryKey: ['isAdmin'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;
      
      const { data } = await supabase
        .from('admin_users')
        .select('id')
        .eq('user_id', user.id)
        .single();
      
      return !!data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Access Denied</CardTitle>
          </CardHeader>
          <CardContent>
            <p>You don't have permission to access the admin panel.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If a module is selected, show module-specific management
  if (selectedModule) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  onClick={() => setSelectedModule(null)}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Practice Hub
                </Button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{selectedModule.name}</h1>
                  <p className="text-gray-600">{selectedModule.description}</p>
                </div>
              </div>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                Module Management
              </Badge>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8">
          <Tabs value={moduleManagementTab} onValueChange={setModuleManagementTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="questions" className="flex items-center gap-2">
                Questions
              </TabsTrigger>
              <TabsTrigger value="config" className="flex items-center gap-2">
                Assessment Config
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center gap-2">
                Analytics
              </TabsTrigger>
            </TabsList>

            <TabsContent value="questions" className="mt-6">
              <QuestionManager selectedModule={selectedModule} />
            </TabsContent>

            <TabsContent value="config" className="mt-6">
              <AssessmentConfigs selectedModule={selectedModule} />
            </TabsContent>

            <TabsContent value="analytics" className="mt-6">
              <AdminStats selectedModule={selectedModule} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    );
  }

  // Default admin panel
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              Administrator
            </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="practice-hub" className="flex items-center gap-2">
              <Dumbbell className="h-4 w-4" />
              Practice Hub
            </TabsTrigger>
            <TabsTrigger value="mastery-assessments" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Mastery Assessments
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Users
            </TabsTrigger>
          </TabsList>

          <TabsContent value="practice-hub" className="mt-6">
            <PracticeHubAdmin onModuleSelect={setSelectedModule} />
          </TabsContent>

          <TabsContent value="mastery-assessments" className="mt-6">
            <MasteryAssessmentsAdmin />
          </TabsContent>

          <TabsContent value="users" className="mt-6">
            <UserManagement />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
