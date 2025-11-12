import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * Server-side Supabase Client with Demo Mode Support
 * 
 * CRITICAL: Uses SERVER_DEMO_MODE (server-only flag) to bypass Supabase entirely.
 * Lazy-initialized to prevent top-level crashes when credentials are missing.
 * Provides stub client in demo mode that returns mock data.
 */

// Check SERVER_DEMO_MODE first (server-only flag), fallback to VITE_DEMO_MODE
const isDemoMode = process.env.SERVER_DEMO_MODE === 'true' || process.env.VITE_DEMO_MODE === 'true';

// Log demo mode status once on module load
if (isDemoMode) {
  console.log('[DEMO MODE] Server bypassing Supabase - using stub client');
}

// Lazy-initialized Supabase client (only created when needed and NOT in demo mode)
let _supabaseClient: SupabaseClient | null = null;

/**
 * Stub Supabase client for demo mode
 * Returns mock data for common operations, never touches network
 */
const createStubClient = (): any => {
  const stubMethods = {
    from: (table: string) => ({
      select: () => ({
        eq: () => ({
          data: [],
          error: null,
        }),
        in: () => ({
          order: () => ({
            data: [],
            error: null,
          }),
        }),
        single: () => ({
          data: null,
          error: null,
        }),
      }),
      insert: () => ({
        data: null,
        error: null,
      }),
      update: () => ({
        eq: () => ({
          data: null,
          error: null,
        }),
      }),
      delete: () => ({
        eq: () => ({
          data: null,
          error: null,
        }),
      }),
    }),
    storage: {
      from: (bucket: string) => ({
        upload: () => ({
          data: { path: 'mock-path' },
          error: null,
        }),
        list: () => ({
          data: [],
          error: null,
        }),
        getPublicUrl: (path: string) => ({
          data: { publicUrl: `https://demo.supabase.co/storage/v1/object/public/${bucket}/${path}` },
        }),
      }),
      listBuckets: () => ({
        data: [],
        error: null,
      }),
      createBucket: () => ({
        data: null,
        error: null,
      }),
    },
    auth: {
      getUser: () => ({
        data: { user: null },
        error: null,
      }),
      signInWithPassword: () => ({
        data: { user: null, session: null },
        error: null,
      }),
    },
  };

  return stubMethods as any;
};

/**
 * Get Supabase client (lazy-initialized)
 * Returns stub client in demo mode, real client otherwise
 */
export function getSupabaseClient(): SupabaseClient | any {
  // Demo mode: return stub client (no network calls)
  if (isDemoMode) {
    return createStubClient();
  }

  // Real mode: lazy-initialize real client
  if (!_supabaseClient) {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('⚠️ Missing Supabase credentials. Set SERVER_DEMO_MODE=true to bypass.');
      throw new Error(
        'Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. Set SERVER_DEMO_MODE=true for demo mode.'
      );
    }

    _supabaseClient = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }

  return _supabaseClient;
}

/**
 * Backward compatibility: export as "supabase" for existing code
 * This is a getter that returns the lazy-initialized client
 */
export const supabase = new Proxy({} as SupabaseClient, {
  get: (target, prop) => {
    const client = getSupabaseClient();
    return client[prop as keyof typeof client];
  },
});

/**
 * Ensure brand bucket exists
 * In demo mode, this is a no-op that returns a mock bucket name
 */
export async function ensureBrandBucket(brandId: string): Promise<string> {
  const bucketName = `brand-${brandId}`;

  // Demo mode: return mock bucket name (no actual creation)
  if (isDemoMode) {
    return bucketName;
  }

  // Real mode: create bucket if it doesn't exist
  const client = getSupabaseClient();
  const { data: buckets } = await client.storage.listBuckets();
  const bucketExists = buckets?.some((bucket: any) => bucket.name === bucketName);

  if (!bucketExists) {
    const { error } = await client.storage.createBucket(bucketName, {
      public: false,
      allowedMimeTypes: ['image/*', 'video/*'],
      fileSizeLimit: 50 * 1024 * 1024, // 50MB
    });

    if (error) {
      throw new Error(`Failed to create bucket: ${error.message}`);
    }
  }

  return bucketName;
}

/**
 * Helper to check if server is in demo mode
 */
export function isServerDemoMode(): boolean {
  return isDemoMode;
}
