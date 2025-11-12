/**
 * Setup proxy for development server
 * Configures headers needed for WebContainer SharedArrayBuffer support
 */

const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  // Add headers needed for crossOriginIsolated
  app.use((req, res, next) => {
    // Enable cross-origin isolation
    res.header('Cross-Origin-Opener-Policy', 'same-origin');
    res.header('Cross-Origin-Embedder-Policy', 'require-corp');
    
    // Allow cross-origin resource sharing
    res.header('Cross-Origin-Resource-Policy', 'cross-origin');
    
    next();
  });

  // Proxy API calls to backend
  app.use(
    '/api',
    createProxyMiddleware({
      target: process.env.REACT_APP_API_URL || 'http://localhost:3001',
      changeOrigin: true,
      pathRewrite: {
        '^/api': '/api'
      }
    })
  );
};
