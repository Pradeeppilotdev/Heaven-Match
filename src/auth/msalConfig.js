// Microsoft Azure AD (MSAL) Configuration
// This file configures the Microsoft Authentication Library for the application
import { LogLevel } from "@azure/msal-browser";

// Get environment variables
const CLIENT_ID = process.env.REACT_APP_AAD_CLIENT_ID;
const TENANT_ID = process.env.REACT_APP_AAD_TENANT_ID;

// Validate that required environment variables are set
if (!CLIENT_ID || CLIENT_ID === "" || CLIENT_ID === "your-azure-ad-client-id-here") {
  console.error(
    "❌ REACT_APP_AAD_CLIENT_ID is not set!\n" +
    "Please create a .env file in the root directory with:\n" +
    "REACT_APP_AAD_CLIENT_ID=your-actual-client-id\n\n" +
    "See ENV_SETUP.md for detailed instructions."
  );
}

if (!TENANT_ID || TENANT_ID === "" || TENANT_ID === "your-azure-ad-tenant-id-here") {
  console.error(
    "❌ REACT_APP_AAD_TENANT_ID is not set!\n" +
    "Please create a .env file in the root directory with:\n" +
    "REACT_APP_AAD_TENANT_ID=your-actual-tenant-id\n\n" +
    "See ENV_SETUP.md for detailed instructions."
  );
}

/**
 * MSAL Configuration Object
 * Configure your Azure AD app registration details here
 * Get these values from: https://portal.azure.com -> Azure Active Directory -> App registrations
 */
export const msalConfig = {
  auth: {
    clientId: CLIENT_ID || "", // Your Azure AD Application (client) ID
    authority: `https://login.microsoftonline.com/${TENANT_ID || "common"}`, // Tenant ID or "common" for multi-tenant
    knownAuthorities: [], // Optional: specify trusted authorities
    redirectUri: window.location.origin, // Where to redirect after login (e.g., http://localhost:3000)
    postLogoutRedirectUri: window.location.origin, // Where to redirect after logout
  },
  cache: {
    cacheLocation: "sessionStorage", // Store tokens in sessionStorage (cleared on tab close)
    storeAuthStateInCookie: false, // Set to true if you have issues with IE11 or Edge
  },
  system: {
    loggerOptions: {
      loggerCallback: (level, message, containsPii) => {
        if (containsPii) {
          return;
        }
        switch (level) {
          case LogLevel.Error:
            console.error(message);
            return;
          case LogLevel.Warning:
            console.warn(message);
            return;
          case LogLevel.Info:
            console.info(message);
            return;
          case LogLevel.Verbose:
            console.debug(message);
            return;
          default:
            return;
        }
      },
      logLevel: LogLevel.Warning, // Set to Info or Verbose for more detailed logging
    },
  },
};

/**
 * Scopes requested during login
 * These determine what information and permissions the app can access
 */
export const loginRequest = {
  scopes: ["openid", "profile", "email", "User.Read"], // Basic profile and email access
};

/**
 * Scopes for acquiring access tokens (for API calls)
 */
export const tokenRequest = {
  scopes: ["openid", "profile", "email"],
};

