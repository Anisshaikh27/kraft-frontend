import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppState, useAppActions } from '../context/AppContext';
import ChatPanel from '../components/chat/ChatPanel';
import CodeEditor from '../components/editor/CodeEditor';
import PreviewPanel from '../components/preview/PreviewPanel';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ErrorMessage from '../components/ui/ErrorMessage';

const ProjectPage = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { currentProject, isLoading, error, activeTab } = useAppState();
  const { createProject, loadProject, setActiveTab } = useAppActions();
  
  const [isInitializing, setIsInitializing] = useState(false);

  useEffect(() => {
    const initializeProject = async () => {
      if (projectId && projectId !== 'new') {
        // Load existing project
        try {
          setIsInitializing(true);
          await loadProject(projectId);
        } catch (error) {
          console.error('Failed to load project:', error);
          // Redirect to new project if loading fails
          navigate('/project/new', { replace: true });
        } finally {
          setIsInitializing(false);
        }
      } else if (!currentProject) {
        // Create new project
        try {
          setIsInitializing(true);
          const project = await createProject({
            name: 'New React Project',
            type: 'react-app',
            description: 'AI-generated React application'
          });
          // Update URL with the new project ID
          navigate(`/project/${project.id}`, { replace: true });
        } catch (error) {
          console.error('Failed to create project:', error);
        } finally {
          setIsInitializing(false);
        }
      }
    };

    initializeProject();
  }, [projectId, currentProject, loadProject, createProject, navigate]);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'chat':
        return <ChatPanel />;
      case 'editor':
        return <CodeEditor />;
      case 'preview':
        return <PreviewPanel />;
      default:
        return <ChatPanel />;
    }
  };

  if (isInitializing || isLoading) {
    return (
      <div className="min-h-screen bg-background-primary flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="large" />
          <h2 className="text-xl font-semibold text-dark-700 mb-2 mt-4">
            {isInitializing ? 'Setting up your project...' : 'Loading...'}
          </h2>
          <p className="text-dark-500">
            {isInitializing 
              ? 'Creating a new development environment' 
              : 'Please wait while we load your project'
            }
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background-primary flex items-center justify-center p-4">
        <ErrorMessage 
          message={error}
          onRetry={() => window.location.reload()}
        />
      </div>
    );
  }

  if (!currentProject) {
    return (
      <div className="min-h-screen bg-background-primary flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-dark-700 mb-2">
            No Project Found
          </h2>
          <p className="text-dark-500 mb-4">
            The requested project could not be loaded.
          </p>
          <button
            onClick={() => navigate('/project/new')}
            className="btn-primary"
          >
            Create New Project
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-background-primary">
      {/* Tab Navigation */}
      <div className="flex-shrink-0 bg-background-secondary border-b border-dark-200">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setActiveTab('chat')}
              className={`tab-button ${activeTab === 'chat' ? 'active' : 'inactive'}`}
            >
              💬 Chat
            </button>
            <button
              onClick={() => setActiveTab('editor')}
              className={`tab-button ${activeTab === 'editor' ? 'active' : 'inactive'}`}
            >
              📝 Editor
            </button>
            <button
              onClick={() => setActiveTab('preview')}
              className={`tab-button ${activeTab === 'preview' ? 'active' : 'inactive'}`}
            >
              👁️ Preview
            </button>
          </div>
          
          <div className="flex items-center gap-3">
            <span className="text-sm text-dark-500">
              {currentProject.name}
            </span>
            <div className="w-2 h-2 bg-green-400 rounded-full" title="Connected"></div>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-hidden">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default ProjectPage;