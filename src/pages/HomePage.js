import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppState, useAppActions } from '../context/AppContext';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ErrorMessage from '../components/ui/ErrorMessage';
import apiClient from '../services/apiClient';

const HomePage = () => {
  const navigate = useNavigate();
  const { user, projects, isLoading, error, token } = useAppState();
  const { setProjects, setLoading, setError, logout } = useAppActions();
  
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'react-app',
  });

  // Redirect to landing page if not authenticated
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (!token && !storedToken) {
      navigate('/', { replace: true });
    }
  }, [token, navigate]);

  // Fetch projects on mount
  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      try {
        const response = await apiClient.getProjects();
        const projectsList = response.projects || response.data || [];
        setProjects(projectsList);
      } catch (err) {
        setError(err.message || 'Failed to fetch projects');
        console.error('Error fetching projects:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [setProjects, setLoading, setError]);

  const handleCreateProject = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      setError('Project name is required');
      return;
    }

    setShowNewProjectModal(false);
    
    // Navigate to prompt page with project details
    // User will enter prompt/description there, then project gets created
    navigate('/project/prompt', {
      state: {
        projectName: formData.name,
        projectDescription: formData.description,
        projectType: formData.type,
      },
    });
  };

  const handleUpdateProject = async (projectId, updates) => {
    setLoading(true);
    try {
      const response = await apiClient.updateProject(projectId, updates);
      const updatedProject = response.project || response;
      
      setProjects(
        projects.map(p => 
          (p._id || p.id) === (projectId || editingProject.id) 
            ? updatedProject 
            : p
        )
      );
      
      setEditingProject(null);
      setFormData({ name: '', description: '', type: 'react-app' });
      setShowNewProjectModal(false);
    } catch (err) {
      setError(err.message || 'Failed to update project');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProject = async (projectId) => {
    if (!window.confirm('Are you sure you want to delete this project?')) {
      return;
    }

    setLoading(true);
    try {
      await apiClient.deleteProject(projectId);
      setProjects(projects.filter(p => (p._id || p.id) !== projectId));
    } catch (err) {
      setError(err.message || 'Failed to delete project');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getProjectTypeLabel = (type) => {
    const types = {
      'react-app': '⚛️ React App',
      'component': '🧩 Component',
      'fullstack': '🚀 Full Stack',
    };
    return types[type] || type;
  };

  const projectStats = {
    total: projects.length,
    active: projects.filter(p => p.status === 'active').length,
    archived: projects.filter(p => p.status === 'archived').length,
  };

  return (
    <div className="min-h-screen bg-background-primary">
      {/* Header with Profile */}
      <header className="bg-background-secondary border-b border-dark-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 bg-primary-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">⚡</span>
              </div>
              <h1 className="text-xl font-bold text-white">Weblify</h1>
            </div>

            {/* Right Menu */}
            <div className="flex items-center gap-4">
              {/* Theme Toggle */}
              <div className="relative">
                <button
                  onClick={() => setShowThemeMenu(!showThemeMenu)}
                  className="p-2 hover:bg-dark-100 rounded-lg transition"
                  title="Theme"
                >
                  🌙
                </button>
                {showThemeMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-background-secondary border border-dark-200 rounded-lg shadow-lg p-2 z-50">
                    <button className="w-full text-left px-4 py-2 hover:bg-dark-100 rounded text-sm text-white">
                      ☀️ Light Mode
                    </button>
                    <button className="w-full text-left px-4 py-2 hover:bg-dark-100 rounded text-sm text-white bg-dark-100">
                      🌙 Dark Mode (Active)
                    </button>
                    <button className="w-full text-left px-4 py-2 hover:bg-dark-100 rounded text-sm text-white">
                      🤖 Auto
                    </button>
                  </div>
                )}
              </div>

              {/* Help */}
              <button
                className="p-2 hover:bg-dark-100 rounded-lg transition"
                title="Help"
              >
                ❓
              </button>

              {/* Settings */}
              <button
                className="p-2 hover:bg-dark-100 rounded-lg transition"
                title="Settings"
              >
                ⚙️
              </button>

              {/* User Menu */}
              <div className="relative ml-4 pl-4 border-l border-dark-200">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-3 hover:bg-dark-100 px-3 py-2 rounded-lg transition"
                >
                  <div className="h-8 w-8 bg-primary-500 rounded-full flex items-center justify-center text-white font-bold">
                    {user?.email?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <div className="text-left hidden sm:block">
                    <p className="text-xs text-dark-400">
                      {user?.isGuest ? 'Guest' : 'User'}
                    </p>
                    <p className="text-sm text-white font-medium">
                      {user?.name || user?.username || 'User'}
                    </p>
                  </div>
                  <span className="text-dark-400">▼</span>
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-background-secondary border border-dark-200 rounded-lg shadow-lg p-2 z-50">
                    <div className="px-4 py-3 border-b border-dark-200">
                      <p className="text-sm font-medium text-white">
                        {user?.name || user?.username || 'User'}
                      </p>
                      <p className="text-xs text-dark-400">
                        {user?.email}
                      </p>
                    </div>

                    <button className="w-full text-left px-4 py-2 hover:bg-dark-100 rounded text-sm text-white mt-2">
                      👤 Profile
                    </button>
                    <button className="w-full text-left px-4 py-2 hover:bg-dark-100 rounded text-sm text-white">
                      ⚙️ Settings
                    </button>
                    {user?.isGuest && (
                      <button className="w-full text-left px-4 py-2 hover:bg-dark-100 rounded text-sm text-primary-400 font-medium">
                        ✨ Upgrade Account
                      </button>
                    )}
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 hover:bg-red-500/10 rounded text-sm text-red-400 border-t border-dark-200 mt-2 pt-2"
                    >
                      🚪 Sign Out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Error Message */}
        {error && (
          <div className="mb-6">
            <ErrorMessage message={error} />
          </div>
        )}

        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">
            Welcome back, {user?.name || user?.username || 'Builder'}! 👋
          </h2>
          <p className="text-dark-500">
            {user?.isGuest 
              ? 'You\'re using a guest account. Create projects and upgrade anytime to save permanently.'
              : 'Manage your projects and create something amazing.'}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-background-secondary border border-dark-200 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-dark-400 text-sm mb-1">Total Projects</p>
                <p className="text-3xl font-bold text-white">{projectStats.total}</p>
              </div>
              <span className="text-4xl">📊</span>
            </div>
          </div>

          <div className="bg-background-secondary border border-dark-200 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-dark-400 text-sm mb-1">Active</p>
                <p className="text-3xl font-bold text-primary-400">{projectStats.active}</p>
              </div>
              <span className="text-4xl">✅</span>
            </div>
          </div>

          <div className="bg-background-secondary border border-dark-200 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-dark-400 text-sm mb-1">Archived</p>
                <p className="text-3xl font-bold text-dark-500">{projectStats.archived}</p>
              </div>
              <span className="text-4xl">📦</span>
            </div>
          </div>
        </div>

        {/* Create New Project Button */}
        <div className="mb-8">
          <button
            onClick={() => {
              setEditingProject(null);
              setFormData({ name: '', description: '', type: 'react-app' });
              setShowNewProjectModal(true);
            }}
            className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-medium py-3 px-6 rounded-lg transition"
          >
            ➕ Create New Project
          </button>
        </div>

        {/* Projects Section */}
        {isLoading && !projects.length ? (
          <div className="flex flex-col items-center justify-center py-12">
            <LoadingSpinner size="large" />
            <p className="text-dark-500 mt-4">Loading your projects...</p>
          </div>
        ) : projects.length === 0 ? (
          <div className="bg-background-secondary border border-dashed border-dark-200 rounded-xl p-12 text-center">
            <div className="text-6xl mb-4">📁</div>
            <h3 className="text-xl font-semibold text-white mb-2">No Projects Yet</h3>
            <p className="text-dark-500 mb-6 max-w-md mx-auto">
              Create your first project to get started. Use AI to generate amazing React applications.
            </p>
            <button
              onClick={() => {
                setEditingProject(null);
                setFormData({ name: '', description: '', type: 'react-app' });
                setShowNewProjectModal(true);
              }}
              className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded-lg transition"
            >
              ➕ Create Your First Project
            </button>
          </div>
        ) : (
          <div>
            <h3 className="text-xl font-semibold text-white mb-4">Your Projects</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <div
                  key={project._id || project.id}
                  className="bg-background-secondary border border-dark-200 rounded-xl p-6 hover:border-primary-500 transition group cursor-pointer"
                  onClick={() => navigate(`/project/${project._id || project.id}`)}
                >
                  {/* Project Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold text-white mb-1">
                        {project.name}
                      </h4>
                      <p className="text-sm text-dark-400">
                        {getProjectTypeLabel(project.type)}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      project.status === 'active'
                        ? 'bg-green-500/20 text-green-400'
                        : project.status === 'archived'
                        ? 'bg-gray-500/20 text-gray-400'
                        : 'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {project.status || 'active'}
                    </span>
                  </div>

                  {/* Description */}
                  {project.description && (
                    <p className="text-sm text-dark-500 mb-4 line-clamp-2">
                      {project.description}
                    </p>
                  )}

                  {/* Stats */}
                  <div className="flex items-center justify-between text-xs text-dark-400 mb-4 pb-4 border-b border-dark-200">
                    <span>📄 {project.fileCount || 0} files</span>
                    <span>{formatDate(project.createdAt)}</span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/project/${project._id || project.id}`);
                      }}
                      className="flex-1 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium py-2 px-3 rounded transition"
                    >
                      Open
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingProject(project);
                        setFormData({
                          name: project.name,
                          description: project.description,
                          type: project.type,
                        });
                        setShowNewProjectModal(true);
                      }}
                      className="bg-dark-100 hover:bg-dark-200 text-dark-300 text-sm font-medium py-2 px-3 rounded transition"
                      title="Edit"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteProject(project._id || project.id);
                      }}
                      className="bg-red-500/10 hover:bg-red-500/20 text-red-400 text-sm font-medium py-2 px-3 rounded transition"
                      title="Delete"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* New/Edit Project Modal */}
      {showNewProjectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background-secondary border border-dark-200 rounded-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">
                {editingProject ? 'Edit Project' : 'Create New Project'}
              </h3>
              <button
                onClick={() => {
                  setShowNewProjectModal(false);
                  setEditingProject(null);
                  setFormData({ name: '', description: '', type: 'react-app' });
                }}
                className="text-dark-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={(e) => {
                if (editingProject) {
                  e.preventDefault();
                  handleUpdateProject(editingProject._id || editingProject.id, formData);
                } else {
                  handleCreateProject(e);
                }
              }}
              className="space-y-4"
            >
              {/* Project Name */}
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-2">
                  Project Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="My Awesome App"
                  className="w-full px-4 py-2 bg-background-primary border border-dark-200 rounded-lg focus:border-primary-500 focus:outline-none text-white placeholder-dark-500"
                  required
                />
              </div>

              {/* Project Description */}
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="What is this project about?"
                  rows="3"
                  className="w-full px-4 py-2 bg-background-primary border border-dark-200 rounded-lg focus:border-primary-500 focus:outline-none text-white placeholder-dark-500 resize-none"
                />
              </div>

              {/* Project Type */}
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-2">
                  Project Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-4 py-2 bg-background-primary border border-dark-200 rounded-lg focus:border-primary-500 focus:outline-none text-white"
                >
                  <option value="react-app">⚛️ React App</option>
                  <option value="component">🧩 Component</option>
                  <option value="fullstack">🚀 Full Stack</option>
                </select>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowNewProjectModal(false);
                    setEditingProject(null);
                    setFormData({ name: '', description: '', type: 'react-app' });
                  }}
                  className="flex-1 bg-dark-100 hover:bg-dark-200 text-white font-medium py-2 px-4 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading || !formData.name.trim()}
                  className="flex-1 bg-primary-600 hover:bg-primary-700 disabled:bg-dark-400 text-white font-medium py-2 px-4 rounded-lg transition flex items-center justify-center gap-2"
                >
                  {isLoading && <LoadingSpinner size="small" />}
                  {editingProject ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;