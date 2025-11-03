import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { processBrandIntake } from '../../../server/workers/brand-crawler.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { brandId, websiteUrl } = await req.json();

    if (!brandId || !websiteUrl) {
      return new Response(
        JSON.stringify({ error: 'brandId and websiteUrl are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client with service role
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log(`[Edge Function] Processing brand intake for ${brandId}`);

    // Process brand intake (crawler + AI)
    const brandKit = await processBrandIntake(brandId, websiteUrl, supabase);

    // Update brand with generated data
    await supabase
      .from('brands')
      .update({
        brand_kit: {
          ...(brandKit as any),
          processed_at: new Date().toISOString()
        },
        voice_summary: brandKit.voice_summary,
        visual_summary: {
          colors: brandKit.colors,
          style: 'extracted from website'
        },
        primary_color: brandKit.colors.primary
      })
      .eq('id', brandId);

    console.log(`[Edge Function] Successfully processed brand ${brandId}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        brandKit,
        message: 'Brand intake processed successfully'
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  } catch (error) {
    console.error('[Edge Function] Error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to process brand intake',
        details: error.stack
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
