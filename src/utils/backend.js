export const getBackendURL = () => {
  if (process.env.REACT_APP_PROXY_URL) {
    return process.env.REACT_APP_PROXY_URL;
  }

  const hostname = window.location.hostname;

  if (process.env.NODE_ENV === 'production') {
    const origin = window.location.origin;
    const baseUrl = origin.includes(':') ? origin.split(':').slice(0, -1).join(':') : origin;
    return `${baseUrl}:3001`;
  }

  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://localhost:3001';
  }

  if (hostname.match(/^(192\.168\.|10\.|172\.(1[6-9]|2[0-9]|3[0-1])\.)/)) {
    return `http://${hostname}:3001`;
  }

  return 'http://localhost:3001';
};

export const withBackendURL = (path) => `${getBackendURL()}${path}`;


