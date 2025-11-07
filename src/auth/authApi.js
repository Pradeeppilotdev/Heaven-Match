// Frontend API functions for authentication and user management
// These functions communicate with the backend server

/**
 * Upsert user after successful Microsoft authentication
 * Creates a new user or updates existing user in the database
 * @param {string} idToken - Microsoft ID token from MSAL
 * @returns {Promise<Object>} User object from the backend
 */
export async function upsertUserWithToken(idToken) {
  const response = await fetch("/api/auth/upsert", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify({}),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Failed to upsert user" }));
    throw new Error(error.error || "Failed to upsert user");
  }

  return response.json();
}

/**
 * Mark user profile as complete after filling detailed registration form
 * @param {string} idToken - Microsoft ID token from MSAL
 * @param {Object} payload - Profile data (jobTitle, department, phone, etc.)
 * @returns {Promise<Object>} Updated user object
 */
export async function markProfileComplete(idToken, payload) {
  const response = await fetch("/api/users/complete-profile", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Failed to complete profile" }));
    throw new Error(error.error || "Failed to complete profile");
  }

  return response.json();
}

/**
 * Get current user information
 * @param {string} idToken - Microsoft ID token from MSAL
 * @returns {Promise<Object>} User object from the backend
 */
export async function me(idToken) {
  const response = await fetch("/api/users/me", {
    headers: {
      Authorization: `Bearer ${idToken}`,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Failed to fetch user" }));
    throw new Error(error.error || "Failed to fetch user");
  }

  return response.json();
}

