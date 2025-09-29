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
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    const errorMessage = error.response?.data?.message || error.message || 'An error occurred';
    
    // Handle different error types
    if (error.response?.status === 401) {
      // Handle authentication errors
      console.error('Authentication error:', errorMessage);
    } else if (error.response?.status === 429) {
      // Handle rate limiting
      console.error('Rate limit exceeded:', errorMessage);
    } else if (error.response?.status >= 500) {
      // Handle server errors
      console.error('Server error:', errorMessage);
    }
    
    return Promise.reject(new Error(errorMessage));
  }
);

// API methods
const apiMethods = {
  // Health check
  healthCheck: async () => {
    return await apiClient.get('/health');
  },

  // AI endpoints
  generateCode: async (data) => {
    return await apiClient.post('/api/ai/generate', data);
  },

  chatWithAI: async (messages) => {
    return await apiClient.post('/api/ai/chat', { messages });
  },

  getAIModels: async () => {
    return await apiClient.get('/api/ai/models');
  },

  checkAIHealth: async () => {
    return await apiClient.get('/api/ai/health');
  },

  // Project endpoints
  createProject: async (sessionId, projectData) => {
    return await apiClient.post('/api/projects', projectData, {
      headers: { 'x-session-id': sessionId }
    });
  },

  getProject: async (projectId) => {
    return await apiClient.get(`/api/projects/${projectId}`);
  },

  updateProject: async (projectId, updates) => {
    return await apiClient.put(`/api/projects/${projectId}`, updates);
  },

  deleteProject: async (projectId) => {
    return await apiClient.delete(`/api/projects/${projectId}`);
  },

  getProjects: async (sessionId) => {
    return await apiClient.get('/api/projects', {
      headers: { 'x-session-id': sessionId }
    });
  },

  cloneProject: async (projectId, name) => {
    return await apiClient.post(`/api/projects/${projectId}/clone`, { name });
  },

  exportProject: async (projectId) => {
    return await apiClient.get(`/api/projects/${projectId}/export`);
  },

  // File endpoints
  getFiles: async (projectId) => {
    return await apiClient.get(`/api/files/${projectId}`);
  },

  getFile: async (projectId, filePath) => {
    return await apiClient.get(`/api/files/${projectId}/file`, {
      params: { path: filePath }
    });
  },

  createFile: async (projectId, fileData) => {
    return await apiClient.post(`/api/files/${projectId}`, fileData);
  },

  updateFile: async (projectId, fileData) => {
    return await apiClient.put(`/api/files/${projectId}`, fileData);
  },

  deleteFile: async (projectId, filePath) => {
    return await apiClient.delete(`/api/files/${projectId}`, {
      data: { path: filePath }
    });
  },

  renameFile: async (projectId, oldPath, newPath) => {
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