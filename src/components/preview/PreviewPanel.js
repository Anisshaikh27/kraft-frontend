// src/components/preview/PreviewPanel.js
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAppState } from '../../context/AppContext';
import SandpackPreviewComponent from './SandpackPreview';

const PreviewPanel = () => {
  const { files } = useAppState();
  const [previewMode, setPreviewMode] = useState('sandpack'); // 'sandpack' or 'legacy'

  const filesArray = useMemo(() => {
    if (files instanceof Map) {
      return Array.from(files.values());
    }
    return Array.isArray(files) ? files : [];
  }, [files]);

  return (
    <div className="h-full flex flex-col bg-background-primary">
      {/* Header with mode toggle */}
      <div className="flex-shrink-0 bg-background-secondary border-b border-dark-200 px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-dark-300">React Preview</h3>
          <div className={`w-2 h-2 rounded-full ${filesArray.length > 0 ? 'bg-green-500' : 'bg-gray-500'}`}></div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPreviewMode('sandpack')}
            className={`px-3 py-1 text-xs rounded transition-colors ${
              previewMode === 'sandpack'
                ? 'bg-primary-600 text-white'
                : 'bg-dark-700 text-gray-400 hover:bg-dark-600'
            }`}
          >
            Sandpack
          </button>
          <button
            onClick={() => setPreviewMode('legacy')}
            className={`px-3 py-1 text-xs rounded transition-colors ${
              previewMode === 'legacy'
                ? 'bg-primary-600 text-white'
                : 'bg-dark-700 text-gray-400 hover:bg-dark-600'
            }`}
          >
            Files
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {previewMode === 'sandpack' ? (
          <SandpackPreviewComponent files={filesArray} />
        ) : (
          <LegacyFilePreview files={filesArray} />
        )}
      </div>
    </div>
  );
};

// Legacy file preview component
const LegacyFilePreview = ({ files }) => {
  const [selectedFile, setSelectedFile] = useState(null);

  const getFileIcon = (filename) => {
    if (filename.endsWith('.jsx') || filename.endsWith('.js')) return '⚛️';
    if (filename.endsWith('.css')) return '🎨';
    if (filename.endsWith('.json')) return '📋';
    if (filename.endsWith('.html')) return '🌐';
    if (filename.endsWith('.tsx') || filename.endsWith('.ts')) return '📘';
    return '📄';
  };

  const selectedFileData = selectedFile
    ? files.find((f) => f.path === selectedFile)
    : null;

  if (files.length === 0) {
    return (
      <div className="h-full flex items-center justify-center bg-background-primary">
        <div className="text-center">
          <p className="text-dark-500 mb-2">📁 No files generated</p>
          <p className="text-xs text-dark-600">Use chat to generate React code</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full bg-background-primary">
      {/* File List */}
      <div className="w-1/3 border-r border-dark-200 overflow-y-auto">
        <div className="p-4">
          <h3 className="text-sm font-semibold text-dark-300 mb-3">Files ({files.length})</h3>
          <div className="space-y-1">
            {files.map((file) => (
              <button
                key={file.path}
                onClick={() => setSelectedFile(file.path)}
                className={`w-full text-left px-3 py-2 rounded text-xs transition-colors ${
                  selectedFile === file.path
                    ? 'bg-primary-600 text-white'
                    : 'text-dark-400 hover:bg-background-secondary'
                }`}
              >
                <span className="mr-2">{getFileIcon(file.path)}</span>
                <span className="truncate">{file.path}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* File Content */}
      <div className="flex-1 flex flex-col">
        {selectedFileData ? (
          <>
            <div className="border-b border-dark-200 px-4 py-3 bg-background-secondary">
              <div>
                <p className="text-sm font-medium text-dark-300">{selectedFileData.path}</p>
                <p className="text-xs text-dark-500 mt-1">{(selectedFileData.content || '').length} bytes</p>
              </div>
            </div>
            <div className="flex-1 overflow-auto p-4">
              <pre className="text-xs text-dark-300 font-mono bg-background-tertiary p-3 rounded overflow-x-auto">
                {selectedFileData.content}
              </pre>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <p className="text-dark-500 mb-2">📁 Select a file to view</p>
              <p className="text-xs text-dark-600">Generated files are listed on the left</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PreviewPanel;
