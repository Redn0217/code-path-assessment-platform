
import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, RefreshCw, CheckCircle, XCircle, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Declare global pyodide
declare global {
  interface Window {
    pyodide: any;
    pyodideLoaded: boolean;
    loadPyodide: any;
  }
}

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
  const [isPyodideLoading, setIsPyodideLoading] = useState(false);
  const [pyodideReady, setPyodideReady] = useState(false);

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.focus();
    }

    // Check if Pyodide is already loaded
    if (window.pyodide && window.pyodideLoaded) {
      setPyodideReady(true);
    }

    // Auto-load Pyodide for Python questions
    if (language === 'python' && !window.pyodideLoaded && !isPyodideLoading) {
      loadPyodide();
    }
  }, [language]);

  // Load Pyodide on demand
  const loadPyodide = async () => {
    if (window.pyodideLoaded) {
      setPyodideReady(true);
      return;
    }

    setIsPyodideLoading(true);

    try {
      // Load Pyodide script dynamically
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
      window.pyodide = await window.loadPyodide({
        indexURL: "https://cdn.jsdelivr.net/pyodide/v0.24.1/full/"
      });

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

  const executeCode = async () => {
    if (!value.trim()) {
      toast({ title: 'Please write some code first', variant: 'destructive' });
      return;
    }

    // For Python, wait for Pyodide to load if it's still loading
    if (language === 'python' && !pyodideReady) {
      if (isPyodideLoading) {
        toast({
          title: "Python is loading...",
          description: "Please wait for Python interpreter to finish loading.",
          variant: "default"
        });
        return;
      } else {
        // Try to load Pyodide if it's not loading and not ready
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
    setTestResults([]);

    const startTime = Date.now();

    try {
      if (language === 'python') {
        await executePython(false); // false = don't run tests, just execute code
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

  // Helper function to extract function names and their parameter counts from code
  const extractFunctionInfo = (code: string, language: string) => {
    const functions = [];

    if (language === 'python') {
      // Match Python function definitions: def function_name(params):
      const pythonFunctionRegex = /def\s+(\w+)\s*\(([^)]*)\):/g;
      let match;
      while ((match = pythonFunctionRegex.exec(code)) !== null) {
        const functionName = match[1];
        const paramsString = match[2].trim();

        // Count parameters (simple count by commas, ignoring defaults)
        const paramCount = paramsString ? paramsString.split(',').length : 0;

        functions.push({
          name: functionName,
          paramCount: paramCount,
          paramsString: paramsString
        });
      }
    } else if (language === 'javascript') {
      // Match JavaScript function declarations: function functionName(params) {
      const jsFunctionRegex = /function\s+(\w+)\s*\(([^)]*)\)\s*\{/g;
      let match;
      while ((match = jsFunctionRegex.exec(code)) !== null) {
        const functionName = match[1];
        const paramsString = match[2].trim();
        const paramCount = paramsString ? paramsString.split(',').length : 0;

        functions.push({
          name: functionName,
          paramCount: paramCount,
          paramsString: paramsString
        });
      }

      // Also match arrow functions: const functionName = (params) => {
      const arrowFunctionRegex = /(?:const|let|var)\s+(\w+)\s*=\s*\(([^)]*)\)\s*=>/g;
      while ((match = arrowFunctionRegex.exec(code)) !== null) {
        const functionName = match[1];
        const paramsString = match[2].trim();
        const paramCount = paramsString ? paramsString.split(',').length : 0;

        functions.push({
          name: functionName,
          paramCount: paramCount,
          paramsString: paramsString
        });
      }
    }

    console.log('🔧 Extracted function info from code:', functions);
    return functions;
  };

  // Helper function to extract just function names (for backward compatibility)
  const extractFunctionNames = (code: string, language: string) => {
    return extractFunctionInfo(code, language).map(func => func.name);
  };

  // Helper function to parse test input arguments
  const parseTestArguments = (input: string) => {
    console.log('🔧 Parsing test arguments:', input);

    // Try to parse as JSON first (handles arrays, objects, etc.)
    try {
      const parsed = JSON.parse(input);
      if (Array.isArray(parsed)) {
        console.log('🔧 Parsed as JSON array (multiple args):', parsed);
        return parsed.map(arg => String(arg));
      } else {
        console.log('🔧 Parsed as JSON single value:', parsed);
        return [String(parsed)];
      }
    } catch (e) {
      // Not JSON, continue with other parsing
    }

    // Check if input is a single array/list literal
    const arrayMatch = input.match(/^\s*\[.*\]\s*$/);
    if (arrayMatch) {
      console.log('🔧 Detected array literal as single argument:', input);
      return [input.trim()];
    }

    // Check if input is a single object literal
    const objectMatch = input.match(/^\s*\{.*\}\s*$/);
    if (objectMatch) {
      console.log('🔧 Detected object literal as single argument:', input);
      return [input.trim()];
    }

    // Check if input is a single quoted string
    const quotedStringMatch = input.match(/^\s*["'].*["']\s*$/);
    if (quotedStringMatch) {
      console.log('🔧 Detected quoted string as single argument:', input);
      return [input.trim()];
    }

    // If input looks like a function call, extract arguments
    const functionCallMatch = input.match(/^(\w+)\s*\((.*)\)\s*$/);
    if (functionCallMatch) {
      const argsString = functionCallMatch[2].trim();
      console.log('🔧 Found function call, extracting args:', argsString);

      if (!argsString) {
        return [];
      }

      return parseComplexArguments(argsString);
    }

    // If input contains commas but isn't wrapped in brackets/quotes, parse as multiple args
    if (input.includes(',') && !arrayMatch && !objectMatch && !quotedStringMatch) {
      return parseComplexArguments(input);
    }

    // Single argument or direct input
    console.log('🔧 Single argument:', [input]);
    return [input.trim()];
  };

  // Helper function to parse complex argument strings with proper bracket/quote handling
  const parseComplexArguments = (argsString: string) => {
    const args = [];
    let current = '';
    let inString = false;
    let stringChar = '';
    let bracketCount = 0;
    let braceCount = 0;
    let parenCount = 0;

    for (let i = 0; i < argsString.length; i++) {
      const char = argsString[i];

      if (!inString && (char === '"' || char === "'")) {
        inString = true;
        stringChar = char;
        current += char;
      } else if (inString && char === stringChar && argsString[i-1] !== '\\') {
        inString = false;
        current += char;
      } else if (!inString && char === '[') {
        bracketCount++;
        current += char;
      } else if (!inString && char === ']') {
        bracketCount--;
        current += char;
      } else if (!inString && char === '{') {
        braceCount++;
        current += char;
      } else if (!inString && char === '}') {
        braceCount--;
        current += char;
      } else if (!inString && char === '(') {
        parenCount++;
        current += char;
      } else if (!inString && char === ')') {
        parenCount--;
        current += char;
      } else if (!inString && char === ',' && bracketCount === 0 && braceCount === 0 && parenCount === 0) {
        args.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }

    if (current.trim()) {
      args.push(current.trim());
    }

    console.log('🔧 Parsed complex args:', args);
    return args;
  };

  // Helper function to convert string argument to Python value
  const convertToPythonValue = (arg: string) => {
    arg = arg.trim();

    // Handle strings (quoted)
    if ((arg.startsWith('"') && arg.endsWith('"')) ||
        (arg.startsWith("'") && arg.endsWith("'"))) {
      return arg;
    }

    // Handle lists/arrays
    if (arg.startsWith('[') && arg.endsWith(']')) {
      return arg;
    }

    // Handle numbers
    if (!isNaN(Number(arg))) {
      return arg;
    }

    // Handle booleans
    if (arg.toLowerCase() === 'true' || arg.toLowerCase() === 'false') {
      return arg.charAt(0).toUpperCase() + arg.slice(1).toLowerCase();
    }

    // Handle None/null
    if (arg.toLowerCase() === 'none' || arg.toLowerCase() === 'null') {
      return 'None';
    }

    // Default: treat as string
    return `"${arg}"`;
  };

  const executePython = async (runTests = false) => {
    // Load Pyodide if not already loaded
    if (!window.pyodideLoaded) {
      await loadPyodide();
    }

    if (!window.pyodide) {
      setOutput('Python interpreter not available. Please try again.');
      return;
    }

    try {
      // Set up Python environment for capturing output
      window.pyodide.runPython(`
        import sys
        from io import StringIO
        import contextlib

        # Function to capture output
        def capture_output(code_str, input_str=""):
            old_stdout = sys.stdout
            old_stdin = sys.stdin
            sys.stdout = StringIO()
            if input_str:
                sys.stdin = StringIO(input_str)

            try:
                # Create a new namespace for execution
                namespace = {}
                # Execute the code
                exec(code_str, namespace)
                output = sys.stdout.getvalue()
                return output, None
            except Exception as e:
                return None, str(e)
            finally:
                sys.stdout = old_stdout
                sys.stdin = old_stdin
      `);

      if (!runTests) {
        // Just run the code and show output
        try {
          console.log('Executing Python code:', value);

          // Escape the code properly for Python execution
          const escapedCode = value.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n');

          // Execute the code and capture output directly
          window.pyodide.runPython(`
import sys
from io import StringIO

# Capture stdout
old_stdout = sys.stdout
sys.stdout = StringIO()

try:
    # Execute user code
    exec("""${escapedCode}""")
    # Get the output
    output = sys.stdout.getvalue()
    execution_result = output if output.strip() else "Code executed successfully (no output)"
except Exception as e:
    execution_result = f"Error: {str(e)}"
finally:
    # Restore stdout
    sys.stdout = old_stdout
          `);

          // Get the result from the Python global variable
          const result = window.pyodide.globals.get('execution_result');

          console.log('Python execution result:', result);
          setOutput(String(result || 'No output'));
          setTestResults([]); // Clear test results when just running code
        } catch (execError) {
          console.error('Python execution error:', execError);
          setOutput(`Execution Error: ${execError.message}`);
        }
      } else {
        // Run test cases
        if (testCases.length === 0) {
          setOutput('No test cases available for this question.');
          return;
        }

        const testResults = [];

        for (let i = 0; i < testCases.length; i++) {
          const testCase = testCases[i];
          console.log('Processing test case:', testCase);

          try {
            // Debug the test case structure first
            console.log(`Raw test case ${i + 1}:`, testCase);
            console.log('Test case keys:', Object.keys(testCase));

            // Try different possible property names for expected output
            const possibleExpectedFields = [
              'expected_output',
              'expectedOutput',
              'expected',
              'output',
              'result'
            ];

            let expectedOutput = '';
            for (const field of possibleExpectedFields) {
              if (testCase[field] !== undefined && testCase[field] !== null && String(testCase[field]).trim() !== '') {
                expectedOutput = String(testCase[field]);
                console.log(`Found expected output in field '${field}':`, expectedOutput);
                break;
              }
            }

            // If still no expected output found, check if it's a legacy format
            if (!expectedOutput && (testCase as any).output !== undefined) {
              expectedOutput = String((testCase as any).output);
              console.log('Using legacy "output" field as expected output:', expectedOutput);
            }

            // Final check - if still no expected output, log a warning
            if (!expectedOutput || expectedOutput.trim() === '') {
              console.warn(`Test case ${i + 1} has no expected output! Available fields:`, Object.keys(testCase));
              console.warn('Test case data:', testCase);
            }

            // Safely extract test case data and ensure they are strings
            const testInput = String(testCase.input || '');

            console.log(`Test case ${i + 1} processed:`, {
              input: testInput,
              expected: expectedOutput,
              inputType: typeof testCase.input,
              expectedType: typeof testCase.expected_output,
              allFields: Object.keys(testCase),
              rawTestCase: testCase,
              hasExpectedOutput: !!expectedOutput
            });

            // Escape the code and inputs properly
            const escapedCode = value.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n');
            const escapedInput = testInput.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n');
            const escapedExpected = expectedOutput.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n');

            // Extract function info from user code
            const functionInfo = extractFunctionInfo(value, language);
            const functionNames = functionInfo.map(f => f.name);
            console.log('🔍 Enhanced Test Execution - Available functions:', functionNames);
            console.log('🔍 Enhanced Test Execution - Function info:', functionInfo);
            console.log('🔍 Enhanced Test Execution - Test input:', testInput);
            console.log('🔍 Enhanced Test Execution - Expected output:', expectedOutput);

            // Parse test arguments
            let testArgs = parseTestArguments(testInput);
            console.log('🔍 Enhanced Test Execution - Parsed arguments:', testArgs);

            // Execute test case with enhanced function call handling
            if (functionInfo.length > 0 && testArgs.length > 0) {
              // Use the first function found
              const funcInfo = functionInfo[0];
              const functionName = funcInfo.name;
              console.log('🔍 Enhanced Test Execution - Using function:', functionName);
              console.log('🔍 Enhanced Test Execution - Function expects', funcInfo.paramCount, 'parameters');
              console.log('🔍 Enhanced Test Execution - We have', testArgs.length, 'arguments');

              // Smart argument adjustment: if function expects 1 param but we have multiple args,
              // try to combine them into a single list/array argument
              if (funcInfo.paramCount === 1 && testArgs.length > 1) {
                console.log('🔧 Smart adjustment: Converting multiple args to single array argument');
                const arrayArg = `[${testArgs.join(', ')}]`;
                testArgs = [arrayArg];
                console.log('🔧 Adjusted arguments:', testArgs);
              }

              // Function call execution
              const pythonArgs = testArgs.map(arg => convertToPythonValue(arg)).join(', ');

              window.pyodide.runPython(`
import sys
from io import StringIO
import json

# Set up output capture
old_stdout = sys.stdout
sys.stdout = StringIO()

try:
    # Execute the user code first to define functions
    exec("""${escapedCode}""")

    # Check if the function exists
    if '${functionName}' in locals() or '${functionName}' in globals():
        # Call the function with parsed arguments
        result = ${functionName}(${pythonArgs})

        # Convert result to string for output comparison
        if result is not None:
            output = str(result)
        else:
            output = ""
    else:
        output = ""
        error = f"Function '${functionName}' not found"

    error = None
except Exception as e:
    output = ""
    error = str(e)
finally:
    # Restore stdout
    sys.stdout = old_stdout

# Store results in global variables
test_output = output
test_error = error
test_expected = """${escapedExpected}"""
test_input = """${escapedInput}"""
              `);
            } else {
              // Traditional input/output execution
              window.pyodide.runPython(`
import sys
from io import StringIO
import json

# Set up input and output capture
old_stdout = sys.stdout
old_stdin = sys.stdin
sys.stdout = StringIO()

# Set up input if provided (add newline for input() function)
input_data = """${escapedInput}"""
if input_data:
    sys.stdin = StringIO(input_data + "\\n")

try:
    # Execute the user code
    exec("""${escapedCode}""")
    # Get the output
    output = sys.stdout.getvalue()
    error = None
except Exception as e:
    output = ""
    error = str(e)
finally:
    # Restore stdout and stdin
    sys.stdout = old_stdout
    sys.stdin = old_stdin

# Store results in global variables
test_output = output
test_error = error
test_expected = """${escapedExpected}"""
test_input = """${escapedInput}"""
              `);
            }

            // Get results from Python globals
            const output = window.pyodide.globals.get('test_output') || '';
            const error = window.pyodide.globals.get('test_error');
            const expected = window.pyodide.globals.get('test_expected') || '';
            const input = window.pyodide.globals.get('test_input') || '';

            console.log('Test execution results:', { output, error, expected, input });

            // Clean up the outputs for comparison
            const actualOutput = error ? `Error: ${error}` : output;
            const expectedOutputClean = expected.trim();
            const actualOutputClean = actualOutput.trim();

            // Check if expected output is missing
            if (!expectedOutput || expectedOutput.trim() === '') {
              console.warn(`Test case ${i + 1} has no expected output defined!`);
            }

            // Compare ignoring whitespace differences
            const passed = !error && actualOutputClean === expectedOutputClean;

            console.log('Comparison:', {
              actual: actualOutputClean,
              expected: expectedOutputClean,
              passed,
              hasError: !!error,
              expectedEmpty: !expectedOutput || expectedOutput.trim() === ''
            });

            testResults.push({
              testCase: i + 1,
              input: String(input || testInput),
              expected: expectedOutput ? String(expectedOutputClean) : '[No expected output defined]',
              actual: String(actualOutputClean),
              passed: expectedOutput ? passed : false,
              description: testCase.description || `Test case ${i + 1}`
            });
          } catch (error) {
            console.error('Test case execution error:', error);
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

        setTestResults(testResults);
        const passedCount = testResults.filter(r => r.passed).length;
        const failedCount = testResults.length - passedCount;

        let summary = `Test Results: ${passedCount}/${testResults.length} test cases passed`;
        if (failedCount > 0) {
          summary += `\n\nFailed tests:`;
          testResults.filter(r => !r.passed).forEach(test => {
            summary += `\nTest ${test.testCase}: Expected "${test.expected}", got "${test.actual}"`;
          });
        }

        setOutput(summary);
      }
    } catch (error) {
      setOutput(`Python execution error: ${error.message}`);
    }
  };

  const executeBash = async () => {
    // Mock bash execution
    setOutput('Bash script executed successfully (mock)');
  };

  const executeJavaScript = async () => {
    try {
      // Capture console.log output
      const originalLog = console.log;
      let capturedOutput = '';

      console.log = (...args: any[]) => {
        capturedOutput += args.map(arg => String(arg)).join(' ') + '\n';
      };

      // Execute the code
      const result = new Function(value)();

      // Restore console.log
      console.log = originalLog;

      // Show captured output or return value
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
    if (testCases.length === 0) {
      setOutput('No test cases available for JavaScript testing.');
      return;
    }

    const testResults = [];

    for (let i = 0; i < testCases.length; i++) {
      const testCase = testCases[i];
      console.log('JS Test case:', testCase);

      try {
        const testInput = String(testCase.input || '');

        // Extract function info from user code
        const functionInfo = extractFunctionInfo(value, language);
        const functionNames = functionInfo.map(f => f.name);
        console.log('🔍 JS Enhanced Test Execution - Available functions:', functionNames);
        console.log('🔍 JS Enhanced Test Execution - Function info:', functionInfo);
        console.log('🔍 JS Enhanced Test Execution - Test input:', testInput);

        // Parse test arguments
        let testArgs = parseTestArguments(testInput);
        console.log('🔍 JS Enhanced Test Execution - Parsed arguments:', testArgs);

        // Capture console.log output for JavaScript tests
        const originalLog = console.log;
        let capturedOutput = '';

        console.log = (...args: any[]) => {
          capturedOutput += args.map(arg => String(arg)).join(' ') + '\n';
        };

        let actualOutput = '';

        if (functionInfo.length > 0 && testArgs.length > 0) {
          // Use the first function found
          const funcInfo = functionInfo[0];
          const functionName = funcInfo.name;
          console.log('🔍 JS Enhanced Test Execution - Using function:', functionName);
          console.log('🔍 JS Enhanced Test Execution - Function expects', funcInfo.paramCount, 'parameters');
          console.log('🔍 JS Enhanced Test Execution - We have', testArgs.length, 'arguments');

          // Smart argument adjustment: if function expects 1 param but we have multiple args,
          // try to combine them into a single array argument
          if (funcInfo.paramCount === 1 && testArgs.length > 1) {
            console.log('🔧 JS Smart adjustment: Converting multiple args to single array argument');
            const arrayArg = `[${testArgs.join(', ')}]`;
            testArgs = [arrayArg];
            console.log('🔧 JS Adjusted arguments:', testArgs);
          }

          // Function call execution
          try {
            // Execute the user code to define functions
            const userCode = new Function(value);
            userCode();

            // Check if function exists in global scope
            const func = (window as any)[functionName];
            if (typeof func === 'function') {
              // Convert arguments to JavaScript values
              const jsArgs = testArgs.map(arg => {
                try {
                  // Try to parse as JSON first
                  return JSON.parse(arg);
                } catch (e) {
                  // If not JSON, handle as string/number/boolean
                  if (arg === 'true') return true;
                  if (arg === 'false') return false;
                  if (arg === 'null') return null;
                  if (arg === 'undefined') return undefined;
                  if (!isNaN(Number(arg))) return Number(arg);
                  // Remove quotes if it's a quoted string
                  if ((arg.startsWith('"') && arg.endsWith('"')) ||
                      (arg.startsWith("'") && arg.endsWith("'"))) {
                    return arg.slice(1, -1);
                  }
                  return arg;
                }
              });

              // Call the function
              const result = func(...jsArgs);
              actualOutput = result !== undefined ? String(result) : '';
            } else {
              actualOutput = `Function '${functionName}' not found`;
            }
          } catch (error) {
            actualOutput = `Function execution error: ${error.message}`;
          }
        } else {
          // Traditional execution
          const result = new Function(value)();

          // Determine actual output
          if (capturedOutput) {
            actualOutput = capturedOutput.trim();
          } else if (result !== undefined) {
            actualOutput = String(result);
          }
        }

        // Restore console.log
        console.log = originalLog;

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

    setTestResults(testResults);
    const passedCount = testResults.filter(r => r.passed).length;
    setOutput(`JavaScript Test Results: ${passedCount}/${testResults.length} test cases passed`);
  };

  const runTestCases = async () => {
    console.log('🚀 Enhanced Test Execution - Starting test execution');
    console.log('🚀 Enhanced Test Execution - Test cases:', testCases);

    if (testCases.length === 0) {
      toast({ title: 'No test cases available for this question', variant: 'destructive' });
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
        await executePython(true); // true = run tests
      } else if (language === 'bash') {
        // For bash, we'll mock test execution for now
        setOutput('Bash test execution not implemented yet (mock)');
      } else {
        // For JavaScript, run tests if available
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
              {language === 'python' && isPyodideLoading && (
                <Badge variant="secondary">
                  Loading Python...
                </Badge>
              )}
            </CardTitle>
            <div className="flex gap-2">
              <Button
                onClick={executeCode}
                disabled={isRunning || (language === 'python' && isPyodideLoading)}
                size="sm"
                title="Execute your code and see the output"
              >
                {isRunning ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Play className="h-4 w-4 mr-2" />
                )}
                {language === 'python' && isPyodideLoading ? 'Loading Python...' : 'Run Code'}
              </Button>
              {testCases.length > 0 && (
                <Button
                  onClick={runTestCases}
                  disabled={isRunning || (language === 'python' && isPyodideLoading)}
                  variant="outline"
                  size="sm"
                  title="Run your code against test cases to check correctness"
                >
                  {isRunning ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <CheckCircle className="h-4 w-4 mr-2" />
                  )}
                  Run Tests ({testCases.length})
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
              {language === 'python' && isPyodideLoading && (
                <span className="flex items-center gap-1 text-yellow-300">
                  <RefreshCw className="h-3 w-3 animate-spin" />
                  Loading Python...
                </span>
              )}
            </div>
            <div className="relative">
              <textarea
                ref={editorRef}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full h-64 p-4 font-mono text-sm bg-slate-900 text-slate-200 resize-none focus:outline-none"
                spellCheck="false"
                data-language={getLanguageClass()}
                placeholder={
                  language === 'python'
                    ? isPyodideLoading
                      ? "Loading Python interpreter... Please wait..."
                      : `# Write your Python code here...\n# Example:\nprint("Hello, World!")\n\n# For input/output:\n# name = input("Enter your name: ")\n# print(f"Hello, {name}!")`
                    : language === 'javascript'
                      ? `// Write your JavaScript code here...\n// Example:\nconsole.log("Hello, World!");\n\n// For return values:\n// return "Hello, World!";`
                      : `Write your ${getLanguageLabel()} code here...`
                }
                disabled={language === 'python' && isPyodideLoading}
              />
              {language === 'python' && isPyodideLoading && (
                <div className="absolute inset-0 bg-slate-900 bg-opacity-75 flex items-center justify-center">
                  <div className="text-center text-slate-200">
                    <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2" />
                    <p className="text-sm">Loading Python interpreter...</p>
                    <p className="text-xs text-slate-400">This may take 10-30 seconds</p>
                  </div>
                </div>
              )}
            </div>
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
