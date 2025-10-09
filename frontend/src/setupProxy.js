const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  // When accessing via domain (thetruthdrivingschool.ca), Cloudflare tunnel handles routing
  // When accessing via localhost, proxy to backend
  const apiTarget = process.env.REACT_APP_API_BASE || 'http://localhost:5002';
  
  // Only proxy if accessing via localhost
  if (apiTarget.includes('localhost')) {
    app.use(
      '/api',
      createProxyMiddleware({
        target: 'http://localhost:5002',
        changeOrigin: true,
      })
    );
  }
  
  // Pictures are served directly from frontend/public/pictures
};

