
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, X } from 'lucide-react';

interface McqOptionsSectionProps {
  formData: any;
  setFormData: (data: any) => void;
}

const McqOptionsSection: React.FC<McqOptionsSectionProps> = ({ formData, setFormData }) => {
  const updateOption = (index: number, value: string) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    setFormData({ ...formData, options: newOptions });
  };

  const addOption = () => {
    setFormData({ ...formData, options: [...formData.options, ''] });
  };

  const removeOption = (index: number) => {
    const newOptions = formData.options.filter((_: any, i: number) => i !== index);
    setFormData({ ...formData, options: newOptions });
  };

  if (formData.question_type !== 'mcq') return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Answer Options</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {formData.options.map((option: string, index: number) => (
          <div key={index} className="flex gap-2">
            <Input
              value={option}
              onChange={(e) => updateOption(index, e.target.value)}
              placeholder={`Option ${index + 1}`}
            />
            {formData.options.length > 2 && (
              <Button type="button" variant="outline" size="sm" onClick={() => removeOption(index)}>
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        ))}
        <Button type="button" variant="outline" onClick={addOption}>
          <Plus className="h-4 w-4 mr-2" />
          Add Option
        </Button>
      </CardContent>
    </Card>
  );
};

export default McqOptionsSection;
