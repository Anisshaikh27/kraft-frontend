import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAppState, useAppActions } from '../context/AppContext';
import ChatPanel from '../components/chat/ChatPanel';
import CodeEditor from '../components/editor/CodeEditor';
import PreviewPanel from '../components/preview/PreviewPanel';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ErrorMessage from '../components/ui/ErrorMessage';
import apiClient from '../services/apiClient';

const ProjectPage = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { currentProject, isLoading, error, activeTab, user } = useAppState();
  const { setCurrentProject, loadProject, setActiveTab, setLoading, setError, setFiles, addChatMessage, clearChat } = useAppActions();
  
  const [isInitializing, setIsInitializing] = useState(false);

  useEffect(() => {
    const initializeProject = async () => {
      // If no projectId is provided, redirect back to home
      if (!projectId || projectId === 'undefined') {
        console.log('No project ID provided, redirecting to home');
        navigate('/', { replace: true });
        return;
      }

      // We have a valid projectId - load the existing project
      try {
        setIsInitializing(true);
        setLoading(true);
        console.log('Loading project with ID:', projectId);
        
        const response = await apiClient.getProject(projectId);
        const project = response.project || response;
        
        console.log('Project loaded:', project);
        setCurrentProject(project);
        
        // Step 2: Load files for this project
        try {
          const filesResponse = await apiClient.getFiles(projectId);
          const projectFiles = filesResponse.files || filesResponse.data || [];
          console.log(`Loaded ${projectFiles.length} files for project`);
          
          // Update context with loaded files
          setFiles(projectFiles);
        } catch (filesError) {
          console.error('Failed to load files:', filesError);
          // Don't fail the whole process if file loading fails
          setFiles([]);
        }

        // Step 3: Clear old chat messages and load chat history for this project
        console.log('Clearing old chat messages...');
        clearChat(); // Clear previous project's chat
        
        try {
          const chatResponse = await apiClient.getChatMessages(projectId);
          const messages = chatResponse.messages || chatResponse.data || [];
          console.log(`Loaded ${messages.length} chat messages for project`);
          
          // Add each message to the context (in order)
          for (const msg of messages) {
            addChatMessage({
              id: msg._id || Date.now(),
              type: msg.type,
              content: msg.content,
              timestamp: new Date(msg.createdAt),
            });
          }
          console.log('✓ Chat messages loaded successfully');
        } catch (chatError) {
          console.warn('Could not load chat history:', chatError);
          // Don't fail if chat loading fails - it's not critical
        }
        
      } catch (error) {
        console.error('Failed to load project:', error);
        const errorMsg = error.message || 'Failed to load project';
        setError(errorMsg);
        
        // After 2 seconds, redirect to home
        setTimeout(() => {
          navigate('/', { replace: true });
        }, 2000);
      } finally {
        setIsInitializing(false);
        setLoading(false);
      }
    };

    // Only initialize if we don't already have the right project loaded
    if (!currentProject || (projectId && currentProject._id !== projectId && currentProject.id !== projectId)) {
      initializeProject();
    }
  }, [projectId, currentProject, navigate, setCurrentProject, setLoading, setError, user]);

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
          onRetry={() => {
            // Clear error and try creating new project
            navigate('/project/new', { replace: true });
            window.location.reload();
          }}
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
            onClick={() => navigate('/project/new', { replace: true })}
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
            <span className="text-xs text-dark-400">
              ID: {currentProject.id}
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