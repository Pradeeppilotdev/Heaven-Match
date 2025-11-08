import { useCallback, useEffect, useState } from 'react';
import { getBackendURL } from '../utils/backend';

const fetchToken = async () => {
  const response = await fetch(`${getBackendURL()}/api/csrf-token`, {
    method: 'GET',
    credentials: 'include',
    headers: { 'Cache-Control': 'no-store' }
  });

  if (!response.ok) {
    throw new Error('Failed to obtain CSRF token');
  }

  const data = await response.json();
  return data.token || '';
};

const useCsrfToken = () => {
  const [csrfToken, setCsrfToken] = useState('');
  const [csrfError, setCsrfError] = useState(null);

  const refreshCsrfToken = useCallback(async () => {
    try {
      const token = await fetchToken();
      setCsrfToken(token);
      setCsrfError(null);
      return token;
    } catch (error) {
      console.error('CSRF token fetch error:', error);
      setCsrfError('Unable to establish a secure session. Please refresh the page and try again.');
      return '';
    }
  }, []);

  useEffect(() => {
    refreshCsrfToken();
  }, [refreshCsrfToken]);

  return { csrfToken, csrfError, refreshCsrfToken };
};

export default useCsrfToken;


