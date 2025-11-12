import React from 'react';
import { useNavigate } from 'react-router-dom';
import './LandingPage.css';

const LandingPage = () => {
  const navigate = useNavigate();

  const handleStartBuilding = () => {
    navigate('/auth', { state: { mode: 'signup' } });
  };

  const handleSignUp = () => {
    navigate('/auth', { state: { mode: 'signup' } });
  };

  const handleLogin = () => {
    navigate('/auth', { state: { mode: 'login' } });
  };

  return (
    <div className="landing-page">
      {/* Navigation Bar */}
      <nav className="navbar">
        <div className="nav-container">
          <div className="nav-logo">
            <span className="logo-icon">⚡</span>
            <span className="logo-text">Webify.AI</span>
          </div>
          <div className="nav-links">
            <a href="#features" className="nav-link">Features</a>
            <a href="#examples" className="nav-link">Examples</a>
            <button className="nav-button btn-login" onClick={handleLogin}>
              Login
            </button>
            <button className="nav-button btn-signup" onClick={handleSignUp}>
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1 className="hero-title">
            Build React Apps with <span className="highlight">AI Magic</span>
          </h1>
          <p className="hero-subtitle">
            Transform your ideas into fully functional React applications using natural
            language. No coding required – just describe what you want to build.
          </p>
          <div className="hero-actions">
            <button className="btn btn-primary" onClick={handleStartBuilding}>
              Start Building
            </button>
            <button className="btn btn-secondary">
              Watch Demo
            </button>
          </div>

          {/* Try Saying Section */}
          <div className="try-saying">
            <p className="try-label">Try saying:</p>
            <code className="try-code">
              "Create a todo app with add, edit, delete functionality and local storage"
            </code>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features" id="features">
        <h2 className="section-title">Everything You Need to Build Modern Web Apps</h2>
        <p className="section-subtitle">
          Powered by advanced AI models and built for developers who want to move fast.
        </p>

        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🤖</div>
            <h3>AI-Powered Generation</h3>
            <p>Generate complete React applications from natural language prompts using advanced AI models.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">💻</div>
            <h3>Full-Stack Development</h3>
            <p>Create both frontend and backend code with proper structure and best practices.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">👁️</div>
            <h3>Real-Time Preview</h3>
            <p>See your generated applications come to life with instant preview and live editing.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">📦</div>
            <h3>Export & Deploy</h3>
            <p>Download your projects or deploy them directly to popular platforms.</p>
          </div>
        </div>
      </section>

      {/* What Can You Build Section */}
      <section className="examples" id="examples">
        <h2 className="section-title">What Can You Build?</h2>
        <p className="section-subtitle">
          From simple components to complex applications – the possibilities are endless.
        </p>

        <div className="examples-grid">
          <div className="example-card">
            <div className="example-number">1</div>
            <h4>Create a modern e-commerce website with shopping cart</h4>
          </div>

          <div className="example-card">
            <div className="example-number">2</div>
            <h4>Build a social media dashboard with real-time updates</h4>
          </div>

          <div className="example-card">
            <div className="example-number">3</div>
            <h4>Generate a project management tool with drag and drop</h4>
          </div>

          <div className="example-card">
            <div className="example-number">4</div>
            <h4>Make a responsive blog with dark mode support</h4>
          </div>
        </div>

        <button className="btn btn-primary btn-large" onClick={handleStartBuilding}>
          Start Your Project
        </button>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-container">
          <div className="footer-logo">
            <span className="logo-icon">⚡</span>
            <span>Webify.AI</span>
          </div>
          <div className="footer-links">
            <a href="#" className="footer-link">Powered by Free AI Models</a>
            <span className="separator">•</span>
            <a href="#" className="footer-link">No Limits</a>
            <span className="separator">•</span>
            <a href="#" className="footer-link">Open Source</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
