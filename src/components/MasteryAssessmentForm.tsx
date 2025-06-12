
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const availableDomains = [
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

interface MasteryAssessmentFormProps {
  assessment?: any;
  onClose: () => void;
}

const MasteryAssessmentForm: React.FC<MasteryAssessmentFormProps> = ({ assessment, onClose }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    difficulty: 'intermediate',
    domains: [] as string[],
    total_questions: 50,
    time_limit_minutes: 90,
    is_active: true,
    order_index: 0
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (assessment) {
      setFormData({
        title: assessment.title || '',
        description: assessment.description || '',
        difficulty: assessment.difficulty || 'intermediate',
        domains: Array.isArray(assessment.domains) ? assessment.domains : [],
        total_questions: assessment.total_questions || 50,
        time_limit_minutes: assessment.time_limit_minutes || 90,
        is_active: assessment.is_active ?? true,
        order_index: assessment.order_index || 0
      });
    }
  }, [assessment]);

  const handleDomainToggle = (domainId: string) => {
    setFormData(prev => ({
      ...prev,
      domains: prev.domains.includes(domainId)
        ? prev.domains.filter(id => id !== domainId)
        : [...prev.domains, domainId]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const dataToSubmit = {
        ...formData,
        domains: JSON.stringify(formData.domains),
        created_by: user?.id,
        updated_at: new Date().toISOString()
      };

      if (assessment) {
        // Update existing assessment
        const { error } = await supabase
          .from('mastery_assessments')
          .update(dataToSubmit)
          .eq('id', assessment.id);
        
        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Mastery assessment updated successfully",
        });
      } else {
        // Create new assessment
        const { error } = await supabase
          .from('mastery_assessments')
          .insert(dataToSubmit);
        
        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Mastery assessment created successfully",
        });
      }
      
      onClose();
    } catch (error) {
      console.error('Error saving assessment:', error);
      toast({
        title: "Error",
        description: "Failed to save mastery assessment",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{assessment ? 'Edit Mastery Assessment' : 'Add Mastery Assessment'}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="difficulty">Difficulty</Label>
            <Select value={formData.difficulty} onValueChange={(value) => setFormData({ ...formData, difficulty: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Included Domains</Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {availableDomains.map((domain) => (
                <div key={domain.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={domain.id}
                    checked={formData.domains.includes(domain.id)}
                    onCheckedChange={() => handleDomainToggle(domain.id)}
                  />
                  <Label htmlFor={domain.id} className="text-sm">
                    {domain.name}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="total_questions">Total Questions</Label>
              <Input
                id="total_questions"
                type="number"
                value={formData.total_questions}
                onChange={(e) => setFormData({ ...formData, total_questions: parseInt(e.target.value) || 50 })}
                required
              />
            </div>

            <div>
              <Label htmlFor="time_limit_minutes">Time Limit (minutes)</Label>
              <Input
                id="time_limit_minutes"
                type="number"
                value={formData.time_limit_minutes}
                onChange={(e) => setFormData({ ...formData, time_limit_minutes: parseInt(e.target.value) || 90 })}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="order_index">Order</Label>
            <Input
              id="order_index"
              type="number"
              value={formData.order_index}
              onChange={(e) => setFormData({ ...formData, order_index: parseInt(e.target.value) || 0 })}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : (assessment ? 'Update' : 'Create')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default MasteryAssessmentForm;
