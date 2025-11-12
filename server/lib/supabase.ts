import { createClient } from '@supabase/supabase-js';

// Demo mode uses placeholder credentials
const isDemoMode = process.env.VITE_DEMO_MODE === 'true';
const DEMO_URL = 'https://demo.supabase.co';
const DEMO_KEY = 'demo-service-role-key';

const supabaseUrl = isDemoMode ? DEMO_URL : process.env.SUPABASE_URL!;
const supabaseServiceKey = isDemoMode ? DEMO_KEY : process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Warn if not in demo mode and credentials are missing
if (!isDemoMode && (!supabaseUrl || !supabaseServiceKey)) {
  console.error('⚠️ Missing Supabase credentials. Set VITE_DEMO_MODE=true to bypass.');
  throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
}

export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Log demo mode status (once on server startup)
if (isDemoMode) {
  console.log('[DEMO MODE] Server using mock Supabase credentials');
}

export async function ensureBrandBucket(brandId: string): Promise<string> {
  const bucketName = `brand-${brandId}`;
  
  // Check if bucket exists
  const { data: buckets } = await supabase.storage.listBuckets();
  const bucketExists = buckets?.some(bucket => bucket.name === bucketName);
  
  if (!bucketExists) {
    const { error } = await supabase.storage.createBucket(bucketName, {
      public: false,
      allowedMimeTypes: ['image/*', 'video/*'],
      fileSizeLimit: 50 * 1024 * 1024 // 50MB
    });
    
    if (error) {
      throw new Error(`Failed to create bucket: ${error.message}`);
    }
  }
  
  return bucketName;
}
