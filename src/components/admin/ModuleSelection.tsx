
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { ChevronRight } from 'lucide-react';

const domains = [
  { id: 'python', name: 'Python' },
  { id: 'devops', name: 'DevOps' },
  { id: 'cloud', name: 'Cloud Computing' },
  { id: 'linux', name: 'Linux' },
  { id: 'networking', name: 'Networking' },
  { id: 'storage', name: 'Storage' },
  { id: 'virtualization', name: 'Virtualization' },
  { id: 'object-storage', name: 'Object Storage' },
  { id: 'ai-ml', name: 'AI & ML' },
  { id: 'data-security', name: 'Data Security' },
  { id: 'data-science', name: 'Data Science' }
];

interface ModuleSelectionProps {
  onModuleSelect: (module: any) => void;
}

const ModuleSelection: React.FC<ModuleSelectionProps> = ({ onModuleSelect }) => {
  const [selectedDomain, setSelectedDomain] = useState('python');

  const { data: modules = [], isLoading } = useQuery({
    queryKey: ['admin-modules', selectedDomain],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('modules')
        .select('*')
        .eq('domain', selectedDomain)
        .order('order_index', { ascending: true });
      
      if (error) throw error;
      return data || [];
    },
  });

  if (isLoading) {
    return <div className="flex justify-center p-8">Loading modules...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Select Module to Manage</CardTitle>
          <p className="text-sm text-gray-600">
            Choose a module to manage its questions, assessment configuration, and view analytics.
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <Label>Filter by Domain:</Label>
              <Select value={selectedDomain} onValueChange={setSelectedDomain}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {domains.map((domain) => (
                    <SelectItem key={domain.id} value={domain.id}>
                      {domain.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {modules.map((module) => (
                <Card key={module.id} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${module.color}`}>
                        <div className="h-4 w-4 bg-white rounded"></div>
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-lg">{module.name}</CardTitle>
                        <Badge variant={module.is_active ? "default" : "secondary"} className="mt-1">
                          {module.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-3">
                      {module.description || 'No description'}
                    </p>
                    <Button 
                      onClick={() => onModuleSelect(module)}
                      className="w-full"
                      size="sm"
                    >
                      Manage Module
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {modules.length === 0 && (
              <Card>
                <CardContent className="text-center py-8">
                  <p className="text-gray-500">No modules found for {selectedDomain}.</p>
                  <p className="text-sm text-gray-400 mt-2">Create modules first in the Modules tab.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ModuleSelection;
