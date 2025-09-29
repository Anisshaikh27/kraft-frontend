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

    // Project actions
    createProject: useCallback(async (projectData) => {
      try {
        actions.setLoading(true);
        const project = await apiClient.createProject(state.sessionId, projectData);
        dispatch({ type: ActionTypes.ADD_PROJECT, payload: project });
        dispatch({ type: ActionTypes.SET_CURRENT_PROJECT, payload: project });
        return project;
      } catch (error) {
        actions.setError(error.message);
        throw error;
      } finally {
        actions.setLoading(false);
      }
    }, [state.sessionId]),

    loadProject: useCallback(async (projectId) => {
      try {
        actions.setLoading(true);
        const project = await apiClient.getProject(projectId);
        dispatch({ type: ActionTypes.SET_CURRENT_PROJECT, payload: project.project });
        
        // Load project files
        const filesData = project.files || [];
        const filesMap = new Map();
        filesData.forEach(file => {
          filesMap.set(file.path, file);
        });
        dispatch({ type: ActionTypes.SET_FILES, payload: filesMap });
        
        return project;
      } catch (error) {
        actions.setError(error.message);
        throw error;
      } finally {
        actions.setLoading(false);
      }
    }, []),

    loadProjects: useCallback(async () => {
      try {
        const projects = await apiClient.getProjects(state.sessionId);
        dispatch({ type: ActionTypes.SET_PROJECTS, payload: projects });
        return projects;
      } catch (error) {
        actions.setError(error.message);
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

    // File actions
    createFile: useCallback(async (filePath, content = '', language = 'javascript') => {
      if (!state.currentProject) return;

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
        actions.setError(error.message);
        throw error;
      }
    }, [state.currentProject]),

    updateFile: useCallback(async (filePath, content) => {
      if (!state.currentProject) return;

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
        actions.setError(error.message);
        throw error;
      }
    }, [state.currentProject]),

    deleteFile: useCallback(async (filePath) => {
      if (!state.currentProject) return;

      try {
        await apiClient.deleteFile(state.currentProject.id, filePath);
        dispatch({ type: ActionTypes.DELETE_FILE, payload: filePath });
      } catch (error) {
        actions.setError(error.message);
        throw error;
      }
    }, [state.currentProject]),

    setActiveFile: useCallback((filePath) => {
      dispatch({ type: ActionTypes.SET_ACTIVE_FILE, payload: filePath });
    }, []),

    // Chat actions
    sendChatMessage: useCallback(async (message) => {
      const userMessage = {
        id: uuidv4(),
        role: 'user',
        content: message,
        timestamp: new Date().toISOString()
      };

      dispatch({ type: ActionTypes.ADD_CHAT_MESSAGE, payload: userMessage });

      try {
        actions.setLoading(true);
        const response = await apiClient.generateCode({
          prompt: message,
          type: 'react',
          context: {
            projectType: state.currentProject?.type || 'react-app',
            currentFiles: Array.from(state.files.values())
          }
        });

        const aiMessage = {
          id: uuidv4(),
          role: 'assistant',
          content: response.explanation || response.content,
          files: response.files || [],
          timestamp: new Date().toISOString()
        };

        dispatch({ type: ActionTypes.ADD_CHAT_MESSAGE, payload: aiMessage });

        // Auto-create files if they don't exist
        if (response.files && response.files.length > 0) {
          for (const file of response.files) {
            if (!state.files.has(file.path)) {
              dispatch({ type: ActionTypes.ADD_FILE, payload: file });
            } else {
              dispatch({ 
                type: ActionTypes.UPDATE_FILE, 
                payload: { path: file.path, updates: { content: file.content } } 
              });
            }
          }
          
          // Set the first generated file as active
          dispatch({ type: ActionTypes.SET_ACTIVE_FILE, payload: response.files[0].path });
        }

        return response;
      } catch (error) {
        const errorMessage = {
          id: uuidv4(),
          role: 'assistant',
          content: `Error: ${error.message}`,
          timestamp: new Date().toISOString(),
          isError: true
        };
        dispatch({ type: ActionTypes.ADD_CHAT_MESSAGE, payload: errorMessage });
        throw error;
      } finally {
        actions.setLoading(false);
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