import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppActions } from '../context/AppContext';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ErrorMessage from '../components/ui/ErrorMessage';

const AuthPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setUser, setToken } = useAppActions();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [mode, setMode] = useState('login'); // 'login' or 'signup'
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    username: '',
  });

  // Set mode from location state if coming from landing page
  useEffect(() => {
    const state = location.state;
    if (state && state.mode) {
      setMode(state.mode);
    }
  }, [location]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError(null);
  };

  const handleModeChange = (newMode) => {
    setMode(newMode);
    setFormData({ email: '', password: '', confirmPassword: '', username: '' });
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const endpoint = mode === 'signup' ? '/auth/register' : '/auth/login';
      const payload = mode === 'signup'
        ? { username: formData.username, email: formData.email, password: formData.password, confirmPassword: formData.confirmPassword }
        : { email: formData.email, password: formData.password };

      const response = await fetch(`http://localhost:3001/api${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `${mode} failed`);
      }

      // Store token and user
      const token = data.token || data.access_token;
      if (token) {
        localStorage.setItem('token', token);
        setToken(token);
        
        // Set user data if available
        if (data.user) {
          setUser({
            id: data.user.id || data.user._id,
            email: data.user.email,
            name: data.user.name,
          });
        }

        // Redirect to dashboard
        navigate('/dashboard');
      } else {
        throw new Error('No token received');
      }
    } catch (err) {
      setError(err.message);
      console.error('Auth error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Try to login as guest or create guest account
      const response = await fetch('http://localhost:3001/api/auth/guest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();

      if (response.ok && data.token) {
        localStorage.setItem('token', data.token);
        setToken(data.token);
        
        if (data.user) {
          setUser({
            id: data.user.id || data.user._id,
            email: data.user.email,
            name: data.user.name,
          });
        }

        navigate('/dashboard');
      } else {
        throw new Error('Guest login failed');
      }
    } catch (err) {
      setError(err.message);
      console.error('Guest login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background-primary via-background-secondary to-background-primary flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Weblify</h1>
          <p className="text-dark-400">AI Code Generator</p>
        </div>

        {/* Auth Card */}
        <div className="bg-background-secondary border border-dark-200 rounded-xl shadow-2xl p-8">
          {error && (
            <div className="mb-4">
              <ErrorMessage message={error} />
            </div>
          )}

          {/* Mode Toggle */}
          <div className="flex gap-2 mb-6 bg-background-primary rounded-lg p-1">
            <button
              onClick={() => handleModeChange('login')}
              className={`flex-1 py-2 px-4 rounded-md font-medium transition ${
                mode === 'login'
                  ? 'bg-primary-600 text-white'
                  : 'text-dark-400 hover:text-dark-300'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => handleModeChange('signup')}
              className={`flex-1 py-2 px-4 rounded-md font-medium transition ${
                mode === 'signup'
                  ? 'bg-primary-600 text-white'
                  : 'text-dark-400 hover:text-dark-300'
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-2">
                  Username
                </label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="john_doe"
                  className="w-full px-4 py-2 bg-background-primary border border-dark-200 rounded-lg focus:border-primary-500 focus:outline-none text-white placeholder-dark-500"
                  required={mode === 'signup'}
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-dark-300 mb-2">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className="w-full px-4 py-2 bg-background-primary border border-dark-200 rounded-lg focus:border-primary-500 focus:outline-none text-white placeholder-dark-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-300 mb-2">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full px-4 py-2 bg-background-primary border border-dark-200 rounded-lg focus:border-primary-500 focus:outline-none text-white placeholder-dark-500"
                required
              />
            </div>

            {mode === 'signup' && (
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-2">
                  Confirm Password
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full px-4 py-2 bg-background-primary border border-dark-200 rounded-lg focus:border-primary-500 focus:outline-none text-white placeholder-dark-500"
                  required={mode === 'signup'}
                />
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-dark-400 text-white font-medium py-2 px-4 rounded-lg transition flex items-center justify-center gap-2"
            >
              {isLoading && <LoadingSpinner size="small" />}
              {isLoading ? (mode === 'signup' ? 'Creating account...' : 'Signing in...') : (mode === 'signup' ? 'Create Account' : 'Sign In')}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-dark-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-background-secondary text-dark-500">or</span>
            </div>
          </div>

          {/* Guest Login */}
          <button
            onClick={handleGuestLogin}
            disabled={isLoading}
            className="w-full bg-background-primary hover:bg-dark-100 border border-dark-200 text-white font-medium py-2 px-4 rounded-lg transition flex items-center justify-center gap-2"
          >
            {isLoading ? <LoadingSpinner size="small" /> : '👤'}
            Continue as Guest
          </button>

          {/* Info */}
          <p className="text-xs text-dark-500 text-center mt-4">
            {mode === 'signup'
              ? 'Already have an account? '
              : 'Don\'t have an account? '}
            <button
              type="button"
              onClick={() => handleModeChange(mode === 'signup' ? 'login' : 'signup')}
              className="text-primary-400 hover:text-primary-300 font-medium"
            >
              {mode === 'signup' ? 'Sign in' : 'Create one'}
            </button>
          </p>
        </div>

        {/* Footer */}
        <p className="text-center text-dark-500 text-xs mt-6">
          Powered by Free AI Models
        </p>

        {/* Back to Home */}
        <div className="text-center mt-4">
          <button
            onClick={() => navigate('/')}
            className="text-dark-400 hover:text-accent text-sm font-medium transition"
          >
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
