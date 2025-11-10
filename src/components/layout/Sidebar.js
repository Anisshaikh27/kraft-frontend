import React, { useState, useRef, useEffect } from 'react';
import { useAppState, useAppActions } from '../../context/AppContext';

const Sidebar = () => {
  const { currentProject, files } = useAppState();
  const { setActiveFile, setActiveTab } = useAppActions();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  
  // Convert Map to array for display
  const filesArray = Array.from(files.values());
  
  // Group files by directory for better organization
  const groupedFiles = groupFilesByDirectory(filesArray);

  const handleFileClick = (filePath) => {
    setActiveFile(filePath);
    setActiveTab('editor');
  };

  const getFileIcon = (filePath) => {
    const extension = filePath.split('.').pop()?.toLowerCase();
    const iconMap = {
      'jsx': '⚛️',
      'js': '📄',
      'tsx': '🔷',
      'ts': '🔷',
      'css': '🎨',
      'html': '🌐',
      'json': '⚙️',
      'md': '📝',
      'config': '⚙️'
    };
    return iconMap[extension] || '📄';
  };

  const formatFileSize = (size) => {
    if (!size) return '';
    if (size < 1024) return `${size}B`;
    if (size < 1024 * 1024) return `${Math.round(size / 1024)}KB`;
    return `${Math.round(size / (1024 * 1024))}MB`;
  };

  return (
    <div className="h-full bg-background-primary border-r border-dark-200 flex flex-col">
      {/* Header with Profile */}
      <div className="flex-shrink-0 p-4 border-b border-dark-200">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-dark-800">Weblify</h1>
            <p className="text-xs text-dark-500">AI Code Generator</p>
          </div>
          
          {/* Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-white hover:bg-primary-600 transition-colors"
            >
              <span className="text-sm font-semibold">U</span>
            </button>
            
            {showProfileMenu && (
              <div className="absolute right-0 top-10 w-48 bg-white rounded-lg shadow-lg border border-dark-200 py-2 z-50">
                <div className="px-4 py-2 border-b border-dark-100">
                  <p className="text-sm font-medium text-dark-700">User</p>
                  <p className="text-xs text-dark-500">user@example.com</p>
                </div>
                
                <button className="w-full px-4 py-2 text-left text-sm text-dark-600 hover:bg-dark-50 flex items-center gap-2">
                  <span>⚙️</span> Settings
                </button>
                
                <button className="w-full px-4 py-2 text-left text-sm text-dark-600 hover:bg-dark-50 flex items-center gap-2">
                  <span>❓</span> Help & Support
                </button>
                
                <button className="w-full px-4 py-2 text-left text-sm text-dark-600 hover:bg-dark-50 flex items-center gap-2">
                  <span>📚</span> Documentation
                </button>
                
                <div className="border-t border-dark-100 mt-2 pt-2">
                  <button className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2">
                    <span>🚪</span> Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Project Info */}
      <div className="flex-shrink-0 p-4 border-b border-dark-200">
        <div className="text-center">
          <h2 className="text-sm font-semibold text-dark-700 mb-1">CURRENT PROJECT</h2>
          <p className="text-lg font-bold text-primary-600 mb-1">
            {currentProject?.name || 'No Project'}
          </p>
          <p className="text-xs text-dark-500">
            {filesArray.length} files
          </p>
        </div>
      </div>

      {/* Files Section */}
      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex-shrink-0 p-4">
          <h3 className="text-sm font-semibold text-dark-700 uppercase tracking-wide">
            Files
          </h3>
        </div>
        
        {/* Scrollable File List */}
        <div className="flex-1 overflow-y-auto px-4 pb-4">
          {!currentProject ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-3">📁</div>
              <p className="text-sm text-dark-500">Create a project to get started</p>
            </div>
          ) : filesArray.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-3">📂</div>
              <p className="text-sm text-dark-500 mb-1">No files yet</p>
              <p className="text-xs text-dark-400">Use the chat to generate code</p>
            </div>
          ) : (
            <FileTree 
              groupedFiles={groupedFiles} 
              onFileClick={handleFileClick}
              getFileIcon={getFileIcon}
              formatFileSize={formatFileSize}
            />
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="flex-shrink-0 p-4 border-t border-dark-200">
        <div className="flex items-center justify-center gap-2 text-xs text-dark-500">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span>Connected</span>
        </div>
        <p className="text-center text-xs text-dark-400 mt-1">
          Powered by Free AI Models
        </p>
      </div>

      {/* Click outside to close profile menu */}
      {showProfileMenu && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowProfileMenu(false)}
        />
      )}
    </div>
  );
};

// File Tree Component with better organization
const FileTree = ({ groupedFiles, onFileClick, getFileIcon, formatFileSize }) => {
  const { activeFile } = useAppState();
  const [expandedDirs, setExpandedDirs] = useState(new Set(['src', 'src/components', 'public']));

  const toggleDirectory = (dirPath) => {
    const newExpanded = new Set(expandedDirs);
    if (newExpanded.has(dirPath)) {
      newExpanded.delete(dirPath);
    } else {
      newExpanded.add(dirPath);
    }
    setExpandedDirs(newExpanded);
  };

  const renderFile = (file, depth = 0) => {
    const isActive = activeFile === file.path;
    const paddingLeft = depth * 16 + 8;

    return (
      <div
        key={file.path}
        onClick={() => onFileClick(file.path)}
        className={`
          flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer transition-all duration-150 group
          ${isActive 
            ? 'bg-primary-500 text-white shadow-sm' 
            : 'hover:bg-background-secondary text-dark-700'
          }
        `}
        style={{ paddingLeft: `${paddingLeft}px` }}
      >
        <span className="text-sm flex-shrink-0">
          {getFileIcon(file.path)}
        </span>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium truncate">
              {file.path.split('/').pop()}
            </span>
            {file.size && (
              <span className={`text-xs ml-2 flex-shrink-0 ${
                isActive ? 'text-blue-100' : 'text-dark-400'
              }`}>
                {formatFileSize(file.size)}
              </span>
            )}
          </div>
        </div>

        {isActive && (
          <div className="w-1.5 h-1.5 bg-white rounded-full flex-shrink-0"></div>
        )}
      </div>
    );
  };

  const renderDirectory = (dirName, files, depth = 0) => {
    const isExpanded = expandedDirs.has(dirName);
    const paddingLeft = depth * 16 + 8;
    
    return (
      <div key={dirName}>
        <div
          onClick={() => toggleDirectory(dirName)}
          className="flex items-center gap-2 px-2 py-1.5 cursor-pointer hover:bg-background-secondary rounded-md transition-colors"
          style={{ paddingLeft: `${paddingLeft}px` }}
        >
          <span className="text-sm">
            {isExpanded ? '📂' : '📁'}
          </span>
          <span className="text-sm font-medium text-dark-700">
            {dirName.split('/').pop()}
          </span>
          <span className="text-xs text-dark-500 ml-auto">
            {files.length}
          </span>
        </div>
        
        {isExpanded && files.map(file => renderFile(file, depth + 1))}
      </div>
    );
  };

  return (
    <div className="space-y-1">
      {Object.entries(groupedFiles).map(([dirName, files]) => {
        if (dirName === 'root') {
          return files.map(file => renderFile(file, 0));
        }
        return renderDirectory(dirName, files, 0);
      })}
    </div>
  );
};

// Utility function to group files by directory
function groupFilesByDirectory(files) {
  const grouped = {};
  
  files.forEach(file => {
    const pathParts = file.path.split('/');
    
    if (pathParts.length === 1) {
      // Root level file
      if (!grouped.root) grouped.root = [];
      grouped.root.push(file);
    } else {
      // File in directory
      const dirPath = pathParts.slice(0, -1).join('/');
      if (!grouped[dirPath]) grouped[dirPath] = [];
      grouped[dirPath].push(file);
    }
  });
  
  return grouped;
}

export default Sidebar;