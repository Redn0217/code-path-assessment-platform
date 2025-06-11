
import { useState, useEffect } from 'react';

interface TestCase {
  input: string;
  expected_output: string;
  description: string;
}

interface QuestionFormData {
  domain: string;
  module_id: string;
  question_type: string;
  difficulty: string;
  title: string;
  question_text: string;
  options: string[];
  correct_answer: string;
  explanation: string;
  code_template: string;
  test_cases: TestCase[];
  time_limit: number;
  memory_limit: number;
  tags: string[];
}

export const useQuestionFormData = (question: any, selectedModule: any) => {
  const [formData, setFormData] = useState<QuestionFormData>({
    domain: selectedModule?.domain || '',
    module_id: selectedModule?.id || '',
    question_type: 'mcq',
    difficulty: 'beginner',
    title: '',
    question_text: '',
    options: ['', '', '', ''],
    correct_answer: '',
    explanation: '',
    code_template: '',
    test_cases: [{ input: '', expected_output: '', description: '' }],
    time_limit: 300,
    memory_limit: 128,
    tags: [],
  });

  const [newTag, setNewTag] = useState('');

  useEffect(() => {
    if (question) {
      setFormData({
        domain: question.domain || selectedModule?.domain || '',
        module_id: question.module_id || selectedModule?.id || '',
        question_type: question.question_type || 'mcq',
        difficulty: question.difficulty || 'beginner',
        title: question.title || '',
        question_text: question.question_text || '',
        options: question.options || ['', '', '', ''],
        correct_answer: question.correct_answer || '',
        explanation: question.explanation || '',
        code_template: question.code_template || '',
        test_cases: question.test_cases || [{ input: '', expected_output: '', description: '' }],
        time_limit: question.time_limit || 300,
        memory_limit: question.memory_limit || 128,
        tags: question.tags || [],
      });
    } else {
      setFormData(prev => ({
        ...prev,
        domain: selectedModule?.domain || '',
        module_id: selectedModule?.id || '',
      }));
    }
  }, [question, selectedModule]);

  return {
    formData,
    setFormData,
    newTag,
    setNewTag,
  };
};
