
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Plus, X } from 'lucide-react';
import CodeEditor from '@/components/CodeEditor';

interface CodingSectionProps {
  formData: any;
  setFormData: (data: any) => void;
}

const CodingSection: React.FC<CodingSectionProps> = ({ formData, setFormData }) => {
  const updateTestCase = (index: number, field: string, value: string) => {
    const newTestCases = [...formData.test_cases];
    newTestCases[index] = { ...newTestCases[index], [field]: value };
    setFormData({ ...formData, test_cases: newTestCases });
  };

  const addTestCase = () => {
    setFormData({ 
      ...formData, 
      test_cases: [...formData.test_cases, { input: '', expected_output: '', description: '' }] 
    });
  };

  const removeTestCase = (index: number) => {
    const newTestCases = formData.test_cases.filter((_: any, i: number) => i !== index);
    setFormData({ ...formData, test_cases: newTestCases });
  };

  if (formData.question_type !== 'coding') return null;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Code Template</CardTitle>
        </CardHeader>
        <CardContent>
          <CodeEditor
            language={formData.domain === 'python' ? 'python' : formData.domain === 'linux' ? 'bash' : 'javascript'}
            value={formData.code_template}
            onChange={(code) => setFormData({ ...formData, code_template: code })}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Test Cases</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {formData.test_cases.map((testCase: any, index: number) => (
            <div key={index} className="p-4 border rounded-lg space-y-3">
              <div className="flex justify-between items-center">
                <h4 className="font-medium">Test Case {index + 1}</h4>
                {formData.test_cases.length > 1 && (
                  <Button type="button" variant="outline" size="sm" onClick={() => removeTestCase(index)}>
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Input</Label>
                  <Textarea
                    value={testCase.input}
                    onChange={(e) => updateTestCase(index, 'input', e.target.value)}
                    placeholder="Test input"
                    rows={3}
                  />
                </div>
                <div>
                  <Label>Expected Output</Label>
                  <Textarea
                    value={testCase.expected_output}
                    onChange={(e) => updateTestCase(index, 'expected_output', e.target.value)}
                    placeholder="Expected output"
                    rows={3}
                  />
                </div>
              </div>
              <div>
                <Label>Description</Label>
                <Input
                  value={testCase.description}
                  onChange={(e) => updateTestCase(index, 'description', e.target.value)}
                  placeholder="Test case description"
                />
              </div>
            </div>
          ))}
          <Button type="button" variant="outline" onClick={addTestCase}>
            <Plus className="h-4 w-4 mr-2" />
            Add Test Case
          </Button>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="time_limit">Time Limit (seconds)</Label>
          <Input
            id="time_limit"
            type="number"
            value={formData.time_limit}
            onChange={(e) => setFormData({ ...formData, time_limit: parseInt(e.target.value) || 300 })}
          />
        </div>
        <div>
          <Label htmlFor="memory_limit">Memory Limit (MB)</Label>
          <Input
            id="memory_limit"
            type="number"
            value={formData.memory_limit}
            onChange={(e) => setFormData({ ...formData, memory_limit: parseInt(e.target.value) || 128 })}
          />
        </div>
      </div>
    </div>
  );
};

export default CodingSection;
