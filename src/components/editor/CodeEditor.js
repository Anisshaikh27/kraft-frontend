import React, { useEffect, useRef, useState } from 'react';
import Editor from '@monaco-editor/react';
import { Save, Download, Play } from 'lucide-react';
import { useAppState, useAppActions } from '../../context/AppContext';
import { utils } from '../../services/apiClient';
import LoadingSpinner from '../ui/LoadingSpinner';

const CodeEditor = () => {
  const { files, activeFile, currentProject, isLoading } = useAppState();
  const { updateFile, setActiveTab } = useAppActions();
  const [editorContent, setEditorContent] = useState('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isEditorLoading, setIsEditorLoading] = useState(true);
  const editorRef = useRef(null);
  const timeoutRef = useRef(null);

  const currentFile = activeFile ? files.get(activeFile) : null;

  // Load file content when active file changes
  useEffect(() => {
    if (currentFile) {
      setEditorContent(currentFile.content || '');
      setHasUnsavedChanges(false);
    } else {
      setEditorContent('');
      setHasUnsavedChanges(false);
    }
  }, [currentFile]);

  // Auto-save with debounce
  useEffect(() => {
    if (hasUnsavedChanges && activeFile && currentFile) {
      // Clear existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Set new timeout for auto-save
      timeoutRef.current = setTimeout(() => {
        handleSave();
      }, 2000); // Auto-save after 2 seconds of inactivity
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [hasUnsavedChanges, editorContent, activeFile]);

  const handleEditorChange = (value) => {
    setEditorContent(value || '');
    setHasUnsavedChanges(value !== currentFile?.content);
  };

  const handleSave = async () => {
    if (!activeFile || !hasUnsavedChanges) return;

    try {
      await updateFile(activeFile, editorContent);
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Failed to save file:', error);
    }
  };

  const handleDownload = () => {
    if (!currentFile || !activeFile) return;

    const blob = new Blob([editorContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = activeFile.split('/').pop() || 'file.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handlePreview = () => {
    setActiveTab('preview');
  };

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
    setIsEditorLoading(false);

    // Configure editor
    editor.updateOptions({
      fontSize: 14,
      lineHeight: 1.6,
      minimap: { enabled: false },
      folding: true,
      renderWhitespace: 'selection',
      wordWrap: 'on',
      theme: 'vs-dark'
    });

    // Add keyboard shortcuts
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      handleSave();
    });

    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyD, () => {
      handleDownload();
    });
  };

  // Get file language
  const getLanguage = () => {
    if (!activeFile) return 'javascript';
    return utils.getLanguageFromPath(activeFile);
  };

  if (!currentProject) {
    return (
      <div className="h-full flex items-center justify-center bg-background-primary">
        <div className="text-center">
          <h3 className="text-lg font-medium text-dark-700 mb-2">No Project Loaded</h3>
          <p className="text-dark-500">Create or load a project to start editing files.</p>
        </div>
      </div>
    );
  }

  if (!activeFile) {
    return (
      <div className="h-full flex items-center justify-center bg-background-primary">
        <div className="text-center">
          <h3 className="text-lg font-medium text-dark-700 mb-2">No File Selected</h3>
          <p className="text-dark-500 mb-4">
            Select a file from the sidebar or generate code using the chat panel.
          </p>
          <button
            onClick={() => setActiveTab('chat')}
            className="btn-primary"
          >
            Go to Chat
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-background-primary">
      {/* Header */}
      <div className="flex-shrink-0 bg-background-secondary border-b border-dark-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-sm font-medium text-white">
              {activeFile}
            </div>
            {hasUnsavedChanges && (
              <div className="w-2 h-2 bg-orange-400 rounded-full" title="Unsaved changes" />
            )}
            <div className="text-xs text-dark-500 bg-background-tertiary px-2 py-1 rounded">
              {getLanguage()}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              disabled={!hasUnsavedChanges || isLoading}
              className="btn-secondary text-sm px-3 py-1 flex items-center gap-2"
              title="Save (Ctrl+S)"
            >
              <Save className="h-3 w-3" />
              <span className="hidden sm:inline">Save</span>
            </button>
            
            <button
              onClick={handleDownload}
              className="btn-secondary text-sm px-3 py-1 flex items-center gap-2"
              title="Download (Ctrl+D)"
            >
              <Download className="h-3 w-3" />
              <span className="hidden sm:inline">Download</span>
            </button>

            <button
              onClick={handlePreview}
              className="btn-primary text-sm px-3 py-1 flex items-center gap-2"
            >
              <Play className="h-3 w-3" />
              <span className="hidden sm:inline">Preview</span>
            </button>
          </div>
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 relative">
        {isEditorLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background-primary z-10">
            <div className="text-center">
              <LoadingSpinner size="large" />
              <p className="text-dark-500 mt-4">Loading editor...</p>
            </div>
          </div>
        )}
        
        <Editor
          height="100%"
          language={getLanguage()}
          value={editorContent}
          onChange={handleEditorChange}
          onMount={handleEditorDidMount}
          theme="vs-dark"
          options={{
            fontSize: 14,
            lineHeight: 1.6,
            minimap: { enabled: false },
            folding: true,
            renderWhitespace: 'selection',
            wordWrap: 'on',
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 2,
            insertSpaces: true,
            renderLineHighlight: 'line',
            selectionHighlight: false,
            cursorBlinking: 'smooth',
            smoothScrolling: true,
          }}
        />
      </div>

      {/* Status Bar */}
      <div className="flex-shrink-0 bg-background-secondary border-t border-dark-200 px-4 py-2">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-4 text-dark-500">
            <span>Lines: {editorContent.split('\n').length}</span>
            <span>Characters: {editorContent.length}</span>
            <span>Language: {getLanguage()}</span>
          </div>
          
          <div className="flex items-center gap-2">
            {hasUnsavedChanges && (
              <span className="text-orange-400">Unsaved changes</span>
            )}
            {isLoading && (
              <span className="text-primary-400">Saving...</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodeEditor;