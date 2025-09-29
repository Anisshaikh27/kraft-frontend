import React from 'react';
import { 
  FolderOpen, 
  Settings, 
  HelpCircle, 
  ChevronLeft, 
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { useAppState, useAppActions } from '../../context/AppContext';
import FileTree from '../files/FileTree';

const Sidebar = () => {
  const { sidebarCollapsed, currentProject, files } = useAppState();
  const { toggleSidebar } = useAppActions();

  const menuItems = [
    {
      icon: <FolderOpen className="h-5 w-5" />,
      label: 'Files',
      id: 'files',
      active: true
    },
    {
      icon: <Settings className="h-5 w-5" />,
      label: 'Settings',
      id: 'settings',
      active: false
    },
    {
      icon: <HelpCircle className="h-5 w-5" />,
      label: 'Help',
      id: 'help',
      active: false
    }
  ];

  return (
    <div className="h-full bg-background-secondary border-r border-dark-200 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-dark-200">
        {!sidebarCollapsed && (
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 bg-primary-500 rounded-lg flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <span className="font-semibold text-white">Weblify</span>
          </div>
        )}
        
        <button
          onClick={toggleSidebar}
          className="p-1 hover:bg-background-tertiary rounded-lg transition-colors"
          title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {sidebarCollapsed ? (
            <ChevronRight className="h-4 w-4 text-dark-500" />
          ) : (
            <ChevronLeft className="h-4 w-4 text-dark-500" />
          )}
        </button>
      </div>

      {/* Project Info */}
      {!sidebarCollapsed && currentProject && (
        <div className="p-4 border-b border-dark-200">
          <div className="text-xs text-dark-500 uppercase tracking-wide font-medium mb-2">
            Current Project
          </div>
          <div className="text-sm font-medium text-white truncate" title={currentProject.name}>
            {currentProject.name}
          </div>
          <div className="text-xs text-dark-500 mt-1">
            {files.size} {files.size === 1 ? 'file' : 'files'}
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex-1 flex flex-col">
        {!sidebarCollapsed && (
          <div className="p-2 border-b border-dark-200">
            {menuItems.map((item) => (
              <button
                key={item.id}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                  item.active
                    ? 'bg-primary-500 text-white'
                    : 'text-dark-500 hover:text-white hover:bg-background-tertiary'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        )}

        {/* File Tree */}
        <div className="flex-1 overflow-y-auto">
          {!sidebarCollapsed && (
            <div className="p-2">
              <FileTree />
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      {!sidebarCollapsed && (
        <div className="p-4 border-t border-dark-200">
          <div className="text-xs text-dark-500 text-center">
            Powered by Free AI Models
          </div>
          <div className="flex justify-center mt-2">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-xs text-dark-500">Connected</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;