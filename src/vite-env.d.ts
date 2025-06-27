/// <reference types="vite/client" />

// Pyodide type declarations
declare global {
  interface Window {
    loadPyodide: (config?: { indexURL: string }) => Promise<any>;
    pyodide: any;
    pyodideLoaded: boolean;
  }
}
