// src/components/preview/PreviewPanel.js
import React, { useState, useEffect, useCallback } from 'react';
import { useAppState } from '../../context/AppContext';
import { useWebContainer } from '../../context/WebContainerContext';

const PreviewPanel = () => {
  const { files, currentProject } = useAppState();
  const { webContainer, isReady } = useWebContainer();
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const filesArray = Array.from(files.values());

  const writeFilesToContainer = useCallback(async () => {
    if (!webContainer || !isReady || filesArray.length === 0) {
      console.log('⏸️ Waiting for WebContainer or files...');
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      setUrl(''); // Reset URL
      console.log('📝 Writing files to WebContainer...');

      // Create directory structure first
      const directories = new Set();
      filesArray.forEach(file => {
        const parts = file.path.split('/');
        for (let i = 1; i < parts.length; i++) {
          directories.add(parts.slice(0, i).join('/'));
        }
      });

      // Create directories
      for (const dir of directories) {
        try {
          await webContainer.fs.mkdir(dir, { recursive: true });
          console.log(`📁 Created directory: ${dir}`);
        } catch (err) {
          // Directory might already exist, ignore
        }
      }

      // Write each file to WebContainer
      for (const file of filesArray) {
        try {
          await webContainer.fs.writeFile(file.path, file.content, 'utf-8');
          console.log(`✅ Wrote: ${file.path} (${file.content.length} bytes)`);
        } catch (err) {
          console.error(`❌ Failed to write ${file.path}:`, err);
        }
      }

      console.log('📦 Installing dependencies...');
      const installProcess = await webContainer.spawn('npm', ['install']);
      
      // Pipe output to console
      installProcess.output.pipeTo(
        new WritableStream({
          write(data) {
            console.log('npm install:', data);
          },
        })
      );

      const installExitCode = await installProcess.exit;
      if (installExitCode !== 0) {
        throw new Error('npm install failed with exit code: ' + installExitCode);
      }

      console.log('✅ Dependencies installed');
      console.log('🚀 Starting dev server...');
      
      const devProcess = await webContainer.spawn('npm', ['run', 'dev']);
      
      // Pipe dev server output
      devProcess.output.pipeTo(
        new WritableStream({
          write(data) {
            console.log('npm run dev:', data);
          },
        })
      );

      // Listen for server-ready event
      webContainer.on('server-ready', (port, serverUrl) => {
        console.log('✅ Server ready!');
        console.log('   Port:', port);
        console.log('   URL:', serverUrl);
        setUrl(serverUrl);
        setIsLoading(false);
      });

    } catch (err) {
      console.error('❌ Preview error:', err);
      setError(err.message || 'Failed to load preview');
      setIsLoading(false);
    }
  }, [webContainer, isReady, filesArray]);

  useEffect(() => {
    if (filesArray.length > 0 && isReady && webContainer) {
      writeFilesToContainer();
    }
  }, [filesArray.length, isReady, webContainer]);

  // Not ready state
  if (!isReady) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-sm text-gray-600">Initializing WebContainer...</p>
          <p className="text-xs text-gray-400 mt-2">This may take a moment...</p>
        </div>
      </div>
    );
  }

  // No files state
  if (filesArray.length === 0) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50">
        <div className="text-center p-8">
          <div className="text-6xl mb-4">👁️</div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No Preview Available</h3>
          <p className="text-gray-500 mb-4">Generate some code to see the live preview</p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md">
            <p className="text-sm text-blue-700">
              💡 Ask the AI to create a React app to see it running here!
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="h-full flex items-center justify-center bg-red-50">
        <div className="text-center p-6">
          <div className="text-4xl mb-3">⚠️</div>
          <h3 className="text-lg font-semibold text-red-700 mb-2">Preview Error</h3>
          <p className="text-red-600 text-sm mb-4">{error}</p>
          <button 
            onClick={() => writeFilesToContainer()}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="flex-shrink-0 bg-gray-50 border-b border-gray-200 px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-gray-700">Live Preview</h3>
            {url && <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>}
          </div>
          
          <div className="flex items-center gap-2">
            {isLoading && (
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <div className="w-3 h-3 border border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                Building...
              </div>
            )}
            <span className="text-xs text-gray-500">{filesArray.length} files</span>
            <button 
              onClick={() => writeFilesToContainer()}
              disabled={isLoading}
              className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              ↻ Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Preview Content */}
      <div className="flex-1 relative">
        {!url && isLoading ? (
          <div className="h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-base text-gray-700 font-medium mb-1">Building your project...</p>
              <p className="text-sm text-gray-500">Installing dependencies and starting dev server</p>
            </div>
          </div>
        ) : url ? (
          <iframe
            src={url}
            className="w-full h-full border-0"
            title="Live Preview"
            allow="cross-origin-isolated"
          />
        ) : (
          <div className="h-full flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <div className="text-4xl mb-3">⏳</div>
              <p className="text-gray-500">Waiting for dev server...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PreviewPanel;
