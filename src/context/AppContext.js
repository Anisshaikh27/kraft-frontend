import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import apiClient from '../services/apiClient';

// Initial state
const initialState = {
  // Project state
  currentProject: null,
  projects: [],
  
  // UI state
  activeTab: 'chat', // chat, editor, preview
  sidebarCollapsed: false,
  
  // File system state
  files: new Map(),
  activeFile: null,
  fileTree: {},
  
  // Chat state
  chatMessages: [],
  
  // Loading and error states
  isLoading: false,
  error: null,
  
  // Session
  sessionId: null,
};

// Action types
const ActionTypes = {
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  SET_SESSION_ID: 'SET_SESSION_ID',
  CLEAR_ERROR: 'CLEAR_ERROR',
  
  // Project actions
  SET_CURRENT_PROJECT: 'SET_CURRENT_PROJECT',
  ADD_PROJECT: 'ADD_PROJECT',
  UPDATE_PROJECT: 'UPDATE_PROJECT',
  SET_PROJECTS: 'SET_PROJECTS',
  
  // UI actions
  SET_ACTIVE_TAB: 'SET_ACTIVE_TAB',
  TOGGLE_SIDEBAR: 'TOGGLE_SIDEBAR',
  
  // File actions
  SET_FILES: 'SET_FILES',
  ADD_FILE: 'ADD_FILE',
  UPDATE_FILE: 'UPDATE_FILE',
  DELETE_FILE: 'DELETE_FILE',
  SET_ACTIVE_FILE: 'SET_ACTIVE_FILE',
  SET_FILE_TREE: 'SET_FILE_TREE',
  
  // Chat actions
  ADD_CHAT_MESSAGE: 'ADD_CHAT_MESSAGE',
  SET_CHAT_MESSAGES: 'SET_CHAT_MESSAGES',
  CLEAR_CHAT: 'CLEAR_CHAT',
};

// Reducer
function appReducer(state, action) {
  switch (action.type) {
    case ActionTypes.SET_LOADING:
      return { ...state, isLoading: action.payload };
    
    case ActionTypes.SET_ERROR:
      return { ...state, error: action.payload };
    
    case ActionTypes.CLEAR_ERROR:
      return { ...state, error: null };
    
    case ActionTypes.SET_SESSION_ID:
      return { ...state, sessionId: action.payload };
    
    case ActionTypes.SET_CURRENT_PROJECT:
      return { ...state, currentProject: action.payload };
    
    case ActionTypes.ADD_PROJECT:
      return { 
        ...state, 
        projects: [...state.projects, action.payload] 
      };
    
    case ActionTypes.UPDATE_PROJECT:
      return {
        ...state,
        projects: state.projects.map(p => 
          p.id === action.payload.id ? action.payload : p
        ),
        currentProject: state.currentProject?.id === action.payload.id 
          ? action.payload 
          : state.currentProject
      };
    
    case ActionTypes.SET_PROJECTS:
      return { ...state, projects: action.payload };
    
    case ActionTypes.SET_ACTIVE_TAB:
      return { ...state, activeTab: action.payload };
    
    case ActionTypes.TOGGLE_SIDEBAR:
      return { ...state, sidebarCollapsed: !state.sidebarCollapsed };
    
    case ActionTypes.SET_FILES:
      return { ...state, files: new Map(action.payload) };
    
    case ActionTypes.ADD_FILE:
      const newFiles = new Map(state.files);
      newFiles.set(action.payload.path, action.payload);
      return { ...state, files: newFiles };
    
    case ActionTypes.UPDATE_FILE:
      const updatedFiles = new Map(state.files);
      if (updatedFiles.has(action.payload.path)) {
        updatedFiles.set(action.payload.path, {
          ...updatedFiles.get(action.payload.path),
          ...action.payload.updates
        });
      }
      return { ...state, files: updatedFiles };
    
    case ActionTypes.DELETE_FILE:
      const filteredFiles = new Map(state.files);
      filteredFiles.delete(action.payload);
      return { 
        ...state, 
        files: filteredFiles,
        activeFile: state.activeFile === action.payload ? null : state.activeFile
      };
    
    case ActionTypes.SET_ACTIVE_FILE:
      return { ...state, activeFile: action.payload };
    
    case ActionTypes.SET_FILE_TREE:
      return { ...state, fileTree: action.payload };
    
    case ActionTypes.ADD_CHAT_MESSAGE:
      return { 
        ...state, 
        chatMessages: [...state.chatMessages, action.payload] 
      };
    
    case ActionTypes.SET_CHAT_MESSAGES:
      return { ...state, chatMessages: action.payload };
    
    case ActionTypes.CLEAR_CHAT:
      return { ...state, chatMessages: [] };
    
    default:
      return state;
  }
}

// Create contexts
const AppStateContext = createContext();
const AppActionsContext = createContext();

// Provider component
export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, {
    ...initialState,
    sessionId: uuidv4(),
  });

  // Actions
  const actions = {
    // Utility actions
    setLoading: useCallback((loading) => {
      dispatch({ type: ActionTypes.SET_LOADING, payload: loading });
    }, []),

    setError: useCallback((error) => {
      dispatch({ type: ActionTypes.SET_ERROR, payload: error });
    }, []),

    clearError: useCallback(() => {
      dispatch({ type: ActionTypes.CLEAR_ERROR });
    }, []),

    // Project actions with enhanced error handling
    createProject: useCallback(async (projectData) => {
      try {
        dispatch({ type: ActionTypes.SET_LOADING, payload: true });
        dispatch({ type: ActionTypes.CLEAR_ERROR });
        
        console.log('Creating project with data:', projectData);
        console.log('Using session ID:', state.sessionId);
        
        const response = await apiClient.createProject(state.sessionId, projectData);
        console.log('Project creation response:', response);
        
        // Validate response structure
        if (!response) {
          throw new Error('No response received from server');
        }
        
        // Handle different response structures
        let project;
        if (response.data && response.data.project) {
          project = response.data.project;
        } else if (response.project) {
          project = response.project;
        } else if (response.id) {
          project = response;
        } else {
          console.error('Unexpected response structure:', response);
          throw new Error('Invalid response structure from server');
        }
        
        // Validate project has required fields
        if (!project.id) {
          console.error('Project missing ID:', project);
          throw new Error('Project created but no ID returned');
        }
        
        dispatch({ type: ActionTypes.ADD_PROJECT, payload: project });
        dispatch({ type: ActionTypes.SET_CURRENT_PROJECT, payload: project });
        
        console.log('Project successfully created with ID:', project.id);
        return project;
      } catch (error) {
        console.error('Create project error:', error);
        const errorMessage = error.response?.data?.message || error.message || 'Failed to create project';
        dispatch({ type: ActionTypes.SET_ERROR, payload: errorMessage });
        throw error;
      } finally {
        dispatch({ type: ActionTypes.SET_LOADING, payload: false });
      }
    }, [state.sessionId]),

    loadProject: useCallback(async (projectId) => {
      // Validate projectId before making request
      if (!projectId || projectId === 'undefined' || projectId === 'null') {
        console.error('Invalid project ID provided:', projectId);
        throw new Error('Invalid project ID');
      }

      try {
        dispatch({ type: ActionTypes.SET_LOADING, payload: true });
        dispatch({ type: ActionTypes.CLEAR_ERROR });
        
        console.log('Loading project with ID:', projectId);
        const response = await apiClient.getProject(projectId);
        console.log('Project load response:', response);
        
        // Handle different response structures
        let project, filesData;
        if (response.data) {
          project = response.data.project || response.data;
          filesData = response.data.files || [];
        } else {
          project = response.project || response;
          filesData = response.files || [];
        }
        
        if (!project || !project.id) {
          throw new Error('Invalid project data received');
        }
        
        dispatch({ type: ActionTypes.SET_CURRENT_PROJECT, payload: project });
        
        // Load project files
        const filesMap = new Map();
        if (Array.isArray(filesData)) {
          filesData.forEach(file => {
            filesMap.set(file.path, file);
          });
        }
        dispatch({ type: ActionTypes.SET_FILES, payload: filesMap });
        
        return { project, files: filesData };
      } catch (error) {
        console.error('Load project error:', error);
        const errorMessage = error.response?.data?.message || error.message || 'Failed to load project';
        dispatch({ type: ActionTypes.SET_ERROR, payload: errorMessage });
        throw error;
      } finally {
        dispatch({ type: ActionTypes.SET_LOADING, payload: false });
      }
    }, []),

    loadProjects: useCallback(async () => {
      try {
        console.log('Loading projects for session:', state.sessionId);
        const response = await apiClient.getProjects(state.sessionId);
        const projects = response.data || response;
        dispatch({ type: ActionTypes.SET_PROJECTS, payload: projects });
        return projects;
      } catch (error) {
        console.error('Load projects error:', error);
        const errorMessage = error.response?.data?.message || error.message || 'Failed to load projects';
        dispatch({ type: ActionTypes.SET_ERROR, payload: errorMessage });
        throw error;
      }
    }, [state.sessionId]),

    // UI actions
    setActiveTab: useCallback((tab) => {
      dispatch({ type: ActionTypes.SET_ACTIVE_TAB, payload: tab });
    }, []),

    toggleSidebar: useCallback(() => {
      dispatch({ type: ActionTypes.TOGGLE_SIDEBAR });
    }, []),

    // File actions with validation
    createFile: useCallback(async (filePath, content = '', language = 'javascript') => {
      if (!state.currentProject) {
        throw new Error('No project selected');
      }
      if (!filePath) {
        throw new Error('File path is required');
      }

      try {
        const file = await apiClient.createFile(state.currentProject.id, {
          path: filePath,
          content,
          language
        });
        dispatch({ type: ActionTypes.ADD_FILE, payload: file });
        dispatch({ type: ActionTypes.SET_ACTIVE_FILE, payload: filePath });
        return file;
      } catch (error) {
        console.error('Create file error:', error);
        const errorMessage = error.response?.data?.message || error.message || 'Failed to create file';
        dispatch({ type: ActionTypes.SET_ERROR, payload: errorMessage });
        throw error;
      }
    }, [state.currentProject]),

    updateFile: useCallback(async (filePath, content) => {
      if (!state.currentProject) {
        throw new Error('No project selected');
      }
      if (!filePath) {
        throw new Error('File path is required');
      }

      try {
        const file = await apiClient.updateFile(state.currentProject.id, {
          path: filePath,
          content
        });
        dispatch({ 
          type: ActionTypes.UPDATE_FILE, 
          payload: { path: filePath, updates: file } 
        });
        return file;
      } catch (error) {
        console.error('Update file error:', error);
        const errorMessage = error.response?.data?.message || error.message || 'Failed to update file';
        dispatch({ type: ActionTypes.SET_ERROR, payload: errorMessage });
        throw error;
      }
    }, [state.currentProject]),

    deleteFile: useCallback(async (filePath) => {
      if (!state.currentProject) {
        throw new Error('No project selected');
      }
      if (!filePath) {
        throw new Error('File path is required');
      }

      try {
        await apiClient.deleteFile(state.currentProject.id, filePath);
        dispatch({ type: ActionTypes.DELETE_FILE, payload: filePath });
      } catch (error) {
        console.error('Delete file error:', error);
        const errorMessage = error.response?.data?.message || error.message || 'Failed to delete file';
        dispatch({ type: ActionTypes.SET_ERROR, payload: errorMessage });
        throw error;
      }
    }, [state.currentProject]),

    setActiveFile: useCallback((filePath) => {
      dispatch({ type: ActionTypes.SET_ACTIVE_FILE, payload: filePath });
    }, []),

    // FIXED: Chat actions with proper file handling
    sendChatMessage: useCallback(async (message) => {
      if (!message.trim()) {
        throw new Error('Message cannot be empty');
      }

      const userMessage = {
        id: uuidv4(),
        role: 'user',
        content: message,
        timestamp: new Date().toISOString()
      };

      dispatch({ type: ActionTypes.ADD_CHAT_MESSAGE, payload: userMessage });

      try {
        dispatch({ type: ActionTypes.SET_LOADING, payload: true });
        
        console.log('Sending chat message:', message);
        
        const response = await apiClient.generateCode({
          prompt: message,
          type: 'react',
          context: {
            projectType: state.currentProject?.type || 'react-app',
            currentFiles: Array.from(state.files.values())
          }
        });

        console.log('🎯 AI Response received:', response);

        // CRITICAL: Handle the response structure correctly
        let aiResponseData;
        if (response.success && response.data) {
          aiResponseData = response.data;
        } else if (response.data) {
          aiResponseData = response.data;
        } else {
          aiResponseData = response;
        }

        console.log('📝 Processing AI response data:', aiResponseData);

        // Create AI message
        const aiMessage = {
          id: uuidv4(),
          role: 'assistant',
          content: aiResponseData.explanation || aiResponseData.content || 'Code generated successfully',
          files: aiResponseData.files || [],
          timestamp: new Date().toISOString()
        };

        dispatch({ type: ActionTypes.ADD_CHAT_MESSAGE, payload: aiMessage });

        // CRITICAL: Process and add files to the project
        if (aiResponseData.files && Array.isArray(aiResponseData.files) && aiResponseData.files.length > 0) {
          console.log(`📁 Processing ${aiResponseData.files.length} files:`, aiResponseData.files.map(f => f.path));
          
          for (const file of aiResponseData.files) {
            if (file.path && file.content) {
              console.log(`📄 Adding file: ${file.path} (${file.content.length} chars)`);
              
              // Add file to the project's file system
              const fileData = {
                path: file.path,
                content: file.content,
                language: file.language || 'javascript',
                operation: file.operation || 'create',
                size: file.content.length,
                lastModified: new Date().toISOString()
              };
              
              dispatch({ type: ActionTypes.ADD_FILE, payload: fileData });
            } else {
              console.warn('Invalid file data:', file);
            }
          }
          
          // Set the first generated file as active and switch to editor tab
          if (aiResponseData.files[0] && aiResponseData.files[0].path) {
            console.log('🎯 Setting active file:', aiResponseData.files[0].path);
            dispatch({ type: ActionTypes.SET_ACTIVE_FILE, payload: aiResponseData.files[0].path });
            dispatch({ type: ActionTypes.SET_ACTIVE_TAB, payload: 'editor' });
          }
        } else {
          console.warn('⚠️ No files found in AI response');
        }

        console.log('✅ Chat message processed successfully');
        return response;
      } catch (error) {
        console.error('❌ Chat message error:', error);
        const errorMessage = error.response?.data?.message || error.message || 'Failed to generate code';
        
        const errorMsg = {
          id: uuidv4(),
          role: 'assistant',
          content: `Error: ${errorMessage}`,
          timestamp: new Date().toISOString(),
          isError: true
        };
        dispatch({ type: ActionTypes.ADD_CHAT_MESSAGE, payload: errorMsg });
        throw error;
      } finally {
        dispatch({ type: ActionTypes.SET_LOADING, payload: false });
      }
    }, [state.currentProject, state.files]),

    clearChat: useCallback(() => {
      dispatch({ type: ActionTypes.CLEAR_CHAT });
    }, []),
  };

  return (
    <AppStateContext.Provider value={state}>
      <AppActionsContext.Provider value={actions}>
        {children}
      </AppActionsContext.Provider>
    </AppStateContext.Provider>
  );
}

// Custom hooks
export function useAppState() {
  const state = useContext(AppStateContext);
  if (!state) {
    throw new Error('useAppState must be used within an AppProvider');
  }
  return state;
}

export function useAppActions() {
  const actions = useContext(AppActionsContext);
  if (!actions) {
    throw new Error('useAppActions must be used within an AppProvider');
  }
  return actions;
}