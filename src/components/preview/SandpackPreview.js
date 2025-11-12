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
import { RefreshCw, Code2, Eye, FileText } from 'lucide-react';

const SandpackPreviewComponent = ({ files = [] }) => {
  const [editorViewMode, setEditorViewMode] = useState('split'); // 'editor', 'explorer', 'split'
  const [showPreview, setShowPreview] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const sandpackOptions = useSandpackOptions();

  // Convert files to Sandpack format
  const sandpackFiles = useMemo(() => {
    return filesToSandpackFormat(files);
  }, [files]);

  // Filter files for explorer (exclude hidden files)
  const visibleFiles = useMemo(() => {
    return Object.keys(sandpackFiles).filter((path) => !isHiddenFile(path));
  }, [sandpackFiles]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    // Force re-render by refreshing the iframe
    setTimeout(() => {
      setIsRefreshing(false);
    }, 500);
  };

  const renderLayout = () => {
    if (editorViewMode === 'explorer') {
      return (
        <SandpackLayout>
          <SandpackFileExplorer style={{ height: '100%' }} />
          {showPreview && <SandpackPreview style={{ height: '100%' }} />}
        </SandpackLayout>
      );
    }

    if (editorViewMode === 'split') {
      return (
        <SandpackLayout>
          <SandpackCodeEditor style={{ height: '100%' }} />
          {showPreview && <SandpackPreview style={{ height: '100%' }} />}
        </SandpackLayout>
      );
    }

    // Default: just editor
    return (
      <SandpackLayout>
        <SandpackCodeEditor style={{ height: '100%' }} />
      </SandpackLayout>
    );
  };

  if (!files || files.length === 0) {
    return (
      <div className="h-full flex items-center justify-center bg-background-primary">
        <div className="text-center">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-dark-700 mb-2">No Files to Preview</h3>
          <p className="text-dark-500">Generate code using the chat panel to preview it here.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-background-primary">
      {/* Toolbar */}
      <div className="bg-dark-800 border-b border-dark-700 px-4 py-3 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setEditorViewMode('editor')}
            className={`p-2 rounded transition-colors ${
              editorViewMode === 'editor'
                ? 'bg-primary-600 text-white'
                : 'bg-dark-700 text-gray-400 hover:bg-dark-600'
            }`}
            title="Editor Only"
          >
            <Code2 size={18} />
          </button>

          <button
            onClick={() => setEditorViewMode('split')}
            className={`p-2 rounded transition-colors ${
              editorViewMode === 'split'
                ? 'bg-primary-600 text-white'
                : 'bg-dark-700 text-gray-400 hover:bg-dark-600'
            }`}
            title="Editor + Preview"
          >
            <Eye size={18} />
          </button>

          <button
            onClick={() => setEditorViewMode('explorer')}
            className={`p-2 rounded transition-colors ${
              editorViewMode === 'explorer'
                ? 'bg-primary-600 text-white'
                : 'bg-dark-700 text-gray-400 hover:bg-dark-600'
            }`}
            title="File Explorer + Preview"
          >
            <FileText size={18} />
          </button>

          {editorViewMode !== 'editor' && (
            <div className="h-6 w-px bg-dark-600"></div>
          )}

          {editorViewMode !== 'editor' && (
            <button
              onClick={() => setShowPreview(!showPreview)}
              className={`px-3 py-1 rounded text-sm transition-colors ${
                showPreview
                  ? 'bg-primary-600 text-white'
                  : 'bg-dark-700 text-gray-400 hover:bg-dark-600'
              }`}
              title="Toggle Preview"
            >
              Preview {showPreview ? '✓' : '✗'}
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">
            {visibleFiles.length} files
          </span>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-2 rounded bg-dark-700 text-gray-400 hover:bg-dark-600 transition-colors disabled:opacity-50"
            title="Refresh Preview"
          >
            <RefreshCw size={18} className={isRefreshing ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Sandpack Editor */}
      <div className="flex-1 overflow-hidden">
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
        >
          {renderLayout()}
        </SandpackProvider>
      </div>
    </div>
  );
};

export default SandpackPreviewComponent;
