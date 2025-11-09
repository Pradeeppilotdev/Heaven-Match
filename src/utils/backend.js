export const getBackendURL = () => {
  // Use environment variable if set (works for both local and production)
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }

  if (process.env.REACT_APP_PROXY_URL) {
    return process.env.REACT_APP_PROXY_URL;
  }

  const hostname = window.location.hostname;

  if (process.env.NODE_ENV === 'production') {
    // In production without REACT_APP_API_URL, return empty string
    // This will cause relative URLs to be used
    return '';
  }

  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://localhost:3001';
  }

  if (hostname.match(/^(192\.168\.|10\.|172\.(1[6-9]|2[0-9]|3[0-1])\.)/)) {
    return `http://${hostname}:3001`;
  }

  return 'http://localhost:3001';
};

export const withBackendURL = (path) => {
  const baseURL = getBackendURL();
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const cleanBase = baseURL.endsWith('/') ? baseURL.slice(0, -1) : baseURL;
  return `${cleanBase}${cleanPath}`;
};


