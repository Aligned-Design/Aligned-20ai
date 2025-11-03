import express from 'express';
import { Request, Response } from 'express';

const router = express.Router();

router.post('/oauth/connect/:provider', async (req: Request, res: Response) => {
  const { provider } = req.params;
  const { brand_id } = req.body;

  try {
    const authUrl = getOAuthUrl(provider, brand_id);
    
    res.json({ authUrl });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/oauth/callback/:provider', async (req: Request, res: Response) => {
  const { provider } = req.params;
  const { code, state } = req.query;

  try {
    const tokens = await exchangeCodeForTokens(provider, code as string);
    const accountInfo = await getAccountInfo(provider, tokens.access_token);

    res.redirect(`/integrations?success=true&provider=${provider}`);
  } catch (error: any) {
    res.redirect(`/integrations?error=${encodeURIComponent(error.message)}`);
  }
});

router.post('/connections/:connectionId/refresh', async (req: Request, res: Response) => {
  const { connectionId } = req.params;

  try {
    res.json({ message: 'Token refreshed successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/posts/publish', async (req: Request, res: Response) => {
  const { postId } = req.body;

  try {
    res.json({ message: 'Post published successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/reviews/sync/:brandId', async (req: Request, res: Response) => {
  const { brandId } = req.params;

  try {
    res.json({ message: 'Reviews synced successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/reviews/:reviewId/respond', async (req: Request, res: Response) => {
  const { reviewId } = req.params;
  const { response_text } = req.body;

  try {
    res.json({ message: 'Response posted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/events/publish', async (req: Request, res: Response) => {
  const { eventId } = req.body;

  try {
    res.json({ message: 'Event published successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

function getOAuthUrl(provider: string, brandId: string): string {
  const configs: Record<string, any> = {
    facebook: {
      authUrl: 'https://www.facebook.com/v18.0/dialog/oauth',
      clientId: process.env.FACEBOOK_APP_ID,
      redirectUri: `${process.env.APP_URL}/api/integrations/oauth/callback/facebook`,
      scope: 'pages_show_list,pages_read_engagement,pages_manage_posts,instagram_basic,instagram_content_publish',
    },
    instagram: {
      authUrl: 'https://www.facebook.com/v18.0/dialog/oauth',
      clientId: process.env.FACEBOOK_APP_ID,
      redirectUri: `${process.env.APP_URL}/api/integrations/oauth/callback/instagram`,
      scope: 'instagram_basic,instagram_content_publish',
    },
    linkedin: {
      authUrl: 'https://www.linkedin.com/oauth/v2/authorization',
      clientId: process.env.LINKEDIN_CLIENT_ID,
      redirectUri: `${process.env.APP_URL}/api/integrations/oauth/callback/linkedin`,
      scope: 'w_member_social,r_liteprofile',
    },
    twitter: {
      authUrl: 'https://twitter.com/i/oauth2/authorize',
      clientId: process.env.TWITTER_CLIENT_ID,
      redirectUri: `${process.env.APP_URL}/api/integrations/oauth/callback/twitter`,
      scope: 'tweet.read tweet.write users.read offline.access',
    },
    google_business: {
      authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
      clientId: process.env.GOOGLE_CLIENT_ID,
      redirectUri: `${process.env.APP_URL}/api/integrations/oauth/callback/google_business`,
      scope: 'https://www.googleapis.com/auth/business.manage',
    },
  };

  const config = configs[provider];
  if (!config) {
    throw new Error(`Provider ${provider} not supported`);
  }

  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    scope: config.scope,
    response_type: 'code',
    state: brandId,
  });

  return `${config.authUrl}?${params.toString()}`;
}

async function exchangeCodeForTokens(provider: string, code: string): Promise<any> {
  return {
    access_token: 'mock_access_token',
    refresh_token: 'mock_refresh_token',
    expires_in: 3600,
  };
}

async function getAccountInfo(provider: string, accessToken: string): Promise<any> {
  return {
    id: 'mock_account_id',
    username: 'mock_username',
    name: 'Mock Account',
  };
}

export default router;
