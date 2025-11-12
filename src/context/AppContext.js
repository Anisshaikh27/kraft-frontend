import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import apiClient from '../services/apiClient';

// Initial state
const initialState = {
  // User & Auth
  user: null,
  token: null,

  // Project state
  currentProject: null,
  projects: [],

  // File state
  files: [],
  activeFile: null,

  // UI state
  activeTab: 'chat', // 'chat', 'editor', 'preview'
  sidebarCollapsed: false,

  // Chat state
  chatMessages: [],

  // Loading and error
  isLoading: false,
  error: null,
};

// Action types
const ActionTypes = {
  // Auth actions
  SET_USER: 'SET_USER',
  SET_TOKEN: 'SET_TOKEN',
  LOGOUT: 'LOGOUT',

  // Loading & Error
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',

  // Project actions
  SET_PROJECTS: 'SET_PROJECTS',
  SET_CURRENT_PROJECT: 'SET_CURRENT_PROJECT',
  ADD_PROJECT: 'ADD_PROJECT',
  UPDATE_PROJECT: 'UPDATE_PROJECT',
  DELETE_PROJECT: 'DELETE_PROJECT',

  // File actions
  SET_FILES: 'SET_FILES',
  ADD_FILE: 'ADD_FILE',
  UPDATE_FILE: 'UPDATE_FILE',
  DELETE_FILE: 'DELETE_FILE',
  SET_ACTIVE_FILE: 'SET_ACTIVE_FILE',

  // UI actions
  SET_ACTIVE_TAB: 'SET_ACTIVE_TAB',
  TOGGLE_SIDEBAR: 'TOGGLE_SIDEBAR',

  // Chat actions
  ADD_CHAT_MESSAGE: 'ADD_CHAT_MESSAGE',
  CLEAR_CHAT: 'CLEAR_CHAT',
};

// Reducer
function appReducer(state, action) {
  switch (action.type) {
    case ActionTypes.SET_USER:
      return { ...state, user: action.payload };

    case ActionTypes.SET_TOKEN:
      return { ...state, token: action.payload };

    case ActionTypes.LOGOUT:
      return {
        ...initialState,
        token: null,
        user: null,
      };

    case ActionTypes.SET_LOADING:
      return { ...state, isLoading: action.payload };

    case ActionTypes.SET_ERROR:
      return { ...state, error: action.payload };

    case ActionTypes.CLEAR_ERROR:
      return { ...state, error: null };

    case ActionTypes.SET_PROJECTS:
      return { ...state, projects: action.payload };

    case ActionTypes.ADD_PROJECT:
      return {
        ...state,
        projects: [action.payload, ...state.projects],
      };

    case ActionTypes.SET_CURRENT_PROJECT:
      return { ...state, currentProject: action.payload };

    case ActionTypes.UPDATE_PROJECT:
      return {
        ...state,
        projects: state.projects.map((p) =>
          p._id === action.payload._id ? action.payload : p
        ),
        currentProject:
          state.currentProject?._id === action.payload._id
            ? action.payload
            : state.currentProject,
      };

    case ActionTypes.DELETE_PROJECT:
      return {
        ...state,
        projects: state.projects.filter((p) => p._id !== action.payload),
        currentProject:
          state.currentProject?._id === action.payload
            ? null
            : state.currentProject,
      };

    case ActionTypes.SET_FILES:
      return { ...state, files: action.payload };

    case ActionTypes.ADD_FILE:
      return {
        ...state,
        files: [...state.files, action.payload],
      };

    case ActionTypes.UPDATE_FILE:
      return {
        ...state,
        files: state.files.map((f) =>
          f.path === action.payload.path ? action.payload : f
        ),
        activeFile:
          state.activeFile?.path === action.payload.path
            ? action.payload
            : state.activeFile,
      };

    case ActionTypes.DELETE_FILE:
      return {
        ...state,
        files: state.files.filter((f) => f.path !== action.payload),
        activeFile:
          state.activeFile?.path === action.payload ? null : state.activeFile,
      };

    case ActionTypes.SET_ACTIVE_FILE:
      return { ...state, activeFile: action.payload };

    case ActionTypes.SET_ACTIVE_TAB:
      return { ...state, activeTab: action.payload };

    case ActionTypes.TOGGLE_SIDEBAR:
      return { ...state, sidebarCollapsed: !state.sidebarCollapsed };

    case ActionTypes.ADD_CHAT_MESSAGE:
      return {
        ...state,
        chatMessages: [...state.chatMessages, action.payload],
      };

    case ActionTypes.CLEAR_CHAT:
      return { ...state, chatMessages: [] };

    default:
      return state;
  }
}

// Create context
const AppContext = createContext();

// Provider component
export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Auth actions
  const setUser = useCallback((user) => {
    dispatch({ type: ActionTypes.SET_USER, payload: user });
  }, []);

  const setToken = useCallback((token) => {
    dispatch({ type: ActionTypes.SET_TOKEN, payload: token });
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }, []);

  const logout = useCallback(() => {
    dispatch({ type: ActionTypes.LOGOUT });
    localStorage.removeItem('token');
  }, []);

  // Loading & Error
  const setLoading = useCallback((isLoading) => {
    dispatch({ type: ActionTypes.SET_LOADING, payload: isLoading });
  }, []);

  const setError = useCallback((error) => {
    dispatch({ type: ActionTypes.SET_ERROR, payload: error });
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: ActionTypes.CLEAR_ERROR });
  }, []);

  // Project actions
  const setProjects = useCallback((projects) => {
    dispatch({ type: ActionTypes.SET_PROJECTS, payload: projects });
  }, []);

  const setCurrentProject = useCallback((project) => {
    dispatch({ type: ActionTypes.SET_CURRENT_PROJECT, payload: project });
  }, []);

  const addProject = useCallback((project) => {
    dispatch({ type: ActionTypes.ADD_PROJECT, payload: project });
  }, []);

  const updateProject = useCallback((project) => {
    dispatch({ type: ActionTypes.UPDATE_PROJECT, payload: project });
  }, []);

  const deleteProject = useCallback((projectId) => {
    dispatch({ type: ActionTypes.DELETE_PROJECT, payload: projectId });
  }, []);

  // File actions
  const setFiles = useCallback((files) => {
    dispatch({ type: ActionTypes.SET_FILES, payload: files });
  }, []);

  const addFile = useCallback((file) => {
    dispatch({ type: ActionTypes.ADD_FILE, payload: file });
  }, []);

  const updateFile = useCallback((file) => {
    dispatch({ type: ActionTypes.UPDATE_FILE, payload: file });
  }, []);

  const deleteFile = useCallback((filePath) => {
    dispatch({ type: ActionTypes.DELETE_FILE, payload: filePath });
  }, []);

  const setActiveFile = useCallback((file) => {
    dispatch({ type: ActionTypes.SET_ACTIVE_FILE, payload: file });
  }, []);

  // UI actions
  const setActiveTab = useCallback((tab) => {
    dispatch({ type: ActionTypes.SET_ACTIVE_TAB, payload: tab });
  }, []);

  const toggleSidebar = useCallback(() => {
    dispatch({ type: ActionTypes.TOGGLE_SIDEBAR });
  }, []);

  // Initialize token from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken && !state.token) {
      dispatch({ type: ActionTypes.SET_TOKEN, payload: storedToken });
    }
  }, []);

  // Chat actions
  const addChatMessage = useCallback((message) => {
    dispatch({ type: ActionTypes.ADD_CHAT_MESSAGE, payload: message });
  }, []);

  const clearChat = useCallback(() => {
    dispatch({ type: ActionTypes.CLEAR_CHAT });
  }, []);

  // Send chat message (user input) and generate code response
  const sendChatMessage = useCallback(
    async (userMessage) => {
      if (!state.currentProject) {
        throw new Error('No project selected');
      }

      const projectId = state.currentProject._id || state.currentProject.id;

      // Add user message to chat
      const userMsg = {
        id: `msg-${Date.now()}-user`,
        type: 'user',
        content: userMessage,
        timestamp: new Date(),
      };
      addChatMessage(userMsg);

      // Save user message to backend
      try {
        await apiClient.saveChatMessage(projectId, 'user', userMessage);
      } catch (error) {
        console.error('Failed to save user message:', error);
      }

      // Set loading state
      setLoading(true);

      try {
        // Generate code from AI
        console.log('Generating code for:', userMessage);
        const aiResponse = await apiClient.generateCode(userMessage, 'react', {
          projectId,
          previousMessages: state.chatMessages,
        });

        console.log('AI Response:', aiResponse);

        // Extract generated content and files
        const responseData = aiResponse.data || aiResponse;
        const generatedCode = responseData.content || '';
        const generatedFiles = responseData.files || [];
        const assistantMessage = responseData.explanation || 'Code generated successfully!';

        // Add assistant response to chat
        const assistantMsg = {
          id: `msg-${Date.now()}-assistant`,
          type: 'assistant',
          content: assistantMessage,
          timestamp: new Date(),
          code: generatedCode,
          filesCount: generatedFiles.length,
        };
        addChatMessage(assistantMsg);

        // Save assistant message to backend
        try {
          await apiClient.saveChatMessage(projectId, 'assistant', assistantMessage, {
            code: generatedCode,
            filesCount: generatedFiles.length,
          });
        } catch (error) {
          console.error('Failed to save assistant message:', error);
        }

        // Save generated files
        if (generatedFiles && generatedFiles.length > 0) {
          try {
            console.log(`Saving ${generatedFiles.length} generated files...`);
            for (const file of generatedFiles) {
              try {
                await apiClient.createFile(
                  projectId,
                  file.path,
                  file.content,
                  file.language || 'javascript'
                );
                console.log(`✓ Saved file: ${file.path}`);
              } catch (error) {
                console.error(`Failed to save file ${file.path}:`, error);
              }
            }
            
            // Reload files to update the UI
            try {
              const filesResponse = await apiClient.getFiles(projectId);
              const projectFiles = filesResponse.files || filesResponse.data || [];
              setFiles(projectFiles);
              console.log(`✓ Reloaded ${projectFiles.length} files`);
              
              // Automatically switch to preview tab
              setActiveTab('preview');
            } catch (error) {
              console.error('Failed to reload files:', error);
            }
          } catch (error) {
            console.error('Failed to save generated files:', error);
          }
        }

        return { success: true, assistantMsg };
      } catch (error) {
        console.error('Failed to generate code:', error);
        
        // Add error message to chat
        const errorMsg = {
          id: `msg-${Date.now()}-error`,
          type: 'error',
          content: error.message || 'Failed to generate code. Please try again.',
          timestamp: new Date(),
        };
        addChatMessage(errorMsg);

        throw error;
      } finally {
        setLoading(false);
      }
    },
    [state.currentProject, state.chatMessages, addChatMessage, setLoading, setFiles, setActiveTab]
  );

  // Helper function to parse generated files from code
  const parseGeneratedFiles = (generatedCode) => {
    // This is a placeholder - implement based on your code generation format
    // For now, return empty array
    // You can enhance this to parse files from JSON or other format in the generated code
    const files = [];
    
    // Example: If your AI returns JSON with file definitions
    try {
      const parsed = JSON.parse(generatedCode);
      if (parsed.files && Array.isArray(parsed.files)) {
        return parsed.files;
      }
    } catch (e) {
      // Not JSON, continue with other parsing methods
    }

    return files;
  };

  // API-integrated actions
  const loadProjects = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiClient.getProjects();
      const projects = response.projects || response.data || response;
      setProjects(projects);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [setLoading, setProjects, setError]);

  const loadProjectFiles = useCallback(
    async (projectId) => {
      setLoading(true);
      try {
        const response = await apiClient.getFiles(projectId);
        const files = response.files || response.data || response;
        setFiles(files);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    },
    [setLoading, setFiles, setError]
  );

  const value = {
    // State
    state,

    // Auth
    setUser,
    setToken,
    logout,

    // Loading & Error
    setLoading,
    setError,
    clearError,

    // Projects
    setProjects,
    setCurrentProject,
    addProject,
    updateProject,
    deleteProject,
    loadProjects,

    // Files
    setFiles,
    addFile,
    updateFile,
    deleteFile,
    setActiveFile,
    loadProjectFiles,

    // UI
    setActiveTab,
    toggleSidebar,

    // Chat
    addChatMessage,
    clearChat,
    sendChatMessage,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

// Hook to use context
export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
}

// Convenience hooks for backward compatibility
export function useAppState() {
  const context = useAppContext();
  return context.state;
}

export function useAppActions() {
  const context = useAppContext();
  // Return all actions from context (excluding state)
  const { state, ...actions } = context;
  return actions;
}