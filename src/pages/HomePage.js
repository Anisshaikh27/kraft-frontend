import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Code, Zap, Github } from 'lucide-react';

const HomePage = () => {
  const features = [
    {
      icon: <Sparkles className="h-8 w-8" />,
      title: 'AI-Powered Generation',
      description: 'Generate complete React applications from natural language prompts using advanced AI models.'
    },
    {
      icon: <Code className="h-8 w-8" />,
      title: 'Full-Stack Development',
      description: 'Create both frontend and backend code with proper file structure and best practices.'
    },
    {
      icon: <Zap className="h-8 w-8" />,
      title: 'Real-Time Preview',
      description: 'See your generated applications come to life with instant preview and live editing.'
    },
    {
      icon: <Github className="h-8 w-8" />,
      title: 'Export & Deploy',
      description: 'Download your projects or deploy them directly to popular platforms.'
    }
  ];

  const examples = [
    'Create a modern e-commerce website with shopping cart',
    'Build a social media dashboard with real-time updates',
    'Generate a project management tool with drag-and-drop',
    'Make a responsive blog with dark mode support'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background-primary via-background-secondary to-background-primary">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-primary-500 rounded-lg flex items-center justify-center">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">Weblify.AI</h1>
          </div>
          <nav className="flex items-center gap-6">
            <a href="#features" className="text-dark-500 hover:text-white transition-colors">
              Features
            </a>
            <a href="#examples" className="text-dark-500 hover:text-white transition-colors">
              Examples
            </a>
            <Link 
              to="/project"
              className="btn-primary"
            >
              Get Started
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-20">
        <div className="text-center max-w-4xl mx-auto">
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
            Build React Apps with
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-primary-600">
              {' '}AI Magic
            </span>
          </h2>
          
          <p className="text-xl text-dark-500 mb-8 max-w-2xl mx-auto">
            Transform your ideas into fully functional React applications using natural language. 
            No coding required – just describe what you want to build.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link 
              to="/project"
              className="btn-primary text-lg px-8 py-3"
            >
              Start Building
            </Link>
            <button className="btn-secondary text-lg px-8 py-3">
              Watch Demo
            </button>
          </div>

          {/* Quick Start Example */}
          <div className="bg-background-secondary rounded-xl p-6 max-w-2xl mx-auto border border-dark-200">
            <p className="text-dark-600 mb-4">Try saying:</p>
            <div className="bg-background-primary rounded-lg p-4 text-left">
              <p className="text-primary-400 font-mono text-sm">
                "Create a todo app with add, edit, delete functionality and local storage"
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Features Section */}
      <section id="features" className="py-20 bg-background-secondary/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold text-white mb-4">
              Everything You Need to Build Modern Web Apps
            </h3>
            <p className="text-xl text-dark-500 max-w-2xl mx-auto">
              Powered by advanced AI models and built for developers who want to move fast.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="bg-background-secondary rounded-xl p-6 border border-dark-200 hover:border-primary-500 transition-colors group"
              >
                <div className="text-primary-500 mb-4 group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h4 className="text-lg font-semibold text-white mb-2">
                  {feature.title}
                </h4>
                <p className="text-dark-500 text-sm">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Examples Section */}
      <section id="examples" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold text-white mb-4">
              What Can You Build?
            </h3>
            <p className="text-xl text-dark-500 max-w-2xl mx-auto">
              From simple components to complex applications – the possibilities are endless.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {examples.map((example, index) => (
              <div 
                key={index}
                className="bg-background-secondary rounded-xl p-6 border border-dark-200 hover:bg-background-tertiary transition-colors cursor-pointer group"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                    {index + 1}
                  </div>
                  <div>
                    <p className="text-white group-hover:text-primary-400 transition-colors">
                      {example}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link 
              to="/project"
              className="btn-primary text-lg px-8 py-3"
            >
              Start Your Project
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-dark-200">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-3 mb-4 md:mb-0">
              <div className="h-8 w-8 bg-primary-500 rounded-lg flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-semibold text-white">Weblify.AI</span>
            </div>
            
            <div className="flex items-center gap-6 text-sm text-dark-500">
              <span>Powered by Free AI Models</span>
              <span>•</span>
              <span>No Limits</span>
              <span>•</span>
              <span>Open Source</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;