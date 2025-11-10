import React from 'react';
import { useAppState, useAppActions } from '../../context/AppContext';

const TabNavigation = () => {
  const { activeTab, files } = useAppState();
  const { setActiveTab } = useAppActions();
  
  const filesArray = Array.from(files.values());
  
  const tabs = [
    {
      id: 'chat',
      name: 'Chat',
      icon: '💬',
      description: 'AI Assistant'
    },
    {
      id: 'editor',
      name: 'Editor',
      icon: '⚡',
      description: `${filesArray.length} files`,
      disabled: filesArray.length === 0
    },
    {
      id: 'preview',
      name: 'Preview',
      icon: '👁️',
      description: 'Live view',
      disabled: filesArray.length === 0,
      badge: filesArray.length > 0 ? 'Ready' : null
    }
  ];

  return (
    <div className="bg-background-secondary border-b border-dark-200">
      <div className="flex">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => !tab.disabled && setActiveTab(tab.id)}
            disabled={tab.disabled}
            className={`
              relative px-6 py-3 text-sm font-medium transition-all duration-200 flex items-center gap-2
              ${activeTab === tab.id
                ? 'bg-white text-primary-600 border-b-2 border-primary-600 shadow-sm'
                : tab.disabled
                ? 'text-dark-400 cursor-not-allowed'
                : 'text-dark-600 hover:text-primary-600 hover:bg-background-tertiary'
              }
            `}
          >
            <span className="text-base">{tab.icon}</span>
            <div className="flex flex-col items-start">
              <span>{tab.name}</span>
              <span className={`text-xs ${
                activeTab === tab.id ? 'text-primary-500' : 'text-dark-400'
              }`}>
                {tab.description}
              </span>
            </div>
            
            {tab.badge && !tab.disabled && (
              <span className="absolute -top-1 -right-1 bg-green-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                {tab.badge}
              </span>
            )}
            
            {tab.disabled && (
              <div className="absolute inset-0 bg-gray-100 bg-opacity-50 rounded" />
            )}
          </button>
        ))}
        
        <div className="flex-1 bg-background-secondary" />
        
        {/* Quick Actions */}
        <div className="flex items-center gap-2 px-4">
          <button 
            className="text-dark-500 hover:text-primary-600 text-sm px-2 py-1 rounded hover:bg-background-tertiary transition-colors"
            onClick={() => window.location.reload()}
          >
            ↻
          </button>
          
          <div className="text-xs text-dark-400">
            {filesArray.length > 0 ? `${filesArray.length} files` : 'No files'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TabNavigation;