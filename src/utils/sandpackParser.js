/**
 * Sandpack Parser - Convert files to Sandpack compatible format
 */

// Default Sandpack template files
// Keep package.json minimal and aligned with Sandpack prompts: only react and react-dom
const DEFAULT_PACKAGE_JSON = {
  name: 'react-app',
  version: '1.0.0',
  dependencies: {
    'react': '^18.2.0',
    'react-dom': '^18.2.0',
    'react-router-dom': ''
  },
};

const DEFAULT_PUBLIC_HTML = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>React App</title>
    <script src="https://cdn.tailwindcss.com"></script>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>`;

const DEFAULT_INDEX_JS = `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);`;

const DEFAULT_INDEX_CSS = `@tailwind base;
@tailwind components;
@tailwind utilities;

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

html, body, #root {
  height: 100%;
}`;

const DEFAULT_TAILWIND_CONFIG = `module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {},
  },
  plugins: [],
};`;

/**
 * Convert files array to Sandpack files object
 * @param {Array} files - Array of file objects with path and content
 * @returns {Object} - Sandpack compatible files object
 */
export const filesToSandpackFormat = (files) => {
  const sandpackFiles = {};

  if (!files || files.length === 0) {
    // Return minimal React setup
    return {
      '/package.json': { code: JSON.stringify(DEFAULT_PACKAGE_JSON, null, 2) },
      '/public/index.html': { code: DEFAULT_PUBLIC_HTML },
      '/src/index.js': { code: DEFAULT_INDEX_JS },
      '/src/App.js': { code: getDefaultApp() },
      '/src/index.css': { code: DEFAULT_INDEX_CSS },
    };
  }

  // Convert file paths to Sandpack format (add leading /)
  files.forEach((file) => {
    if (file && file.path && file.content !== undefined) {
      const path = file.path.startsWith('/') ? file.path : `/${file.path}`;
      sandpackFiles[path] = {
        code: String(file.content),
      };
    }
  });

  // Ensure essential files exist
  if (!hasFile(sandpackFiles, 'package.json')) {
    sandpackFiles['/package.json'] = {
      code: JSON.stringify(DEFAULT_PACKAGE_JSON, null, 2),
    };
  }

  if (!hasFile(sandpackFiles, 'index.html')) {
    sandpackFiles['/public/index.html'] = {
      code: DEFAULT_PUBLIC_HTML,
    };
  }

  if (!hasFile(sandpackFiles, 'index.js') && !hasFile(sandpackFiles, 'index.jsx')) {
    sandpackFiles['/src/index.js'] = {
      code: DEFAULT_INDEX_JS,
    };
  }

  if (!hasFile(sandpackFiles, 'App.js') && !hasFile(sandpackFiles, 'App.jsx')) {
    sandpackFiles['/src/App.js'] = {
      code: getDefaultApp(),
    };
  }

  if (!hasFile(sandpackFiles, 'index.css')) {
    sandpackFiles['/src/index.css'] = {
      code: DEFAULT_INDEX_CSS,
    };
  }

  return sandpackFiles;
};

/**
 * Check if a file exists in sandpack files (by filename)
 */
const hasFile = (files, filename) => {
  return Object.keys(files).some((path) => path.endsWith(filename));
};

/**
 * Get default App component
 */
const getDefaultApp = () => `import React from 'react';
import './index.css';

export default function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Welcome to Your App</h1>
        <p className="text-lg text-gray-600">Start editing to see your changes live!</p>
      </div>
    </div>
  );
}`;

/**
 * Parse Sandpack files to extract individual files
 * @param {Object} sandpackFiles - Sandpack files object
 * @returns {Array} - Array of file objects
 */
export const sandpackFilesToArray = (sandpackFiles) => {
  return Object.entries(sandpackFiles).map(([path, fileObj]) => ({
    path: path.startsWith('/') ? path.slice(1) : path,
    content: fileObj.code || fileObj.content || '',
  }));
};

/**
 * Get file extension from path
 */
const getFileExtension = (path) => {
  const parts = path.split('.');
  return parts.length > 1 ? parts[parts.length - 1] : 'txt';
};

/**
 * Determine if file is hidden (shouldn't be shown in editor)
 */
export const isHiddenFile = (path) => {
  const hidden = [
    '/package-lock.json',
    '/node_modules',
    '/.git',
    '/.env',
    '/build',
    '/dist',
  ];

  return hidden.some((h) => path.startsWith(h));
};

/**
 * Get file icon emoji based on extension
 */
export const getFileIcon = (filename) => {
  const ext = filename.split('.').pop().toLowerCase();
  const icons = {
    js: '⚡',
    jsx: '⚛️',
    ts: '📘',
    tsx: '🔷',
    css: '🎨',
    html: '🌐',
    json: '📋',
    md: '📝',
    py: '🐍',
    java: '☕',
    sql: '🗄️',
    xml: '📄',
  };
  return icons[ext] || '📄';
};

/**
 * Validate if files can be rendered in Sandpack
 */
export const validateSandpackFiles = (files) => {
  if (!files || files.length === 0) {
    return { valid: true, warnings: ['No files provided, using default React setup'] };
  }

  const warnings = [];
  const hasPackageJson = files.some((f) => f.path === 'package.json');
  const hasPublicHtml = files.some((f) => f.path === 'public/index.html');
  const hasSrcIndex = files.some((f) => f.path === 'src/index.js' || f.path === 'src/index.jsx');
  const hasApp = files.some((f) => f.path === 'src/App.js' || f.path === 'src/App.jsx');

  if (!hasPackageJson) {
    warnings.push('Missing package.json - using default');
  }
  if (!hasPublicHtml) {
    warnings.push('Missing public/index.html - using default');
  }
  if (!hasSrcIndex) {
    warnings.push('Missing src/index.js - using default');
  }
  if (!hasApp) {
    warnings.push('Missing src/App.js - using default');
  }

  return { valid: true, warnings };
};

/**
 * Extract React components from generated code
 */
export const extractReactComponents = (content) => {
  const components = [];
  const componentPattern = /(?:export\s+(?:default\s+)?)?(?:function|const)\s+([A-Z][a-zA-Z0-9]*)\s*(?:\([^)]*\))?\s*\{/g;

  let match;
  while ((match = componentPattern.exec(content)) !== null) {
    components.push(match[1]);
  }

  return [...new Set(components)];
};

/**
 * Get file language for syntax highlighting
 */
export const getLanguageFromFilePath = (filePath) => {
  const ext = filePath.split('.').pop().toLowerCase();
  const languageMap = {
    js: 'javascript',
    jsx: 'javascript',
    ts: 'typescript',
    tsx: 'typescript',
    css: 'css',
    html: 'html',
    json: 'json',
    md: 'markdown',
    py: 'python',
    java: 'java',
    sql: 'sql',
    xml: 'xml',
  };

  return languageMap[ext] || 'text';
};
