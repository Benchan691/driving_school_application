// Use localhost API in development, production API in production
// NOTE: API_BASE should NOT include /api since all fetch calls add /api/ themselves
const getApiBase = () => {
  // Check if we have an explicit API base URL set
  if (process.env.REACT_APP_API_BASE) {
    // Remove trailing /api if present since fetch calls add it
    const base = process.env.REACT_APP_API_BASE.replace(/\/api\/?$/, '');
    return base;
  }
  
  // In development (localhost), use local backend
  if (
    process.env.NODE_ENV === 'development' || 
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1'
  ) {
    return 'http://localhost:5002';
  }
  
  // In production, use production API
  return 'https://thetruthdrivingschool.ca';
};

export const API_BASE = getApiBase();


