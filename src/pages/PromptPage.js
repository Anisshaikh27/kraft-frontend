import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppState, useAppActions } from '../context/AppContext';
import { Sparkles, ArrowRight } from 'lucide-react';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ErrorMessage from '../components/ui/ErrorMessage';
import apiClient from '../services/apiClient';

const PromptPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAppState();
  const { setCurrentProject, setLoading, setError, addChatMessage } = useAppActions();

  const [projectName, setProjectName] = useState(
    location.state?.projectName || 'My React Project'
  );
  const [projectDescription, setProjectDescription] = useState(
    location.state?.projectDescription || ''
  );
  const [projectType, setProjectType] = useState(
    location.state?.projectType || 'react-app'
  );
  const [prompt, setPrompt] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [error, setLocalError] = useState(null);

  const examplePrompts = [
    'Create a modern login form with validation',
    'Build a responsive navbar with dropdown menu',
    'Make a todo list with drag and drop',
    'Generate a pricing page with cards',
    'Create a dashboard with charts',
    'Build a contact form with email validation'
  ];

  const handleCreateProject = async (e) => {
    e.preventDefault();

    if (!prompt.trim()) {
      setLocalError('Please describe what you want to build');
      return;
    }

    setIsCreating(true);
    setLocalError(null);
    setLoading(true);

    try {
      // Step 1: Create project in database
      console.log('Creating project:', { projectName, projectDescription, projectType });
      
      const projectResponse = await apiClient.createProject({
        name: projectName || 'My React Project',
        description: projectDescription,
        type: projectType,
      });

      const newProject = projectResponse.project || projectResponse;
      console.log('Project created:', newProject);

      if (!newProject._id && !newProject.id) {
        throw new Error('Project creation failed - no ID returned');
      }

      const projectId = newProject._id || newProject.id;

      // Set current project in context
      setCurrentProject(newProject);

      // Step 2: Add user's prompt as initial chat message
      const userMessage = {
        id: Date.now(),
        type: 'user',
        content: prompt,
        timestamp: new Date(),
      };
      addChatMessage(userMessage);

      // Step 3: Send prompt to AI to generate code
      console.log('Sending prompt to AI:', prompt);
      
      const aiResponse = await apiClient.generateCode(prompt, projectType);

      console.log('AI Response:', aiResponse);

      // Add AI response to chat
      const response_text = aiResponse.data?.content || aiResponse.content || aiResponse.explanation || 'Code generated successfully!';
      const aiMessage = {
        id: Date.now() + 1,
        type: 'assistant',
        content: response_text,
        timestamp: new Date(),
      };
      addChatMessage(aiMessage);

      // Step 4: If files were generated, save them to the project
      const files = aiResponse.data?.files || aiResponse.files || [];
      console.log('Attempting to save files:', files);
      console.log('File array length:', Array.isArray(files) ? files.length : 'NOT AN ARRAY');
      
      if (files && Array.isArray(files) && files.length > 0) {
        console.log(`Found ${files.length} files to save`);
        
        let savedCount = 0;
        const fileErrors = [];
        
        // Save each file
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          try {
            console.log(`[${i+1}/${files.length}] Saving file: ${file.path}`);
            console.log(`  - Language: ${file.language}`);
            console.log(`  - Content size: ${file.content?.length || 0} bytes`);
            
            const response = await apiClient.createFile(
              projectId, 
              file.path, 
              file.content, 
              file.language || 'javascript'
            );
            
            savedCount++;
            console.log(`  ✓ Response: ${response.success ? 'SUCCESS' : 'UNKNOWN'}`);
          } catch (fileError) {
            console.error(`  ✗ Error:`, fileError);
            fileErrors.push({ 
              path: file.path, 
              error: fileError.message || fileError.data?.error || 'Unknown error'
            });
          }
        }
        
        console.log(`\n📊 SUMMARY: ${savedCount}/${files.length} files saved successfully`);
        
        if (fileErrors.length > 0) {
          console.error('Failed files:', fileErrors);
        }
        
        // Update current project with actual saved file count
        const updatedProject = {
          ...newProject,
          fileCount: savedCount,
        };
        setCurrentProject(updatedProject);
        console.log(`Updated project fileCount to: ${savedCount}`);
        
        // Show message about file count
        if (savedCount > 0) {
          addChatMessage({
            id: Date.now() + 2,
            type: 'system',
            content: `✅ ${savedCount} files generated and saved to your project`,
            timestamp: new Date(),
          });
        }
      } else {
        console.warn('⚠️ No files to save. Array:', files);
      }

      // Step 5: Save chat messages to database
      console.log('Saving chat messages to database...');
      try {
        // Get current chat messages from context
        const responseContent = aiResponse.data?.content || aiResponse.content || aiResponse.explanation || 'Code generated successfully!';
        const allChatMessages = [
          {
            type: 'user',
            content: prompt,
          },
          {
            type: 'assistant',
            content: responseContent,
            metadata: { fileCount: files?.length || 0, codeGenerated: true },
          }
        ];

        // Save all messages at once
        await apiClient.saveBulkChatMessages(projectId, allChatMessages);
        console.log('Chat messages saved to database ✓');
      } catch (chatError) {
        console.warn('Warning: Could not save chat to database:', chatError);
        // Don't block navigation if chat save fails
      }

      // Step 6: Navigate to project editor
      console.log('Navigating to project:', projectId);
      navigate(`/project/${projectId}`, {
        state: { 
          fromPrompt: true,
          projectCreated: true,
        },
      });
    } catch (err) {
      console.error('Error creating project:', err);
      const errorMessage = err.message || err.data?.error || 'Failed to create project';
      setLocalError(errorMessage);
      setError(errorMessage);
    } finally {
      setIsCreating(false);
      setLoading(false);
    }
  };

  const handleExampleClick = (examplePrompt) => {
    setPrompt(examplePrompt);
  };

  return (
    <div className="min-h-screen bg-background-primary flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="h-12 w-12 bg-primary-600 rounded-lg flex items-center justify-center">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white">Weblify.AI</h1>
          </div>
          <p className="text-xl text-dark-500">
            Describe the React application you want to build
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6">
            <ErrorMessage message={error} />
          </div>
        )}

        {/* User Info */}
        <div className="mb-8 p-4 bg-background-secondary border border-dark-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-dark-400">Building as</p>
              <p className="text-white font-medium">{user?.name || user?.username || 'User'}</p>
            </div>
            <div className="h-10 w-10 bg-primary-500 rounded-full flex items-center justify-center text-white font-bold">
              {user?.email?.[0]?.toUpperCase() || 'U'}
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleCreateProject} className="space-y-6 mb-8">
          {/* Project Name */}
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-2">
              Project Name
            </label>
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="My React Project"
              className="w-full px-4 py-3 bg-background-secondary border border-dark-200 rounded-lg focus:border-primary-500 focus:outline-none text-white placeholder-dark-500"
              disabled={isCreating}
            />
          </div>

          {/* Project Type */}
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-2">
              Project Type
            </label>
            <select
              value={projectType}
              onChange={(e) => setProjectType(e.target.value)}
              className="w-full px-4 py-3 bg-background-secondary border border-dark-200 rounded-lg focus:border-primary-500 focus:outline-none text-white"
              disabled={isCreating}
            >
              <option value="react-app">⚛️ React App</option>
              <option value="component">🧩 Component</option>
              <option value="fullstack">🚀 Full Stack</option>
            </select>
          </div>

          {/* Project Description */}
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-2">
              Project Description (Optional)
            </label>
            <textarea
              value={projectDescription}
              onChange={(e) => setProjectDescription(e.target.value)}
              placeholder="Brief description of your project..."
              rows="2"
              className="w-full px-4 py-3 bg-background-secondary border border-dark-200 rounded-lg focus:border-primary-500 focus:outline-none text-white placeholder-dark-500 resize-none"
              disabled={isCreating}
            />
          </div>

          {/* AI Prompt */}
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-2">
              What do you want to build? *
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe your application in detail. The more specific, the better!"
              rows="4"
              className="w-full px-4 py-3 bg-background-secondary border border-dark-200 rounded-lg focus:border-primary-500 focus:outline-none text-white placeholder-dark-500 resize-none"
              disabled={isCreating}
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isCreating || !prompt.trim()}
            className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-dark-400 text-white font-semibold py-3 px-6 rounded-lg transition flex items-center justify-center gap-3"
          >
            {isCreating ? (
              <>
                <LoadingSpinner size="small" />
                Creating your project...
              </>
            ) : (
              <>
                Generate Code
                <ArrowRight className="h-5 w-5" />
              </>
            )}
          </button>
        </form>

        {/* Examples Section */}
        <div className="bg-background-secondary border border-dark-200 rounded-lg p-6">
          <h3 className="text-sm font-semibold text-dark-300 mb-3">Try these examples:</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {examplePrompts.map((examplePrompt, index) => (
              <button
                key={index}
                onClick={() => handleExampleClick(examplePrompt)}
                disabled={isCreating}
                className="text-left p-3 bg-background-primary hover:bg-background-tertiary border border-dark-200 rounded-lg transition-colors text-sm text-dark-400 hover:text-white disabled:opacity-50"
              >
                {examplePrompt}
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-dark-500">
          <p>✨ Powered by Free AI Models</p>
        </div>
      </div>
    </div>
  );
};

export default PromptPage;
