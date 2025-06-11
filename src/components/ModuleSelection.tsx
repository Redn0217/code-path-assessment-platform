
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Play } from 'lucide-react';

interface Module {
  id: string;
  name: string;
  description: string;
  domain: string;
  icon: string;
  color: string;
  is_active: boolean;
  order_index: number;
}

interface ModuleSelectionProps {
  domain: string;
  domainInfo: { name: string; color: string };
  onModuleSelect: (module: Module) => void;
  onBack: () => void;
}

const ModuleSelection = ({ domain, domainInfo, onModuleSelect, onBack }: ModuleSelectionProps) => {
  // Fetch modules for the selected domain
  const { data: modules = [], isLoading, error } = useQuery({
    queryKey: ['modules', domain],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('modules')
        .select('*')
        .eq('domain', domain)
        .eq('is_active', true)
        .order('order_index', { ascending: true });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!domain,
  });

  // Fetch question count for each module
  const { data: questionCounts } = useQuery({
    queryKey: ['module-question-counts', domain],
    queryFn: async () => {
      const counts: Record<string, number> = {};
      
      for (const module of modules) {
        const { count, error } = await supabase
          .from('questions')
          .select('*', { count: 'exact', head: true })
          .eq('module_id', module.id);
        
        if (!error) {
          counts[module.id] = count || 0;
        }
      }
      
      return counts;
    },
    enabled: modules.length > 0,
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Error loading modules</h1>
          <p className="text-gray-600 mb-6">There was an error loading the modules.</p>
          <Button onClick={onBack}>Back to Domains</Button>
        </div>
      </div>
    );
  }

  if (modules.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Button
            variant="ghost"
            onClick={onBack}
            className="mb-6 flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Domains</span>
          </Button>

          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">No Modules Available</h1>
            <p className="text-gray-600 mb-6">
              No modules are currently available for {domainInfo.name}. Check back soon!
            </p>
            <Button onClick={onBack}>Back to Domains</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <Button
          variant="ghost"
          onClick={onBack}
          className="mb-6 flex items-center space-x-2"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Domains</span>
        </Button>

        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className={`p-3 rounded-lg ${domainInfo.color}`}>
              <div className="h-6 w-6 bg-white rounded"></div>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{domainInfo.name} Modules</h1>
              <p className="text-gray-600">Choose a module to start your assessment</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modules.map((module) => {
            const questionCount = questionCounts?.[module.id] || 0;
            
            return (
              <Card key={module.id} className="hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <div className="flex items-center space-x-3 mb-2">
                    <div className={`p-3 rounded-lg ${module.color}`}>
                      <div className="h-6 w-6 bg-white rounded"></div>
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg">{module.name}</CardTitle>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant="secondary">{questionCount} Questions</Badge>
                        {questionCount === 0 && (
                          <Badge variant="outline" className="text-orange-600 border-orange-200">
                            Coming Soon
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm text-gray-600 mb-4">
                    {module.description || 'No description available'}
                  </CardDescription>
                  
                  <Button 
                    className="w-full"
                    onClick={() => onModuleSelect(module)}
                    disabled={questionCount === 0}
                  >
                    <Play className="h-4 w-4 mr-2" />
                    {questionCount === 0 ? 'No Questions Available' : 'Start Assessment'}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ModuleSelection;
