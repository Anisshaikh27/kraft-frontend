import React from 'react';
import { useAppState, useAppActions } from '../../context/AppContext';

const FileTree = ({ groupedFiles, onFileClick, getFileIcon, formatFileSize }) => {
  const { activeFile, currentProject } = useAppState();

  // Use provided props if available, otherwise fall back to default behavior
  const handleFileClick = onFileClick || ((filePath) => {
    console.log('File clicked:', filePath);
  });

  const defaultGetFileIcon = (filePath) => {
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

  const defaultFormatFileSize = (size) => {
    if (!size) return '';
    if (size < 1024) return `${size}B`;
    if (size < 1024 * 1024) return `${Math.round(size / 1024)}KB`;
    return `${Math.round(size / (1024 * 1024))}MB`;
  };

  const iconFn = getFileIcon || defaultGetFileIcon;
  const sizeFn = formatFileSize || defaultFormatFileSize;

  // If groupedFiles is provided, render grouped view
  if (groupedFiles) {
    return (
      <div className="h-full flex flex-col">
        {Object.keys(groupedFiles).length === 0 ? (
          <div className="flex items-center justify-center py-8 text-dark-500">
            <div className="text-center">
              <div className="text-2xl mb-2">📂</div>
              <p className="text-sm">No files yet</p>
            </div>
          </div>
        ) : (
          Object.entries(groupedFiles).map(([dir, files]) => (
            <div key={dir} className="border-b border-dark-100 last:border-b-0">
              {dir !== 'root' && (
                <div className="px-4 py-2 bg-background-secondary text-dark-600 text-xs font-semibold uppercase tracking-wide">
                  📁 {dir}
                </div>
              )}
              <div className="p-2">
                {files.map((file) => (
                  <div
                    key={file.path}
                    onClick={() => handleFileClick(file.path)}
                    className={`
                      flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-all duration-200
                      ${activeFile === file.path 
                        ? 'bg-primary-500 text-white shadow-sm' 
                        : 'hover:bg-background-secondary text-dark-700 hover:text-dark-800'
                      }
                    `}
                  >
                    <span className="text-lg flex-shrink-0">
                      {iconFn(file.path)}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">
                        {file.path.split('/').pop()}
                      </div>
                      {file.size && (
                        <div className={`text-xs ${
                          activeFile === file.path ? 'text-blue-100' : 'text-dark-400'
                        }`}>
                          {sizeFn(file.size)}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    );
  }

  // Default render without groupedFiles
  return (
    <div className="h-full flex flex-col items-center justify-center text-center p-4">
      <div className="text-6xl mb-4">📁</div>
      <h3 className="text-lg font-semibold text-dark-700 mb-2">No Project</h3>
      <p className="text-dark-500 text-sm">Create a project to get started</p>
    </div>
  );
};

export default FileTree;