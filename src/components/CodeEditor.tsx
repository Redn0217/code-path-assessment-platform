
import React, { useEffect, useRef } from 'react';

// Simple code editor component
// In a real application, you would integrate Monaco Editor or CodeMirror
const CodeEditor = ({ language, value, onChange }) => {
  const editorRef = useRef(null);
  
  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.focus();
    }
  }, []);
  
  const getLanguageClass = () => {
    switch (language) {
      case 'python':
        return 'language-python';
      case 'bash':
        return 'language-bash';
      case 'javascript':
      default:
        return 'language-javascript';
    }
  };
  
  return (
    <div className="border rounded-md overflow-hidden">
      <div className="bg-slate-800 text-slate-200 p-2 text-xs">
        {language === 'python' ? 'Python' : language === 'bash' ? 'Bash' : 'JavaScript'} Editor
      </div>
      <textarea
        ref={editorRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-64 p-4 font-mono text-sm bg-slate-900 text-slate-200 resize-none focus:outline-none"
        spellCheck="false"
        data-language={getLanguageClass()}
      />
    </div>
  );
};

export default CodeEditor;
