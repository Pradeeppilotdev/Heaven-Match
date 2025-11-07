// Unified environment access that works in Vite and CRA builds
export const readEnv = (key) => {
  // Prefer Vite style
  if (typeof import.meta !== 'undefined' && import.meta.env && key in import.meta.env) {
    return import.meta.env[key];
  }
  // Fallback CRA / process.env (dev tooling/polyfilled in some setups)
  if (typeof process !== 'undefined' && process.env && key in process.env) {
    return process.env[key];
  }
  return undefined;
};

export const getGeminiApiKey = () =>
  readEnv('VITE_GEMINI_API_KEY') || readEnv('REACT_APP_GEMINI_API_KEY');

export const getOpenRouterApiKey = () =>
  readEnv('VITE_OPENROUTER_API_KEY') || readEnv('REACT_APP_OPENROUTER_API_KEY');



