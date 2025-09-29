import React, { useState } from 'react';
import { 
  File, 
  Folder, 
  FolderOpen, 
  ChevronRight, 
  ChevronDown,
  FileText,
  Code,
  Image,
  Settings,
  Database
} from 'lucide-react';
import { useAppState, useAppActions } from '../../context/AppContext';
import { utils } from '../../services/apiClient';

const FileTree = () => {
  const { files, activeFile } = useAppState();
  const { setActiveFile } = useAppActions();
  const [expandedFolders, setExpandedFolders] = useState(new Set(['src', 'public']));

  // Build file tree from flat file list
  const buildTree = () => {
    const filesArray = Array.from(files.values());
    return utils.buildFileTree(filesArray);
  };

  const toggleFolder = (folderPath) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderPath)) {
      newExpanded.delete(folderPath);
    } else {
      newExpanded.add(folderPath);
    }
    setExpandedFolders(newExpanded);
  };

  const getFileIcon = (fileName, isFolder = false) => {
    if (isFolder) {
      return expandedFolders.has(fileName) ? 
        <FolderOpen className="h-4 w-4 text-blue-400" /> : 
        <Folder className="h-4 w-4 text-blue-500" />;
    }

    const extension = fileName.split('.').pop()?.toLowerCase();
    
    switch (extension) {
      case 'js':
      case 'jsx':
      case 'ts':
      case 'tsx':
        return <Code className="h-4 w-4 text-yellow-500" />;
      case 'html':
        return <FileText className="h-4 w-4 text-orange-500" />;
      case 'css':
      case 'scss':
      case 'sass':
        return <FileText className="h-4 w-4 text-blue-500" />;
      case 'json':
        return <Settings className="h-4 w-4 text-green-500" />;
      case 'md':
        return <FileText className="h-4 w-4 text-gray-500" />;
      case 'png':
      case 'jpg':
      case 'jpeg':
      case 'gif':
      case 'svg':
        return <Image className="h-4 w-4 text-purple-500" />;
      case 'sql':
        return <Database className="h-4 w-4 text-indigo-500" />;
      default:
        return <File className="h-4 w-4 text-gray-400" />;
    }
  };

  const renderTreeNode = (node, name, path = '', level = 0) => {
    const isFolder = node.type === 'directory';
    const isExpanded = expandedFolders.has(path || name);
    const isActive = !isFolder && activeFile === (path || name);
    const currentPath = path ? `${path}/${name}` : name;

    return (
      <div key={currentPath}>
        <div
          className={`flex items-center gap-2 px-2 py-1 text-sm cursor-pointer hover:bg-background-tertiary rounded transition-colors ${
            isActive ? 'bg-primary-500 text-white' : 'text-dark-700'
          }`}
          style={{ paddingLeft: `${8 + level * 16}px` }}
          onClick={() => {
            if (isFolder) {
              toggleFolder(currentPath);
            } else {
              setActiveFile(currentPath);
            }
          }}
        >
          {isFolder && (
            <div className="flex-shrink-0 w-4">
              {isExpanded ? (
                <ChevronDown className="h-3 w-3 text-dark-500" />
              ) : (
                <ChevronRight className="h-3 w-3 text-dark-500" />
              )}
            </div>
          )}
          
          <div className="flex-shrink-0">
            {getFileIcon(name, isFolder)}
          </div>
          
          <span className={`flex-1 truncate ${isActive ? 'font-medium' : ''}`}>
            {name}
          </span>
          
          {!isFolder && node.size && (
            <span className="text-xs text-dark-500 opacity-70">
              {utils.formatFileSize(node.size)}
            </span>
          )}
        </div>

        {isFolder && isExpanded && node.children && (
          <div>
            {Object.entries(node.children).map(([childName, childNode]) =>
              renderTreeNode(childNode, childName, currentPath, level + 1)
            )}
          </div>
        )}
      </div>
    );
  };

  const tree = buildTree();

  if (files.size === 0) {
    return (
      <div className="p-4 text-center">
        <div className="text-dark-500 text-sm">
          <Folder className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>No files yet</p>
          <p className="text-xs mt-1">
            Generate code using the chat panel
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-2">
      <div className="px-2 pb-2 border-b border-dark-200 mb-2">
        <div className="text-xs text-dark-500 uppercase tracking-wide font-medium">
          Project Files
        </div>
      </div>
      
      <div className="space-y-1">
        {Object.entries(tree).map(([name, node]) =>
          renderTreeNode(node, name)
        )}
      </div>
    </div>
  );
};

export default FileTree;