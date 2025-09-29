import React from 'react';
import Sidebar from './Sidebar';
import { useAppState } from '../../context/AppContext';

const MainLayout = ({ children }) => {
  const { sidebarCollapsed } = useAppState();

  return (
    <div className="flex h-screen bg-background-primary">
      {/* Sidebar */}
      <div className={`flex-shrink-0 transition-all duration-300 ${
        sidebarCollapsed ? 'w-16' : 'w-64'
      }`}>
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {children}
      </div>
    </div>
  );
};

export default MainLayout;