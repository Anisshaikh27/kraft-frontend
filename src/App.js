import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AppProvider } from "./context/AppContext";
import { useAppState } from "./context/AppContext";
import MainLayout from "./components/layout/MainLayout";
import LandingPage from "./pages/LandingPage";
import HomePage from "./pages/HomePage";
import ProjectPage from "./pages/ProjectPage";
import PromptPage from "./pages/PromptPage";
import AuthPage from "./pages/AuthPage";
import { WebContainerProvider } from "./context/WebContainerContext.js";
import "./App.css";

// Protected Route Component
function ProtectedRoute({ children }) {
  const { token } = useAppState();
  
  if (!token) {
    const storedToken = localStorage.getItem('token');
    if (!storedToken) {
      return <Navigate to="/auth" replace />;
    }
  }
  
  return children;
}

function AppRoutes() {
  const { token, user } = useAppState();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Check for stored token on mount
    const storedToken = localStorage.getItem('token');
    if (storedToken && !token) {
      // Token exists but not in context - will be restored by AppContext
      // Wait a moment for context to initialize
      setTimeout(() => setIsInitialized(true), 500);
    } else {
      setIsInitialized(true);
    }
  }, [token]);

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-background-primary flex items-center justify-center">
        <div className="text-center">
          <div className="loading-spinner mb-4"></div>
          <h2 className="text-xl font-semibold text-dark-700 mb-2">
            Weblify.AI
          </h2>
          <p className="text-dark-500">
            Initializing...
          </p>
        </div>
      </div>
    );
  }

  const hasAuth = token || localStorage.getItem('token');

  return (
    <Router>
      <div className="App min-h-screen bg-background-primary">
        <Routes>
          {/* Public Landing Page - no auth required */}
          <Route path="/" element={<LandingPage />} />
          
          {/* Auth Routes */}
          <Route path="/auth" element={<AuthPage />} />
          
          {/* Protected Routes */}
          {hasAuth && (
            <>
              <Route path="/dashboard" element={<HomePage />} />
              
              {/* Prompt page - for entering project description and getting AI to generate code */}
              <Route
                path="/project/prompt"
                element={<PromptPage />}
              />
              
              {/* Project editor - for viewing and editing existing projects */}
              <Route
                path="/project/:projectId"
                element={
                  <MainLayout>
                    <ProjectPage />
                  </MainLayout>
                }
              />
            </>
          )}
          
          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // App initialization
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background-primary flex items-center justify-center">
        <div className="text-center">
          <div className="loading-spinner mb-4"></div>
          <h2 className="text-xl font-semibold text-dark-700 mb-2">
            Weblify.AI
          </h2>
          <p className="text-dark-500">
            Initializing AI-powered development environment...
          </p>
        </div>
      </div>
    );
  }

  return (
    <WebContainerProvider>
      <AppProvider>
        <AppRoutes />
      </AppProvider>
    </WebContainerProvider>
  );
}

export default App;
