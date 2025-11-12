/**
 * API Client - Kraft AI Backend Integration
 * Centralized API communication with JWT authentication
 */

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

class APIClient {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Get JWT token from localStorage
  getToken() {
    return localStorage.getItem('token');
  }

  // Set JWT token
  setToken(token) {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }

  // Build headers with JWT
  getHeaders(includeAuth = true) {
    const headers = {
      'Content-Type': 'application/json',
    };

    if (includeAuth) {
      const token = this.getToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    return headers;
  }

  // Make API request
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: this.getHeaders(options.auth !== false),
      ...options,
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw {
          status: response.status,
          message: errorData.error || `Error: ${response.status}`,
          data: errorData,
        };
      }

      return await response.json();
    } catch (error) {
      console.error(`API Request Failed: ${endpoint}`, error);
      throw error;
    }
  }

  // ============ AUTH ENDPOINTS ============

  register(username, email, password, confirmPassword) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, email, password, confirmPassword }),
      auth: false,
    });
  }

  login(email, password) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
      auth: false,
    });
  }

  getProfile() {
    return this.request('/auth/profile', {
      method: 'GET',
    });
  }

  updateProfile(username, bio, avatar) {
    return this.request('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify({ username, bio, avatar }),
    });
  }

  // ============ PROJECT ENDPOINTS ============

  createProject(name, description, type = 'react-app') {
    return this.request('/projects', {
      method: 'POST',
      body: JSON.stringify({ name, description, type }),
    });
  }

  getProjects() {
    return this.request('/projects', {
      method: 'GET',
    });
  }

  getProject(projectId) {
    return this.request(`/projects/${projectId}`, {
      method: 'GET',
    });
  }

  updateProject(projectId, name, description, type, status) {
    return this.request(`/projects/${projectId}`, {
      method: 'PUT',
      body: JSON.stringify({ name, description, type, status }),
    });
  }

  deleteProject(projectId) {
    return this.request(`/projects/${projectId}`, {
      method: 'DELETE',
    });
  }

  // ============ FILE ENDPOINTS ============

  createFile(projectId, path, content, language = 'javascript') {
    return this.request(`/files/${projectId}`, {
      method: 'POST',
      body: JSON.stringify({ path, content, language }),
    });
  }

  getFiles(projectId) {
    return this.request(`/files/${projectId}`, {
      method: 'GET',
    });
  }

  getFile(projectId, fileId) {
    return this.request(`/files/${projectId}/${fileId}`, {
      method: 'GET',
    });
  }

  updateFile(projectId, path, content, language) {
    return this.request(`/files/${projectId}`, {
      method: 'PUT',
      body: JSON.stringify({ path, content, language }),
    });
  }

  deleteFile(projectId, path) {
    return this.request(`/files/${projectId}`, {
      method: 'DELETE',
      body: JSON.stringify({ path }),
    });
  }

  // ============ AI ENDPOINTS ============

  generateCode(prompt, type = 'react', context = {}) {
    return this.request('/ai/generate', {
      method: 'POST',
      body: JSON.stringify({ prompt, type, context }),
    });
  }

  getAIHealth() {
    return this.request('/ai/health', {
      method: 'GET',
    });
  }
}

// Export singleton instance
export default new APIClient();
