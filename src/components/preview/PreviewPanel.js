import React, { useEffect, useState, useRef } from 'react';
import { RefreshCw, ExternalLink, Smartphone, Tablet, Monitor } from 'lucide-react';
import { useAppState } from '../../context/AppContext';
import LoadingSpinner from '../ui/LoadingSpinner';

const PreviewPanel = () => {
  const { files, currentProject } = useAppState();
  const [previewContent, setPreviewContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [viewportSize, setViewportSize] = useState('desktop');
  const [error, setError] = useState(null);
  const iframeRef = useRef(null);

  const viewportSizes = {
    mobile: { width: '375px', height: '667px', icon: Smartphone },
    tablet: { width: '768px', height: '1024px', icon: Tablet },
    desktop: { width: '100%', height: '100%', icon: Monitor }
  };

  // Generate preview content from files
  useEffect(() => {
    if (files.size === 0) {
      setPreviewContent('');
      return;
    }

    generatePreview();
  }, [files]);

  const generatePreview = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Find main files
      const indexFile = files.get('public/index.html') || files.get('index.html');
      const appFile = files.get('src/App.js') || files.get('App.js');
      const cssFile = files.get('src/index.css') || files.get('index.css') || files.get('src/App.css');

      if (!appFile && !indexFile) {
        setError('No displayable files found. Generate some React components first.');
        return;
      }

      let htmlContent = '';

      if (indexFile) {
        // Use existing HTML file
        htmlContent = indexFile.content;
      } else {
        // Generate basic HTML template
        htmlContent = generateBasicHTML();
      }

      // Inject React code and CSS
      if (appFile) {
        htmlContent = injectReactCode(htmlContent, appFile.content, cssFile?.content);
      }

      // Add necessary dependencies
      htmlContent = addDependencies(htmlContent);

      setPreviewContent(htmlContent);
    } catch (error) {
      console.error('Preview generation error:', error);
      setError('Failed to generate preview: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const generateBasicHTML = () => {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Preview - ${currentProject?.name || 'React App'}</title>
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #fff;
        }
    </style>
</head>
<body>
    <div id="root"></div>
</body>
</html>`;
  };

  const injectReactCode = (htmlContent, jsContent, cssContent) => {
    // Extract component code and convert for browser execution
    let processedJS = jsContent;

    // Basic JSX to React.createElement transformation (simplified)
    processedJS = processedJS
      .replace(/import\s+.*?from\s+['"].*?['"];?\n?/g, '') // Remove imports
      .replace(/export\s+default\s+/, '') // Remove export default
      .replace(/className=/g, 'className=') // Ensure className is preserved
      .replace(/onClick=/g, 'onClick=') // Preserve event handlers
      .replace(/onChange=/g, 'onChange='); // Preserve event handlers

    const scriptContent = `
      <script crossorigin src="https://unpkg.com/react@18/umd/react.development.js"></script>
      <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
      <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
      ${cssContent ? `<style>${cssContent}</style>` : ''}
      <script type="text/babel">
        try {
          ${processedJS}
          
          // Render the component
          const root = ReactDOM.createRoot(document.getElementById('root'));
          const AppComponent = typeof App !== 'undefined' ? App : 
                              typeof LoginForm !== 'undefined' ? LoginForm :
                              () => React.createElement('div', {style: {padding: '20px'}}, 
                                'Component rendered successfully! Add more content in the chat.');
          
          root.render(React.createElement(AppComponent));
        } catch (error) {
          document.getElementById('root').innerHTML = 
            '<div style="padding: 20px; color: red; font-family: monospace;">' +
            '<h3>Preview Error:</h3><pre>' + error.message + '</pre></div>';
          console.error('Preview error:', error);
        }
      </script>
    `;

    return htmlContent.replace('</body>', `${scriptContent}</body>`);
  };

  const addDependencies = (htmlContent) => {
    // Add Tailwind CSS if not already present
    if (!htmlContent.includes('tailwindcss') && files.has('tailwind.config.js')) {
      const tailwindLink = '<script src="https://cdn.tailwindcss.com"></script>';
      htmlContent = htmlContent.replace('</head>', `${tailwindLink}</head>`);
    }

    return htmlContent;
  };

  const handleRefresh = () => {
    if (iframeRef.current) {
      iframeRef.current.src = iframeRef.current.src;
    }
  };

  const handleOpenInNewTab = () => {
    if (previewContent) {
      const blob = new Blob([previewContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
    }
  };

  const getCurrentViewport = () => viewportSizes[viewportSize];
  const ViewportIcon = getCurrentViewport().icon;

  if (!currentProject) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Project Loaded</h3>
          <p className="text-gray-500">Create or load a project to see the preview.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-background-primary">
      {/* Header */}
      <div className="flex-shrink-0 bg-background-secondary border-b border-dark-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h3 className="text-sm font-medium text-white">Live Preview</h3>
            {files.size > 0 && (
              <span className="text-xs text-dark-500 bg-background-tertiary px-2 py-1 rounded">
                {files.size} file{files.size !== 1 ? 's' : ''}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Viewport Size Selector */}
            <div className="flex items-center bg-background-tertiary rounded-lg p-1">
              {Object.entries(viewportSizes).map(([size, config]) => {
                const Icon = config.icon;
                return (
                  <button
                    key={size}
                    onClick={() => setViewportSize(size)}
                    className={`p-2 rounded transition-colors ${
                      viewportSize === size
                        ? 'bg-primary-500 text-white'
                        : 'text-dark-500 hover:text-white hover:bg-background-secondary'
                    }`}
                    title={`${size} view`}
                  >
                    <Icon className="h-4 w-4" />
                  </button>
                );
              })}
            </div>

            <button
              onClick={handleRefresh}
              className="btn-secondary text-sm px-3 py-1 flex items-center gap-2"
              disabled={isLoading}
            >
              <RefreshCw className={`h-3 w-3 ${isLoading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            <button
              onClick={handleOpenInNewTab}
              className="btn-secondary text-sm px-3 py-1 flex items-center gap-2"
              disabled={!previewContent}
            >
              <ExternalLink className="h-3 w-3" />
              <span className="hidden sm:inline">Open</span>
            </button>
          </div>
        </div>
      </div>

      {/* Preview Content */}
      <div className="flex-1 flex items-center justify-center bg-gray-100 p-4">
        {isLoading ? (
          <div className="text-center">
            <LoadingSpinner size="large" />
            <p className="text-dark-500 mt-4">Generating preview...</p>
          </div>
        ) : error ? (
          <div className="text-center max-w-md">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <h4 className="text-red-800 font-medium mb-2">Preview Error</h4>
              <p className="text-red-600 text-sm mb-4">{error}</p>
              <button
                onClick={generatePreview}
                className="btn-primary text-sm"
              >
                Retry
              </button>
            </div>
          </div>
        ) : files.size === 0 ? (
          <div className="text-center">
            <div className="h-16 w-16 bg-background-secondary rounded-full flex items-center justify-center mx-auto mb-4">
              <Monitor className="h-8 w-8 text-dark-500" />
            </div>
            <h3 className="text-lg font-medium text-dark-700 mb-2">
              No Files to Preview
            </h3>
            <p className="text-dark-500 mb-4">
              Generate some React components using the chat panel to see a live preview.
            </p>
          </div>
        ) : (
          <div
            className="bg-white rounded-lg shadow-lg border transition-all duration-300"
            style={{
              width: getCurrentViewport().width,
              height: getCurrentViewport().height,
              maxWidth: '100%',
              maxHeight: '100%',
            }}
          >
            {previewContent && (
              <iframe
                ref={iframeRef}
                srcDoc={previewContent}
                className="w-full h-full rounded-lg"
                title="Preview"
                sandbox="allow-scripts allow-same-origin"
              />
            )}
          </div>
        )}
      </div>

      {/* Status Bar */}
      {previewContent && (
        <div className="flex-shrink-0 bg-background-secondary border-t border-dark-200 px-4 py-2">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-4 text-dark-500">
              <span>Viewport: {viewportSize}</span>
              <span>Files: {files.size}</span>
              <span>Size: {getCurrentViewport().width} × {getCurrentViewport().height}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-green-400">Live</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PreviewPanel;