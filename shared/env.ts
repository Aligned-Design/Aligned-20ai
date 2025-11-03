// Environment variable validation and access

// Server-side environment (Node.js)
export const serverEnv = {
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
  ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY || '',
  AI_PROVIDER: process.env.AI_PROVIDER || 'auto',
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '3001', 10),
} as const;

// Client-side environment (Vite)
export const clientEnv = {
  VITE_SUPABASE_URL: import.meta.env?.VITE_SUPABASE_URL || '',
  VITE_SUPABASE_ANON_KEY: import.meta.env?.VITE_SUPABASE_ANON_KEY || '',
  VITE_API_BASE_URL: import.meta.env?.VITE_API_BASE_URL || '/api',
} as const;

// Validation helpers
export function validateServerEnv(): boolean {
  const required = ['OPENAI_API_KEY', 'ANTHROPIC_API_KEY'] as const;
  const missing = required.filter(key => !serverEnv[key]);
  
  if (missing.length > 0) {
    console.warn(`Missing server environment variables: ${missing.join(', ')}`);
    return false;
  }
  
  return true;
}

export function validateClientEnv(): boolean {
  // Client env validation if needed
  return true;
}
