
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface BasicQuestionFieldsProps {
  formData: any;
  setFormData: (data: any) => void;
  availableDomains?: string[];
}

const BasicQuestionFields: React.FC<BasicQuestionFieldsProps> = ({ 
  formData, 
  setFormData, 
  availableDomains 
}) => {
  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="question_type">Question Type *</Label>
          <Select value={formData.question_type} onValueChange={(value) => setFormData({ ...formData, question_type: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="mcq">Multiple Choice</SelectItem>
              <SelectItem value="coding">Coding Challenge</SelectItem>
              <SelectItem value="scenario">Scenario Based</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="difficulty">Difficulty *</Label>
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
      </div>

      {availableDomains && availableDomains.length > 0 && (
        <div>
          <Label htmlFor="domain">Domain *</Label>
          <Select value={formData.domain} onValueChange={(value) => setFormData({ ...formData, domain: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select a domain" />
            </SelectTrigger>
            <SelectContent>
              {availableDomains.map((domain) => (
                <SelectItem key={domain} value={domain}>
                  {domain}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div>
        <Label htmlFor="title">Title *</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="Question title"
        />
      </div>

      <div>
        <Label htmlFor="question_text">Question Text *</Label>
        <Textarea
          id="question_text"
          value={formData.question_text}
          onChange={(e) => setFormData({ ...formData, question_text: e.target.value })}
          placeholder="Enter the question text"
          rows={4}
        />
      </div>
    </>
  );
};

export default BasicQuestionFields;
