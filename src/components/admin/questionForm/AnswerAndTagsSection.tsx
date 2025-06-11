
import React from 'react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';

interface AnswerAndTagsSectionProps {
  formData: any;
  setFormData: (data: any) => void;
  newTag: string;
  setNewTag: (tag: string) => void;
}

const AnswerAndTagsSection: React.FC<AnswerAndTagsSectionProps> = ({ 
  formData, 
  setFormData, 
  newTag, 
  setNewTag 
}) => {
  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData({ ...formData, tags: [...formData.tags, newTag.trim()] });
      setNewTag('');
    }
  };

  const removeTag = (tag: string) => {
    setFormData({ ...formData, tags: formData.tags.filter((t: string) => t !== tag) });
  };

  return (
    <>
      <div>
        <Label htmlFor="correct_answer">Correct Answer *</Label>
        <Textarea
          id="correct_answer"
          value={formData.correct_answer}
          onChange={(e) => setFormData({ ...formData, correct_answer: e.target.value })}
          placeholder="Enter the correct answer"
          rows={3}
        />
      </div>

      <div>
        <Label htmlFor="explanation">Explanation</Label>
        <Textarea
          id="explanation"
          value={formData.explanation}
          onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
          placeholder="Explain why this is the correct answer"
          rows={3}
        />
      </div>

      <div>
        <Label>Tags</Label>
        <div className="flex gap-2 mb-2 flex-wrap">
          {formData.tags.map((tag: string) => (
            <Badge key={tag} variant="secondary" className="cursor-pointer" onClick={() => removeTag(tag)}>
              {tag} <X className="h-3 w-3 ml-1" />
            </Badge>
          ))}
        </div>
        <div className="flex gap-2">
          <Input
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            placeholder="Add a tag"
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
          />
          <Button type="button" variant="outline" onClick={addTag}>
            Add
          </Button>
        </div>
      </div>
    </>
  );
};

export default AnswerAndTagsSection;
