import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AppProvider } from "./context/AppContext";
import MainLayout from "./components/layout/MainLayout";
import HomePage from "./pages/HomePage";
import ProjectPage from "./pages/ProjectPage";
import { WebContainerProvider } from "./context/WebContainerContext.js";
import "./App.css";

function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate app initialization
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

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
        <Router>
          <div className="App min-h-screen bg-background-primary">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route
                path="/project/:projectId?"
                element={
                  <MainLayout>
                    <ProjectPage />
                  </MainLayout>
                }
              />
            </Routes>
          </div>
        </Router>
      </AppProvider>
    </WebContainerProvider>
  );
}

export default App;
