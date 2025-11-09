import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';


const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [sessionToken, setSessionToken] = useState(null);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    // Clear local state
    localStorage.removeItem('hm_token');
    localStorage.removeItem('hm_email');
    setSessionToken(null);
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  // Check authentication on mount
  useEffect(() => {
    const token = localStorage.getItem('hm_token');
    const userEmail = localStorage.getItem('hm_email');

    if (token && userEmail) {
      setSessionToken(token);
      setUser({ email: userEmail });
      setIsAuthenticated(true);
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, []);

  const login = (userData, token) => {
    localStorage.setItem('hm_token', token);
    localStorage.setItem('hm_email', userData.email);
    setSessionToken(token);
    setUser(userData);
    setIsAuthenticated(true);
  };

  const value = {
    isAuthenticated,
    user,
    sessionToken,
    loading,
    login,
    logout
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        flexDirection: 'column',
        gap: '16px'
      }}>
        <div style={{
          width: '48px',
          height: '48px',
          border: '4px solid #f3f4f6',
          borderTopColor: '#667eea',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <p style={{ color: '#718096' }}>Loading...</p>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

