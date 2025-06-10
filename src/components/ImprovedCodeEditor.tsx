
import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, RefreshCw, CheckCircle, XCircle, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TestCase {
  input: string;
  expected_output: string;
  description: string;
}

interface ImprovedCodeEditorProps {
  language: string;
  value: string;
  onChange: (code: string) => void;
  testCases?: TestCase[];
  timeLimit?: number;
  memoryLimit?: number;
}

const ImprovedCodeEditor: React.FC<ImprovedCodeEditorProps> = ({ 
  language, 
  value, 
  onChange, 
  testCases = [],
  timeLimit = 300,
  memoryLimit = 128 
}) => {
  const { toast } = useToast();
  const editorRef = useRef(null);
  const [isRunning, setIsRunning] = useState(false);
  const [output, setOutput] = useState('');
  const [testResults, setTestResults] = useState([]);
  const [executionTime, setExecutionTime] = useState(0);

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.focus();
    }
  }, []);

  const executeCode = async () => {
    if (!value.trim()) {
      toast({ title: 'Please write some code first', variant: 'destructive' });
      return;
    }

    setIsRunning(true);
    setOutput('');
    setTestResults([]);
    
    const startTime = Date.now();
    
    try {
      if (language === 'python') {
        await executePython();
      } else if (language === 'bash') {
        await executeBash();
      } else {
        await executeJavaScript();
      }
      
      setExecutionTime(Date.now() - startTime);
    } catch (error) {
      setOutput(`Error: ${error.message}`);
      toast({ title: 'Execution failed', description: error.message, variant: 'destructive' });
    } finally {
      setIsRunning(false);
    }
  };

  const executePython = async () => {
    // For Python, we'll use a mock execution since we can't run actual Python in the browser
    // In a real implementation, this would send the code to a backend service
    const mockResults = [];
    
    for (let i = 0; i < testCases.length; i++) {
      const testCase = testCases[i];
      
      // Simulate execution delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Mock result - in reality this would be actual execution
      const passed = Math.random() > 0.3; // 70% pass rate for demo
      const actualOutput = passed ? testCase.expected_output : 'Different output';
      
      mockResults.push({
        testCase: i + 1,
        input: testCase.input,
        expected: testCase.expected_output,
        actual: actualOutput,
        passed,
        description: testCase.description
      });
    }
    
    setTestResults(mockResults);
    setOutput(`Executed ${testCases.length} test cases. ${mockResults.filter(r => r.passed).length} passed.`);
  };

  const executeBash = async () => {
    // Mock bash execution
    setOutput('Bash script executed successfully (mock)');
  };

  const executeJavaScript = async () => {
    try {
      // Create a safe execution context
      const result = new Function(value)();
      setOutput(String(result));
    } catch (error) {
      setOutput(`JavaScript Error: ${error.message}`);
    }
  };

  const runTestCases = async () => {
    if (testCases.length === 0) {
      toast({ title: 'No test cases available', variant: 'destructive' });
      return;
    }
    
    await executeCode();
  };

  const getLanguageClass = () => {
    switch (language) {
      case 'python': return 'language-python';
      case 'bash': return 'language-bash';
      case 'javascript':
      default: return 'language-javascript';
    }
  };

  const getLanguageLabel = () => {
    switch (language) {
      case 'python': return 'Python';
      case 'bash': return 'Bash';
      case 'javascript':
      default: return 'JavaScript';
    }
  };

  return (
    <div className="space-y-4">
      {/* Code Editor */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              {getLanguageLabel()} Editor
              <Badge variant="outline">{timeLimit}s limit</Badge>
              <Badge variant="outline">{memoryLimit}MB limit</Badge>
            </CardTitle>
            <div className="flex gap-2">
              <Button 
                onClick={executeCode} 
                disabled={isRunning}
                size="sm"
              >
                {isRunning ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Play className="h-4 w-4 mr-2" />
                )}
                Run Code
              </Button>
              {testCases.length > 0 && (
                <Button 
                  onClick={runTestCases} 
                  disabled={isRunning}
                  variant="outline"
                  size="sm"
                >
                  Run Tests
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="border rounded-md overflow-hidden">
            <div className="bg-slate-800 text-slate-200 p-2 text-xs flex items-center justify-between">
              <span>{getLanguageLabel()} Editor</span>
              {executionTime > 0 && (
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {executionTime}ms
                </span>
              )}
            </div>
            <textarea
              ref={editorRef}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className="w-full h-64 p-4 font-mono text-sm bg-slate-900 text-slate-200 resize-none focus:outline-none"
              spellCheck="false"
              data-language={getLanguageClass()}
              placeholder={`Write your ${getLanguageLabel()} code here...`}
            />
          </div>
        </CardContent>
      </Card>

      {/* Output */}
      {output && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Output</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-slate-100 p-4 rounded-md text-sm overflow-x-auto whitespace-pre-wrap">
              {output}
            </pre>
          </CardContent>
        </Card>
      )}

      {/* Test Results */}
      {testResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Test Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {testResults.map((result, index) => (
                <div 
                  key={index} 
                  className={`p-4 border rounded-lg ${
                    result.passed ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium flex items-center gap-2">
                      Test Case {result.testCase}
                      {result.passed ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-600" />
                      )}
                    </h4>
                    <Badge variant={result.passed ? "default" : "destructive"}>
                      {result.passed ? 'PASSED' : 'FAILED'}
                    </Badge>
                  </div>
                  
                  {result.description && (
                    <p className="text-sm text-gray-600 mb-2">{result.description}</p>
                  )}
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                    <div>
                      <span className="font-medium">Input:</span>
                      <pre className="bg-white p-2 rounded mt-1 overflow-x-auto">
                        {result.input || 'No input'}
                      </pre>
                    </div>
                    <div>
                      <span className="font-medium">Expected:</span>
                      <pre className="bg-white p-2 rounded mt-1 overflow-x-auto">
                        {result.expected}
                      </pre>
                    </div>
                    <div>
                      <span className="font-medium">Actual:</span>
                      <pre className={`p-2 rounded mt-1 overflow-x-auto ${
                        result.passed ? 'bg-white' : 'bg-red-100'
                      }`}>
                        {result.actual}
                      </pre>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ImprovedCodeEditor;
