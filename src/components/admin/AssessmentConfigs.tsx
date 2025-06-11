
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import AssessmentConfigForm from './AssessmentConfigForm';
import AssessmentConfigTable from './AssessmentConfigTable';
import { getDefaultFormData, validateDifficultyDistribution } from './AssessmentConfigUtils';

const AssessmentConfigs = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingConfig, setEditingConfig] = useState(null);
  const [formData, setFormData] = useState(getDefaultFormData());

  const { data: configs, isLoading } = useQuery({
    queryKey: ['assessment-configs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('assessment_configs')
        .select('*')
        .order('domain');
      if (error) throw error;
      return data;
    },
  });

  const { data: questionCounts } = useQuery({
    queryKey: ['question-counts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('questions')
        .select('domain, question_type, difficulty')
        .order('domain');
      if (error) throw error;
      
      // Group by domain and type
      const counts = {};
      data.forEach(q => {
        if (!counts[q.domain]) counts[q.domain] = { mcq: 0, coding: 0, scenario: 0, total: 0 };
        counts[q.domain][q.question_type]++;
        counts[q.domain].total++;
      });
      
      return counts;
    },
  });

  const saveConfig = useMutation({
    mutationFn: async (data: any) => {
      if (editingConfig) {
        const { error } = await supabase
          .from('assessment_configs')
          .update(data)
          .eq('id', editingConfig.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('assessment_configs')
          .insert([data]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assessment-configs'] });
      toast({ title: `Configuration ${editingConfig ? 'updated' : 'created'} successfully` });
      setIsFormOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast({ 
        title: `Error ${editingConfig ? 'updating' : 'creating'} configuration`, 
        description: error.message,
        variant: 'destructive' 
      });
    },
  });

  const resetForm = () => {
    setFormData(getDefaultFormData());
    setEditingConfig(null);
  };

  const handleEdit = (config: any) => {
    setEditingConfig(config);
    setFormData({
      domain: config.domain,
      mcq_count: config.mcq_count,
      coding_count: config.coding_count,
      scenario_count: config.scenario_count,
      total_time_minutes: config.total_time_minutes,
      difficulty_distribution: config.difficulty_distribution || {
        beginner: 40,
        intermediate: 40,
        advanced: 20
      }
    });
    setIsFormOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.domain) {
      toast({ title: 'Please select a domain', variant: 'destructive' });
      return;
    }

    if (!validateDifficultyDistribution(formData.difficulty_distribution)) {
      toast({ title: 'Difficulty distribution must sum to 100%', variant: 'destructive' });
      return;
    }

    saveConfig.mutate(formData);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Assessment Configurations</CardTitle>
            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetForm}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Configuration
                </Button>
              </DialogTrigger>
              <AssessmentConfigForm
                isOpen={isFormOpen}
                onOpenChange={setIsFormOpen}
                formData={formData}
                setFormData={setFormData}
                editingConfig={editingConfig}
                onSubmit={handleSubmit}
                isPending={saveConfig.isPending}
              />
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <AssessmentConfigTable
            configs={configs}
            questionCounts={questionCounts}
            isLoading={isLoading}
            onEdit={handleEdit}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default AssessmentConfigs;
