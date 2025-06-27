import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Square, Clock, MemoryStick, Sun, Moon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus, vs } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface EnhancedCodeEditorProps {
  language: 'python' | 'javascript' | 'bash';
  value: string;
  onChange: (value: string) => void;
  testCases?: any[];
  timeLimit?: number;
  memoryLimit?: number;
  onTestResults?: (results: any[]) => void;
  className?: string;
}

const EnhancedCodeEditor: React.FC<EnhancedCodeEditorProps> = ({
  language,
  value,
  onChange,
  testCases = [],
  timeLimit = 300,
  memoryLimit = 128,
  onTestResults,
  className
}) => {
  const { toast } = useToast();
  const editorRef = useRef(null);
  const [isRunning, setIsRunning] = useState(false);
  const [output, setOutput] = useState('');
  const [executionTime, setExecutionTime] = useState(0);
  const [isPyodideLoading, setIsPyodideLoading] = useState(false);
  const [pyodideReady, setPyodideReady] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const highlighterRef = useRef<HTMLDivElement>(null);

  // Load Pyodide for Python execution
  const loadPyodide = async () => {
    if (window.pyodideLoaded) {
      setPyodideReady(true);
      return;
    }

    setIsPyodideLoading(true);

    try {
      // Load Pyodide script dynamically if not already loaded
      if (!window.loadPyodide) {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/pyodide.js';
        script.async = true;
        document.head.appendChild(script);

        await new Promise((resolve, reject) => {
          script.onload = resolve;
          script.onerror = reject;
        });
      }

      toast({
        title: "Loading Python interpreter...",
        description: "This may take 10-30 seconds. Python will be ready for all coding questions after this.",
      });

      // Initialize Pyodide
      const pyodide = await window.loadPyodide({
        indexURL: "https://cdn.jsdelivr.net/pyodide/v0.24.1/full/"
      });

      window.pyodide = pyodide;
      window.pyodideLoaded = true;
      setPyodideReady(true);

      toast({
        title: "Python ready!",
        description: "You can now run Python code in the browser.",
      });
    } catch (error) {
      console.error('Failed to load Pyodide:', error);
      toast({
        title: "Failed to load Python",
        description: "Please try again or check your internet connection.",
        variant: "destructive"
      });
    } finally {
      setIsPyodideLoading(false);
    }
  };

  // Auto-load Pyodide for Python
  useEffect(() => {
    if (language === 'python' && !window.pyodideLoaded && !isPyodideLoading) {
      loadPyodide();
    }
  }, [language, isPyodideLoading]);

  const runCode = async () => {
    if (!value.trim()) {
      toast({ title: 'No code to run', description: 'Please write some code first', variant: 'destructive' });
      return;
    }

    // For Python, check if Pyodide needs to be loaded
    if (language === 'python' && !pyodideReady) {
      if (isPyodideLoading) {
        toast({
          title: "Python is loading...",
          description: "Please wait for Python interpreter to finish loading.",
          variant: "default"
        });
        return;
      } else {
        await loadPyodide();
        if (!pyodideReady) {
          toast({
            title: "Python not available",
            description: "Failed to load Python interpreter. Please try again.",
            variant: "destructive"
          });
          return;
        }
      }
    }

    setIsRunning(true);
    setOutput('');

    const startTime = Date.now();

    try {
      if (language === 'python') {
        await executePython(false);
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

  const runTests = async () => {
    if (!testCases || testCases.length === 0) {
      toast({ title: 'No test cases', description: 'No test cases available for this question', variant: 'destructive' });
      return;
    }

    if (!value.trim()) {
      toast({ title: 'No code to test', description: 'Please write some code first', variant: 'destructive' });
      return;
    }

    // For Python, check if Pyodide needs to be loaded
    if (language === 'python' && !pyodideReady) {
      if (isPyodideLoading) {
        toast({
          title: "Python is loading...",
          description: "Please wait for Python interpreter to finish loading.",
          variant: "default"
        });
        return;
      } else {
        await loadPyodide();
        if (!pyodideReady) {
          toast({
            title: "Python not available",
            description: "Failed to load Python interpreter. Please try again.",
            variant: "destructive"
          });
          return;
        }
      }
    }

    setIsRunning(true);
    setOutput('');

    const startTime = Date.now();

    try {
      if (language === 'python') {
        await executePython(true);
      } else if (language === 'bash') {
        setOutput('Bash test execution not implemented yet');
      } else {
        await executeJavaScriptTests();
      }

      setExecutionTime(Date.now() - startTime);
    } catch (error) {
      setOutput(`Test execution failed: ${error.message}`);
      toast({ title: 'Test execution failed', description: error.message, variant: 'destructive' });
    } finally {
      setIsRunning(false);
    }
  };

  const executePython = async (runTests = false) => {
    if (!window.pyodideLoaded) {
      await loadPyodide();
    }

    if (!window.pyodide) {
      setOutput('Python interpreter not available. Please try again.');
      return;
    }

    if (!runTests) {
      // Just run the code and show output
      try {
        const escapedCode = value.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n');

        window.pyodide.runPython(`
import sys
from io import StringIO

old_stdout = sys.stdout
sys.stdout = StringIO()

try:
    exec("""${escapedCode}""")
    output = sys.stdout.getvalue()
    execution_result = output if output.strip() else "Code executed successfully (no output)"
except Exception as e:
    execution_result = f"Error: {str(e)}"
finally:
    sys.stdout = old_stdout
        `);

        const result = window.pyodide.globals.get('execution_result');
        setOutput(String(result || 'No output'));
      } catch (execError) {
        setOutput(`Execution Error: ${execError.message}`);
      }
    } else {
      // Run tests
      const testResults = [];

      for (let i = 0; i < testCases.length; i++) {
        const testCase = testCases[i];
        try {
          const testInput = String(testCase.input || '');
          const expectedOutput = String(testCase.expected_output || '').trim();

          const escapedCode = value.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n');
          const escapedInput = testInput.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n');

          window.pyodide.runPython(`
import sys
from io import StringIO

old_stdout = sys.stdout
old_stdin = sys.stdin
sys.stdout = StringIO()

input_data = """${escapedInput}"""
if input_data:
    sys.stdin = StringIO(input_data + "\\n")

try:
    exec("""${escapedCode}""")
    test_output = sys.stdout.getvalue()
    test_error = None
except Exception as e:
    test_output = ""
    test_error = str(e)
finally:
    sys.stdout = old_stdout
    sys.stdin = old_stdin
          `);

          const actualOutput = window.pyodide.globals.get('test_output') || '';
          const error = window.pyodide.globals.get('test_error');

          const actualOutputClean = String(actualOutput).trim();
          const expectedOutputClean = expectedOutput.trim();

          const passed = !error && actualOutputClean === expectedOutputClean;

          testResults.push({
            testCase: i + 1,
            input: String(testInput),
            expected: expectedOutput || '[No expected output defined]',
            actual: error ? `Error: ${error}` : String(actualOutputClean),
            passed: expectedOutput ? passed : false,
            description: testCase.description || `Test case ${i + 1}`
          });
        } catch (error) {
          testResults.push({
            testCase: i + 1,
            input: String(testCase.input || ''),
            expected: String(testCase.expected_output || ''),
            actual: `Execution Error: ${error.message}`,
            passed: false,
            description: testCase.description || `Test case ${i + 1}`
          });
        }
      }

      // Send test results to parent component
      if (onTestResults) {
        onTestResults(testResults);
      }

      const passedCount = testResults.filter(r => r.passed).length;
      setOutput(`Test Results: ${passedCount}/${testResults.length} test cases passed`);
    }
  };

  const executeJavaScript = async () => {
    try {
      const originalLog = console.log;
      let capturedOutput = '';

      console.log = (...args: any[]) => {
        capturedOutput += args.map(arg => String(arg)).join(' ') + '\n';
      };

      const result = new Function(value)();
      console.log = originalLog;

      if (capturedOutput) {
        setOutput(capturedOutput.trim());
      } else if (result !== undefined) {
        setOutput(String(result));
      } else {
        setOutput('Code executed successfully (no output)');
      }
    } catch (error) {
      setOutput(`JavaScript Error: ${error.message}`);
    }
  };

  const executeJavaScriptTests = async () => {
    const testResults = [];

    for (let i = 0; i < testCases.length; i++) {
      const testCase = testCases[i];
      try {
        const originalLog = console.log;
        let capturedOutput = '';

        console.log = (...args: any[]) => {
          capturedOutput += args.map(arg => String(arg)).join(' ') + '\n';
        };

        const result = new Function(value)();
        console.log = originalLog;

        const actualOutput = (capturedOutput || String(result || '')).trim();
        const expectedOutput = String(testCase.expected_output || '').trim();
        const passed = actualOutput === expectedOutput;

        testResults.push({
          testCase: i + 1,
          input: String(testCase.input || 'No input required'),
          expected: String(expectedOutput),
          actual: String(actualOutput),
          passed,
          description: testCase.description || `Test case ${i + 1}`
        });
      } catch (error) {
        testResults.push({
          testCase: i + 1,
          input: String(testCase.input || 'No input required'),
          expected: String(testCase.expected_output || ''),
          actual: `JavaScript Error: ${error.message}`,
          passed: false,
          description: testCase.description || `Test case ${i + 1}`
        });
      }
    }

    // Send test results to parent component
    if (onTestResults) {
      onTestResults(testResults);
    }

    const passedCount = testResults.filter(r => r.passed).length;
    setOutput(`JavaScript Test Results: ${passedCount}/${testResults.length} test cases passed`);
  };

  const executeBash = async () => {
    setOutput('Bash execution not implemented in browser environment');
  };

  return (
    <div className={cn(
      "h-full flex flex-col",
      isDarkMode ? "bg-gray-900" : "bg-white",
      className
    )}>
      {/* Editor Header */}
      <div className={cn(
        "flex items-center justify-between p-4 border-b",
        isDarkMode
          ? "border-gray-700 bg-gray-800"
          : "border-gray-200 bg-gray-50"
      )}>
        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className={cn(
              "text-xs",
              isDarkMode
                ? "border-gray-600 text-gray-300"
                : "border-gray-300 text-gray-700"
            )}
          >
            {language.toUpperCase()}
          </Badge>
          {timeLimit && (
            <div className={cn(
              "flex items-center gap-1 text-xs",
              isDarkMode ? "text-gray-400" : "text-gray-500"
            )}>
              <Clock className="h-3 w-3" />
              {timeLimit}s
            </div>
          )}
          {memoryLimit && (
            <div className={cn(
              "flex items-center gap-1 text-xs",
              isDarkMode ? "text-gray-400" : "text-gray-500"
            )}>
              <MemoryStick className="h-3 w-3" />
              {memoryLimit}MB
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setIsDarkMode(!isDarkMode)}
            size="sm"
            variant="ghost"
            className="flex items-center gap-2"
            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>

          <Button
            onClick={runCode}
            disabled={isRunning || (language === 'python' && isPyodideLoading)}
            size="sm"
            variant="outline"
            className="flex items-center gap-2"
          >
            {isRunning ? <Square className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            {isRunning ? 'Running...' :
             (language === 'python' && isPyodideLoading) ? 'Loading Python...' : 'Run Code'}
          </Button>

          {testCases && testCases.length > 0 && (
            <Button
              onClick={runTests}
              disabled={isRunning || (language === 'python' && isPyodideLoading)}
              size="sm"
              className="flex items-center gap-2"
            >
              {isRunning ? <Square className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              {isRunning ? 'Testing...' :
               (language === 'python' && isPyodideLoading) ? 'Loading Python...' : 'Run Tests'}
            </Button>
          )}
        </div>
      </div>

      {/* Code Editor */}
      <div className={cn(
        "flex-1 relative overflow-hidden",
        isDarkMode ? "bg-gray-900" : "bg-white"
      )}>
        {/* Syntax Highlighting Layer */}
        <div
          ref={highlighterRef}
          className="absolute inset-0 pointer-events-none overflow-auto"
        >
          <SyntaxHighlighter
            language={language === 'bash' ? 'bash' : language}
            style={isDarkMode ? vscDarkPlus : vs}
            customStyle={{
              margin: 0,
              padding: '16px',
              background: isDarkMode ? '#1e1e1e' : '#ffffff',
              fontSize: '14px',
              lineHeight: '1.5',
              fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace',
              minHeight: '100%',
              overflow: 'visible',
            }}
            codeTagProps={{
              style: {
                fontFamily: 'inherit',
              }
            }}
          >
            {value || ' '}
          </SyntaxHighlighter>
        </div>

        {/* Transparent Textarea for Input */}
        <textarea
          ref={editorRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={cn(
            "absolute inset-0 w-full h-full p-4 font-mono text-sm border-none outline-none resize-none bg-transparent",
            "text-transparent caret-white selection:bg-blue-500/30",
            isDarkMode ? "caret-gray-100" : "caret-gray-900"
          )}
          style={{
            lineHeight: '1.5',
            fontSize: '14px',
            fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace',
            color: 'transparent',
            caretColor: isDarkMode ? '#f3f4f6' : '#111827',
          }}
          placeholder={`Write your ${language} code here...`}
          spellCheck={false}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          onScroll={(e) => {
            // Sync scroll between textarea and syntax highlighter
            const target = e.target as HTMLTextAreaElement;
            if (highlighterRef.current) {
              highlighterRef.current.scrollTop = target.scrollTop;
              highlighterRef.current.scrollLeft = target.scrollLeft;
            }
          }}
        />

        {/* Placeholder when empty */}
        {!value && (
          <div className={cn(
            "absolute inset-0 p-4 font-mono text-sm pointer-events-none flex items-start",
            isDarkMode ? "text-gray-500" : "text-gray-400"
          )}>
            <span>{`Write your ${language} code here...`}</span>
          </div>
        )}
      </div>

      {/* Output Section */}
      {output && (
        <div className={cn(
          "border-t",
          isDarkMode
            ? "border-gray-700 bg-gray-800"
            : "border-gray-200 bg-gray-50"
        )}>
          <div className="p-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className={cn(
                "font-medium text-sm",
                isDarkMode ? "text-gray-200" : "text-gray-900"
              )}>
                Output
              </h4>
              {executionTime > 0 && (
                <span className={cn(
                  "text-xs",
                  isDarkMode ? "text-gray-400" : "text-gray-500"
                )}>
                  Executed in {executionTime}ms
                </span>
              )}
            </div>
            <pre className={cn(
              "p-3 rounded border text-sm overflow-x-auto max-h-32 font-mono",
              isDarkMode
                ? "bg-gray-900 border-gray-600 text-gray-100"
                : "bg-white border-gray-300 text-gray-900"
            )}>
              {output}
            </pre>
          </div>
        </div>
      )}

      {/* Python Loading State */}
      {language === 'python' && isPyodideLoading && (
        <div className={cn(
          "border-t p-4",
          isDarkMode
            ? "border-gray-700 bg-blue-900/20"
            : "border-gray-200 bg-blue-50"
        )}>
          <div className={cn(
            "flex items-center gap-2 text-sm",
            isDarkMode ? "text-blue-300" : "text-blue-700"
          )}>
            <div className={cn(
              "animate-spin rounded-full h-4 w-4 border-b-2",
              isDarkMode ? "border-blue-300" : "border-blue-700"
            )}></div>
            Loading Python interpreter...
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedCodeEditor;
