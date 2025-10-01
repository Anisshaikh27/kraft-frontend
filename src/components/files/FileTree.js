import React from 'react';
import { useAppState, useAppActions } from '../../context/AppContext';

const FileTree = () => {
  const { files, activeFile, currentProject } = useAppState();
  const { setActiveFile, setActiveTab } = useAppActions();

  // Convert Map to array for display
  const filesArray = Array.from(files.values());

  console.log('FileTree render - Current files:', filesArray);
  console.log('FileTree render - Active file:', activeFile);
  console.log('FileTree render - Current project:', currentProject);

  const handleFileClick = (filePath) => {
    console.log('File clicked:', filePath);
    setActiveFile(filePath);
    setActiveTab('editor');
  };

  const getFileIcon = (filePath) => {
    const extension = filePath.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'jsx':
      case 'js':
        return '⚛️';
      case 'tsx':
      case 'ts':
        return '🔷';
      case 'css':
        return '🎨';
      case 'html':
        return '🌐';
      case 'json':
        return '📋';
      case 'md':
        return '📝';
      default:
        return '📄';
    }
  };

  const formatFileSize = (size) => {
    if (!size) return '';
    if (size < 1024) return `${size}B`;
    if (size < 1024 * 1024) return `${Math.round(size / 1024)}KB`;
    return `${Math.round(size / (1024 * 1024))}MB`;
  };

  if (!currentProject) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-4">
        <div className="text-6xl mb-4">📁</div>
        <h3 className="text-lg font-semibold text-dark-700 mb-2">No Project</h3>
        <p className="text-dark-500 text-sm">Create a project to get started</p>
      </div>
    );
  }

  if (filesArray.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-4">
        <div className="text-6xl mb-4">📂</div>
        <h3 className="text-lg font-semibold text-dark-700 mb-2">No files yet</h3>
        <p className="text-dark-500 text-sm">Generate code using the chat panel</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 px-4 py-3 border-b border-dark-200">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-dark-700">Files</h2>
          <span className="text-xs text-dark-500">{filesArray.length} files</span>
        </div>
      </div>

      {/* File List */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-2">
          {filesArray.map((file) => (
            <div
              key={file.path}
              onClick={() => handleFileClick(file.path)}
              className={`
                group flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-all duration-200
                ${activeFile === file.path 
                  ? 'bg-primary-500 text-white shadow-sm' 
                  : 'hover:bg-background-secondary text-dark-700 hover:text-dark-800'
                }
              `}
            >
              {/* File Icon */}
              <span className="text-lg flex-shrink-0">
                {getFileIcon(file.path)}
              </span>

              {/* File Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium truncate">
                    {file.path.split('/').pop()}
                  </span>
                  {file.size && (
                    <span className={`text-xs ml-2 flex-shrink-0 ${
                      activeFile === file.path ? 'text-blue-100' : 'text-dark-400'
                    }`}>
                      {formatFileSize(file.size)}
                    </span>
                  )}
                </div>
                
                <div className="flex items-center justify-between mt-1">
                  <span className={`text-xs truncate ${
                    activeFile === file.path ? 'text-blue-100' : 'text-dark-500'
                  }`}>
                    {file.path}
                  </span>
                </div>
              </div>

              {/* Active Indicator */}
              {activeFile === file.path && (
                <div className="w-2 h-2 bg-white rounded-full flex-shrink-0"></div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="flex-shrink-0 px-4 py-2 border-t border-dark-200">
        <div className="flex items-center justify-between text-xs text-dark-500">
          <span>Project: {currentProject.name}</span>
          {activeFile && (
            <span>Active: {activeFile.split('/').pop()}</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default FileTree;