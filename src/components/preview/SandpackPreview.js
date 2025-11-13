import React, { useMemo, useState } from 'react';
import {
  SandpackProvider,
  SandpackLayout,
  SandpackCodeEditor,
  SandpackPreview,
  SandpackFileExplorer,
} from '@codesandbox/sandpack-react';
import { filesToSandpackFormat, isHiddenFile } from '../../utils/sandpackParser';
import { useSandpackOptions } from '../../hooks/useSandpack';
import { RefreshCw, Code2, Eye, FileText, FolderTree, Maximize2, Minimize2, ExternalLink } from 'lucide-react';
import LZString from 'lz-string';

const SandpackPreviewComponent = ({ files = [] }) => {
  const [editorViewMode, setEditorViewMode] = useState('split');
  const [showPreview, setShowPreview] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const sandpackOptions = useSandpackOptions();

  const sandpackFiles = useMemo(() => {
    return filesToSandpackFormat(files);
  }, [files]);

  const visibleFiles = useMemo(() => {
    return Object.keys(sandpackFiles).filter((path) => !isHiddenFile(path));
  }, [sandpackFiles]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 500);
  };

  const openInCodeSandbox = () => {
    try {
      // Build CodeSandbox files map (keys WITHOUT leading slash)
      const csFiles = Object.entries(sandpackFiles).reduce((acc, [path, file]) => {
        const key = path.replace(/^\//, '');
        const content = typeof file === 'string' ? file : file.code ?? file.content ?? '';
        if (!content) return acc;
        acc[key] = { content };
        return acc;
      }, {});

      // Ensure there's an HTML entry (public/index.html)
      if (!csFiles['public/index.html']) {
        csFiles['public/index.html'] = {
          content:
            '<!DOCTYPE html>\n<html>\n  <head>\n    <meta charset="utf-8" />\n    <meta name="viewport" content="width=device-width, initial-scale=1" />\n    <title>Sandbox</title>\n  </head>\n  <body>\n    <div id="root"></div>\n  </body>\n</html>\n'
        };
      }

      // Ensure there's a JS entry (index.js) that mounts the first discovered component
      const jsFiles = Object.keys(csFiles).filter((k) => /\.(jsx?|tsx?)$/.test(k));
      const preferredEntry = jsFiles.find((k) => /index\.(js|jsx|ts|tsx)$/.test(k)) || jsFiles[0];

      if (!preferredEntry) {
        // No JS files at all: create a minimal app
        csFiles['src/App.js'] = {
          content: "export default function App(){ return React.createElement('div', null, 'Hello from Sandbox'); }\n"
        };
        csFiles['index.js'] = {
          content:
            "import React from 'react';\nimport { createRoot } from 'react-dom/client';\nimport App from './src/App';\nconst root = document.getElementById('root');\ncreateRoot(root).render(React.createElement(App));\n"
        };
      } else {
        // If there's no top-level index.js, create one that imports the preferred entry
        if (!csFiles['index.js'] && !csFiles['src/index.js']) {
          const importPath = './' + preferredEntry.replace(/^\.\//, '');
          // Remove file extension for import (works for JS/JSX/TS/TSX with bundler)
          const importPathNoExt = importPath.replace(/\.(jsx?|tsx?)$/, '');
          csFiles['index.js'] = {
            content:
              "import React from 'react';\nimport { createRoot } from 'react-dom/client';\nimport App from '" +
              importPathNoExt +
              "';\nconst root = document.getElementById('root');\ncreateRoot(root).render(React.createElement(App));\n"
          };
        }
      }

      // Compress with LZString (CodeSandbox expects LZ-string base64)
      const parameters = LZString.compressToBase64(JSON.stringify({ files: csFiles }));

      // POST form to avoid URL length limits
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = 'https://codesandbox.io/api/v1/sandboxes/define';
      form.target = '_blank';

      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = 'parameters';
      input.value = parameters;

      form.appendChild(input);
      document.body.appendChild(form);
      form.submit();
      document.body.removeChild(form);
    } catch (err) {
      console.error('openInCodeSandbox error:', err);
      alert('Failed to open CodeSandbox — see console for details.');
    }
  };

  const renderLayout = () => {
    if (editorViewMode === 'explorer') {
      return (
        <SandpackLayout style={{ height: '100%' }}>
          <SandpackFileExplorer style={{ height: '100%', minWidth: '250px' }} />
          {showPreview && <SandpackPreview style={{ height: '100%' }} showOpenInCodeSandbox={false} showRefreshButton={false} />}
        </SandpackLayout>
      );
    }

    if (editorViewMode === 'split') {
      return (
        <SandpackLayout style={{ height: '100%' }}>
          <SandpackCodeEditor style={{ height: '100%' }} showTabs showLineNumbers />
          {showPreview && <SandpackPreview style={{ height: '100%' }} showOpenInCodeSandbox={false} showRefreshButton={false} />}
        </SandpackLayout>
      );
    }

    return (
      <SandpackLayout style={{ height: '100%' }}>
        <SandpackCodeEditor style={{ height: '100%' }} showTabs showLineNumbers />
      </SandpackLayout>
    );
  };

  if (!files || files.length === 0) {
    return (
      <div className="h-full flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="text-center p-8 bg-gray-800/50 rounded-xl border border-gray-700 backdrop-blur-sm">
          <div className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FileText className="w-10 h-10 text-blue-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-100 mb-2">No Files to Preview</h3>
          <p className="text-gray-400 max-w-sm">
            Generate code using the chat panel to see a live preview here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`h-full flex flex-col bg-gray-900 ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
      {/* Enhanced Toolbar */}
      <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 border-b border-gray-700 shadow-lg">
        <div className="px-4 py-3 flex items-center justify-between flex-wrap gap-3">
          {/* Left Section - View Controls */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-gray-800 rounded-lg p-1 border border-gray-700">
              <button
                onClick={() => setEditorViewMode('editor')}
                className={`p-2 rounded-md transition-all duration-200 ${
                  editorViewMode === 'editor'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:bg-gray-700 hover:text-gray-200'
                }`}
                title="Code Editor"
              >
                <Code2 size={18} />
              </button>

              <button
                onClick={() => setEditorViewMode('split')}
                className={`p-2 rounded-md transition-all duration-200 ${
                  editorViewMode === 'split'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:bg-gray-700 hover:text-gray-200'
                }`}
                title="Split View"
              >
                <Eye size={18} />
              </button>

              <button
                onClick={() => setEditorViewMode('explorer')}
                className={`p-2 rounded-md transition-all duration-200 ${
                  editorViewMode === 'explorer'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:bg-gray-700 hover:text-gray-200'
                }`}
                title="File Explorer"
              >
                <FolderTree size={18} />
              </button>
            </div>

            {editorViewMode !== 'editor' && (
              <>
                <div className="h-8 w-px bg-gray-700"></div>
                <button
                  onClick={() => setShowPreview(!showPreview)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    showPreview
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700 border border-gray-700'
                  }`}
                  title="Toggle Preview"
                >
                  <span className="flex items-center gap-2">
                    <Eye size={16} />
                    Preview {showPreview ? 'On' : 'Off'}
                  </span>
                </button>
              </>
            )}
          </div>

          {/* Right Section - Info & Actions */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-800 rounded-lg border border-gray-700">
              <FileText size={16} className="text-gray-400" />
              <span className="text-sm font-medium text-gray-300">
                {visibleFiles.length} {visibleFiles.length === 1 ? 'file' : 'files'}
              </span>
            </div>

            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="p-2 rounded-lg bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-gray-200 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed border border-gray-700 hover:border-gray-600"
              title="Refresh Preview"
            >
              <RefreshCw 
                size={18} 
                className={`${isRefreshing ? 'animate-spin' : ''} transition-transform`} 
              />
            </button>

            {/* Open in CodeSandbox Button */}
            <button
              onClick={openInCodeSandbox}
              className="p-2 rounded-lg bg-gray-800 text-blue-400 hover:bg-blue-600 hover:text-white transition-all duration-200 border border-gray-700 hover:border-blue-500"
              title="Open in CodeSandbox"
            >
              <ExternalLink size={18} />
            </button>

            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 rounded-lg bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-gray-200 transition-all duration-200 border border-gray-700 hover:border-gray-600"
              title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
            >
              {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
            </button>
          </div>
        </div>
      </div>

      {/* Sandpack Editor with Enhanced Styling */}
      <div className="flex-1 overflow-hidden relative" style={{ minHeight: 0 }}>
        <SandpackProvider
          files={sandpackFiles}
          template="react"
          theme="dark"
          options={{
            showLineNumbers: true,
            showInlineErrors: true,
            showTabs: true,
            recompileMode: 'delayed',
            recompileDelay: 300,
            autoReload: true,
            closableTabs: false,
          }}
          style={{ height: '100%' }}
        >
          <div style={{ height: '100%' }}>
            {renderLayout()}
          </div>
        </SandpackProvider>
      </div>

      {/* Status Bar */}
      <div className="bg-gray-900 border-t border-gray-700 px-4 py-2 flex items-center justify-between text-xs">
        <div className="flex items-center gap-4 text-gray-400">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            Live Preview Active
          </span>
        </div>
        <div className="text-gray-500">
          Powered by Sandpack
        </div>
      </div>
    </div>
  );
};

export default SandpackPreviewComponent;