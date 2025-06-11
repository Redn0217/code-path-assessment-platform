
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DOMAINS } from './AssessmentConfigUtils';

interface AssessmentConfigFormProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  formData: any;
  setFormData: (data: any) => void;
  editingConfig: any;
  onSubmit: (e: React.FormEvent) => void;
  isPending: boolean;
}

const AssessmentConfigForm: React.FC<AssessmentConfigFormProps> = ({
  isOpen,
  onOpenChange,
  formData,
  setFormData,
  editingConfig,
  onSubmit,
  isPending,
}) => {
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
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {editingConfig ? 'Edit Configuration' : 'Add Assessment Configuration'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
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
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Saving...' : (editingConfig ? 'Update' : 'Create')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AssessmentConfigForm;
