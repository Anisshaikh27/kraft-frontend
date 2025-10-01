import axios from 'axios';

// Create axios instance with base configuration
const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3001',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add session ID
apiClient.interceptors.request.use(
  (config) => {
    // Add session ID to headers if available
    const sessionId = localStorage.getItem('sessionId') || config.sessionId;
    if (sessionId) {
      config.headers['x-session-id'] = sessionId;
    }
    
    // Log request details in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`, {
        data: config.data,
        headers: config.headers,
        params: config.params
      });
    }
    
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    // Log response in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`, {
        status: response.status,
        data: response.data
      });
    }
    return response.data;
  },
  (error) => {
    // Enhanced error logging
    const requestInfo = error.config ? {
      method: error.config.method?.toUpperCase(),
      url: error.config.url,
      data: error.config.data
    } : {};
    
    console.error('API Error:', {
      message: error.message,
      request: requestInfo,
      response: error.response ? {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers
      } : null
    });
    
    // Create user-friendly error messages
    let errorMessage = 'An unexpected error occurred';
    
    if (error.response) {
      const status = error.response.status;
      const responseData = error.response.data;
      
      switch (status) {
        case 400:
          errorMessage = responseData?.message || responseData?.error || 'Invalid request data';
          if (responseData?.details) {
            errorMessage += `: ${responseData.details.map(d => d.message).join(', ')}`;
          }
          break;
        case 401:
          errorMessage = 'Authentication required. Please refresh the page.';
          break;
        case 403:
          errorMessage = 'Access denied. You do not have permission for this action.';
          break;
        case 404:
          errorMessage = 'The requested resource was not found.';
          break;
        case 429:
          errorMessage = 'Too many requests. Please wait a moment and try again.';
          break;
        case 500:
          errorMessage = 'Server error. Please try again later.';
          break;
        case 503:
          errorMessage = 'Service temporarily unavailable. Please try again later.';
          break;
        default:
          errorMessage = responseData?.message || `Server error (${status})`;
      }
    } else if (error.request) {
      errorMessage = 'Network error. Please check your connection and try again.';
    } else if (error.code === 'ECONNABORTED') {
      errorMessage = 'Request timeout. Please try again.';
    }
    
    const enhancedError = new Error(errorMessage);
    enhancedError.originalError = error;
    enhancedError.response = error.response;
    enhancedError.status = error.response?.status;
    
    return Promise.reject(enhancedError);
  }
);

// API methods with enhanced validation and error handling
const apiMethods = {
  // Health check
  healthCheck: async () => {
    return await apiClient.get('/health');
  },

  // AI endpoints
  generateCode: async (data) => {
    // Validate input data
    if (!data || !data.prompt) {
      throw new Error('Prompt is required for code generation');
    }
    
    return await apiClient.post('/api/ai/generate', {
      prompt: data.prompt,
      type: data.type || 'react',
      context: data.context || {}
    });
  },

  chatWithAI: async (messages) => {
    if (!messages || !Array.isArray(messages)) {
      throw new Error('Messages array is required');
    }
    
    return await apiClient.post('/api/ai/chat', { messages });
  },

  getAIModels: async () => {
    return await apiClient.get('/api/ai/models');
  },

  checkAIHealth: async () => {
    return await apiClient.get('/api/ai/health');
  },

  // Project endpoints with validation
  createProject: async (sessionId, projectData) => {
    // Validate inputs
    if (!sessionId) {
      throw new Error('Session ID is required');
    }
    
    // Set defaults for optional fields
    const data = {
      name: projectData?.name || 'New React Project',
      type: projectData?.type || 'react-app',
      description: projectData?.description || 'AI-generated React application',
      template: projectData?.template || 'default',
      ...projectData
    };
    
    console.log('Creating project with data:', data, 'sessionId:', sessionId);
    
    return await apiClient.post('/api/projects', data, {
      headers: { 'x-session-id': sessionId }
    });
  },

  getProject: async (projectId) => {
    // Validate project ID
    if (!projectId || projectId === 'undefined' || projectId === 'null') {
      throw new Error('Valid project ID is required');
    }
    
    // Ensure it's a string and has reasonable length
    const id = String(projectId).trim();
    if (id.length < 10) {
      throw new Error('Invalid project ID format');
    }
    
    console.log('Getting project with ID:', id);
    return await apiClient.get(`/api/projects/${id}`);
  },

  updateProject: async (projectId, updates) => {
    if (!projectId || projectId === 'undefined') {
      throw new Error('Valid project ID is required');
    }
    
    if (!updates || typeof updates !== 'object') {
      throw new Error('Update data is required');
    }
    
    return await apiClient.put(`/api/projects/${projectId}`, updates);
  },

  deleteProject: async (projectId) => {
    if (!projectId || projectId === 'undefined') {
      throw new Error('Valid project ID is required');
    }
    
    return await apiClient.delete(`/api/projects/${projectId}`);
  },

  getProjects: async (sessionId) => {
    if (!sessionId) {
      throw new Error('Session ID is required');
    }
    
    return await apiClient.get('/api/projects', {
      headers: { 'x-session-id': sessionId }
    });
  },

  cloneProject: async (projectId, name) => {
    if (!projectId || projectId === 'undefined') {
      throw new Error('Valid project ID is required');
    }
    
    return await apiClient.post(`/api/projects/${projectId}/clone`, { 
      name: name || 'Cloned Project' 
    });
  },

  exportProject: async (projectId) => {
    if (!projectId || projectId === 'undefined') {
      throw new Error('Valid project ID is required');
    }
    
    return await apiClient.get(`/api/projects/${projectId}/export`);
  },

  // File endpoints with validation
  getFiles: async (projectId) => {
    if (!projectId || projectId === 'undefined') {
      throw new Error('Valid project ID is required');
    }
    
    return await apiClient.get(`/api/files/${projectId}`);
  },

  getFile: async (projectId, filePath) => {
    if (!projectId || projectId === 'undefined') {
      throw new Error('Valid project ID is required');
    }
    
    if (!filePath) {
      throw new Error('File path is required');
    }
    
    return await apiClient.get(`/api/files/${projectId}/file`, {
      params: { path: filePath }
    });
  },

  createFile: async (projectId, fileData) => {
    if (!projectId || projectId === 'undefined') {
      throw new Error('Valid project ID is required');
    }
    
    if (!fileData || !fileData.path) {
      throw new Error('File data with path is required');
    }
    
    return await apiClient.post(`/api/files/${projectId}`, {
      path: fileData.path,
      content: fileData.content || '',
      language: fileData.language || 'javascript'
    });
  },

  updateFile: async (projectId, fileData) => {
    if (!projectId || projectId === 'undefined') {
      throw new Error('Valid project ID is required');
    }
    
    if (!fileData || !fileData.path) {
      throw new Error('File data with path is required');
    }
    
    return await apiClient.put(`/api/files/${projectId}`, {
      path: fileData.path,
      content: fileData.content || ''
    });
  },

  deleteFile: async (projectId, filePath) => {
    if (!projectId || projectId === 'undefined') {
      throw new Error('Valid project ID is required');
    }
    
    if (!filePath) {
      throw new Error('File path is required');
    }
    
    return await apiClient.delete(`/api/files/${projectId}`, {
      data: { path: filePath }
    });
  },

  renameFile: async (projectId, oldPath, newPath) => {
    if (!projectId || projectId === 'undefined') {
      throw new Error('Valid project ID is required');
    }
    
    if (!oldPath || !newPath) {
      throw new Error('Both old and new file paths are required');
    }
    
    return await apiClient.post(`/api/files/${projectId}/rename`, {
      oldPath,
      newPath
    });
  },
};

// Utility functions
export const utils = {
  // Generate session ID
  generateSessionId: () => {
    return 'session-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
  },

  // Store session ID
  storeSessionId: (sessionId) => {
    localStorage.setItem('sessionId', sessionId);
  },

  // Get stored session ID
  getSessionId: () => {
    let sessionId = localStorage.getItem('sessionId');
    if (!sessionId) {
      sessionId = utils.generateSessionId();
      utils.storeSessionId(sessionId);
    }
    return sessionId;
  },

  // Format file size
  formatFileSize: (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },

  // Get file language from extension
  getLanguageFromPath: (filePath) => {
    const extension = filePath.split('.').pop()?.toLowerCase();
    const languageMap = {
      'js': 'javascript',
      'jsx': 'javascript',
      'ts': 'typescript',
      'tsx': 'typescript',
      'html': 'html',
      'htm': 'html',
      'css': 'css',
      'scss': 'scss',
      'sass': 'sass',
      'json': 'json',
      'md': 'markdown',
      'py': 'python',
      'php': 'php',
      'rb': 'ruby',
      'go': 'go',
      'rs': 'rust',
      'java': 'java',
      'c': 'c',
      'cpp': 'cpp',
      'xml': 'xml',
      'yml': 'yaml',
      'yaml': 'yaml',
    };
    return languageMap[extension] || 'plaintext';
  },

  // Build file tree from flat file list
  buildFileTree: (files) => {
    const tree = {};
    
    files.forEach((file) => {
      const parts = file.path.split('/');
      let current = tree;
      
      parts.forEach((part, index) => {
        if (index === parts.length - 1) {
          // It's a file
          current[part] = {
            type: 'file',
            path: file.path,
            language: file.language,
            size: file.size,
            content: file.content
          };
        } else {
          // It's a directory
          if (!current[part]) {
            current[part] = {
              type: 'directory',
              children: {}
            };
          }
          current = current[part].children;
        }
      });
    });
    
    return tree;
  },

  // Debounce function
  debounce: (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  // Throttle function
  throttle: (func, limit) => {
    let inThrottle;
    return function(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }
};

export default apiMethods;