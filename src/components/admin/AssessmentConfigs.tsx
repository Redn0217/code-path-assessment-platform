import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, BarChart } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const DOMAINS = [
  'python', 'devops', 'cloud', 'linux', 'networking', 
  'storage', 'virtualization', 'object-storage', 'ai-ml'
];

const AssessmentConfigs = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingConfig, setEditingConfig] = useState(null);
  
  const [formData, setFormData] = useState({
    domain: '',
    mcq_count: 10,
    coding_count: 5,
    scenario_count: 5,
    total_time_minutes: 60,
    difficulty_distribution: {
      beginner: 40,
      intermediate: 40,
      advanced: 20
    }
  });

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
    setFormData({
      domain: '',
      mcq_count: 10,
      coding_count: 5,
      scenario_count: 5,
      total_time_minutes: 60,
      difficulty_distribution: {
        beginner: 40,
        intermediate: 40,
        advanced: 20
      }
    });
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

    const total = formData.difficulty_distribution.beginner + 
                  formData.difficulty_distribution.intermediate + 
                  formData.difficulty_distribution.advanced;
    
    if (total !== 100) {
      toast({ title: 'Difficulty distribution must sum to 100%', variant: 'destructive' });
      return;
    }

    saveConfig.mutate(formData);
  };

  const updateDifficultyDistribution = (level: string, value: number) => {
    setFormData({
      ...formData,
      difficulty_distribution: {
        ...formData.difficulty_distribution,
        [level]: value
      }
    });
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
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>
                    {editingConfig ? 'Edit Configuration' : 'Add Assessment Configuration'}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label>Domain</Label>
                    <Select 
                      value={formData.domain} 
                      onValueChange={(value) => setFormData({ ...formData, domain: value })}
                      disabled={!!editingConfig}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select domain" />
                      </SelectTrigger>
                      <SelectContent>
                        {DOMAINS.map(domain => (
                          <SelectItem key={domain} value={domain}>
                            {domain.charAt(0).toUpperCase() + domain.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label>MCQ Count</Label>
                      <Input
                        type="number"
                        value={formData.mcq_count}
                        onChange={(e) => setFormData({ ...formData, mcq_count: parseInt(e.target.value) || 0 })}
                        min="0"
                      />
                    </div>
                    <div>
                      <Label>Coding Count</Label>
                      <Input
                        type="number"
                        value={formData.coding_count}
                        onChange={(e) => setFormData({ ...formData, coding_count: parseInt(e.target.value) || 0 })}
                        min="0"
                      />
                    </div>
                    <div>
                      <Label>Scenario Count</Label>
                      <Input
                        type="number"
                        value={formData.scenario_count}
                        onChange={(e) => setFormData({ ...formData, scenario_count: parseInt(e.target.value) || 0 })}
                        min="0"
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Total Time (minutes)</Label>
                    <Input
                      type="number"
                      value={formData.total_time_minutes}
                      onChange={(e) => setFormData({ ...formData, total_time_minutes: parseInt(e.target.value) || 60 })}
                      min="1"
                    />
                  </div>

                  <div>
                    <Label>Difficulty Distribution (%)</Label>
                    <div className="grid grid-cols-3 gap-4 mt-2">
                      <div>
                        <Label className="text-sm">Beginner</Label>
                        <Input
                          type="number"
                          value={formData.difficulty_distribution.beginner}
                          onChange={(e) => updateDifficultyDistribution('beginner', parseInt(e.target.value) || 0)}
                          min="0"
                          max="100"
                        />
                      </div>
                      <div>
                        <Label className="text-sm">Intermediate</Label>
                        <Input
                          type="number"
                          value={formData.difficulty_distribution.intermediate}
                          onChange={(e) => updateDifficultyDistribution('intermediate', parseInt(e.target.value) || 0)}
                          min="0"
                          max="100"
                        />
                      </div>
                      <div>
                        <Label className="text-sm">Advanced</Label>
                        <Input
                          type="number"
                          value={formData.difficulty_distribution.advanced}
                          onChange={(e) => updateDifficultyDistribution('advanced', parseInt(e.target.value) || 0)}
                          min="0"
                          max="100"
                        />
                      </div>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      Total: {formData.difficulty_distribution.beginner + formData.difficulty_distribution.intermediate + formData.difficulty_distribution.advanced}%
                    </p>
                  </div>

                  <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={saveConfig.isPending}>
                      {saveConfig.isPending ? 'Saving...' : (editingConfig ? 'Update' : 'Create')}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Domain</TableHead>
                  <TableHead>MCQ</TableHead>
                  <TableHead>Coding</TableHead>
                  <TableHead>Scenario</TableHead>
                  <TableHead>Time (min)</TableHead>
                  <TableHead>Available Questions</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {configs?.map((config) => {
                  const counts = questionCounts?.[config.domain] || { mcq: 0, coding: 0, scenario: 0, total: 0 };
                  const hasEnoughQuestions = counts.mcq >= config.mcq_count && 
                                           counts.coding >= config.coding_count && 
                                           counts.scenario >= config.scenario_count;
                  
                  return (
                    <TableRow key={config.id}>
                      <TableCell>
                        <Badge variant="outline">{config.domain}</Badge>
                      </TableCell>
                      <TableCell>{config.mcq_count} ({counts.mcq} available)</TableCell>
                      <TableCell>{config.coding_count} ({counts.coding} available)</TableCell>
                      <TableCell>{config.scenario_count} ({counts.scenario} available)</TableCell>
                      <TableCell>{config.total_time_minutes}</TableCell>
                      <TableCell>
                        <Badge variant={hasEnoughQuestions ? "default" : "destructive"}>
                          {hasEnoughQuestions ? "Sufficient" : "Insufficient"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleEdit(config)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AssessmentConfigs;
