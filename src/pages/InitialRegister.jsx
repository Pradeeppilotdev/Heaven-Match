// Professional LinkedIn-style Registration Page with Microsoft Authenticator
// This page provides a clean, professional interface for users to sign in with Microsoft
import React, { useEffect } from 'react';
import { useMsal } from '@azure/msal-react';
import { useNavigate } from 'react-router-dom';
import { loginRequest } from '../auth/msalConfig';
import { upsertUserWithToken } from '../auth/authApi';

const InitialRegister = () => {
  const { instance, accounts } = useMsal();
  const navigate = useNavigate();

  // Handle post-authentication flow
  useEffect(() => {
    async function handlePostAuth() {
      if (!accounts || accounts.length === 0) return;

      try {
        // Acquire token silently
        const tokenResponse = await instance.acquireTokenSilent({
          account: accounts[0],
          scopes: loginRequest.scopes,
        });

        // Upsert user in backend
        const { user } = await upsertUserWithToken(tokenResponse.idToken);

        // Store registration status
        localStorage.setItem('userRegistered', 'true');
        localStorage.setItem('userEmail', user.email || accounts[0].username);
        localStorage.setItem('userName', user.name || accounts[0].name);

        // Redirect based on profile completion status
        if (user.isProfileComplete) {
          navigate('/dashboard', { replace: true });
        } else {
          navigate('/register', { replace: true });
        }
      } catch (error) {
        console.error('Post-authentication error:', error);
      }
    }

    handlePostAuth();
  }, [accounts, instance, navigate]);

  // Handle Microsoft sign-in
  const handleSignIn = () => {
    // Check if client ID is configured
    const clientId = process.env.REACT_APP_AAD_CLIENT_ID;
    if (!clientId || clientId === "" || clientId === "your-azure-ad-client-id-here") {
      alert(
        "Microsoft Authentication is not configured.\n\n" +
        "Please:\n" +
        "1. Create a .env file in the project root\n" +
        "2. Add your Azure AD credentials:\n" +
        "   REACT_APP_AAD_CLIENT_ID=your-client-id\n" +
        "   REACT_APP_AAD_TENANT_ID=your-tenant-id\n" +
        "3. Restart the development server\n\n" +
        "See ENV_SETUP.md for detailed instructions."
      );
      return;
    }

    instance.loginRedirect(loginRequest).catch((error) => {
      console.error('Login error:', error);
      // Show user-friendly error message
      if (error.errorCode === "invalid_client" || error.message?.includes("client_id")) {
        alert(
          "Authentication configuration error.\n\n" +
          "Please check that your .env file contains valid Azure AD credentials and restart the server."
        );
      }
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header - LinkedIn style */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <div className="w-8 h-8 bg-[#D81B60] rounded-lg flex items-center justify-center mr-2">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-xl font-semibold text-gray-900">HeavenMatch</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/')}
                className="text-gray-600 hover:text-gray-900 font-medium text-sm"
              >
                Sign in
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          {/* Card Container - LinkedIn style */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            {/* Header Section */}
            <div className="text-center mb-8">
              <h1 className="text-2xl font-semibold text-gray-900 mb-2">
                Join HeavenMatch
              </h1>
              <p className="text-sm text-gray-600">
                Start your journey to find true love
              </p>
            </div>

            {/* Microsoft Sign-In Button - Professional LinkedIn style */}
            <div className="space-y-4">
              <button
                onClick={handleSignIn}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-md bg-white text-gray-700 font-medium text-sm hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <svg className="w-5 h-5" viewBox="0 0 23 23" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="0" y="0" width="11" height="11" fill="#F25022"/>
                  <rect x="12" y="0" width="11" height="11" fill="#7FBA00"/>
                  <rect x="0" y="12" width="11" height="11" fill="#00A4EF"/>
                  <rect x="12" y="12" width="11" height="11" fill="#FFB900"/>
                </svg>
                <span>Continue with Microsoft</span>
              </button>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">or</span>
                </div>
              </div>

              {/* Information Box */}
              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-blue-700">
                      <strong>Secure Authentication:</strong> We use Microsoft's enterprise-grade security to protect your account. Your Microsoft credentials are never shared with us.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-xs text-center text-gray-500">
                By continuing, you agree to HeavenMatch's{' '}
                <a href="#" className="text-[#D81B60] hover:underline font-medium">
                  User Agreement
                </a>
                ,{' '}
                <a href="#" className="text-[#D81B60] hover:underline font-medium">
                  Privacy Policy
                </a>
                , and{' '}
                <a href="#" className="text-[#D81B60] hover:underline font-medium">
                  Cookie Policy
                </a>
                .
              </p>
            </div>
          </div>

          {/* Sign In Link */}
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Already on HeavenMatch?{' '}
              <button
                onClick={() => navigate('/')}
                className="text-[#D81B60] font-semibold hover:underline"
              >
                Sign in
              </button>
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-600">
            <div className="mb-4 md:mb-0">
              <span className="font-semibold text-gray-900">HeavenMatch</span>
              <span className="mx-2">•</span>
              <span>© 2024</span>
            </div>
            <div className="flex space-x-6">
              <a href="#" className="hover:text-gray-900">About</a>
              <a href="#" className="hover:text-gray-900">Accessibility</a>
              <a href="#" className="hover:text-gray-900">User Agreement</a>
              <a href="#" className="hover:text-gray-900">Privacy Policy</a>
              <a href="#" className="hover:text-gray-900">Cookie Policy</a>
              <a href="#" className="hover:text-gray-900">Copyright Policy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default InitialRegister;
