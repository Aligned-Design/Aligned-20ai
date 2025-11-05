import crypto from 'crypto';
import { Platform, OAuthFlow, PlatformConnection } from '@shared/publishing';
import { oauthStateCache } from './oauth-state-cache';

interface OAuthConfig {
  authUrl: string;
  tokenUrl: string;
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scope: string[];
}

const OAUTH_CONFIGS: Record<Platform, OAuthConfig> = {
  instagram: {
    authUrl: 'https://api.instagram.com/oauth/authorize',
    tokenUrl: 'https://api.instagram.com/oauth/access_token',
    clientId: process.env.INSTAGRAM_CLIENT_ID!,
    clientSecret: process.env.INSTAGRAM_CLIENT_SECRET!,
    redirectUri: `${process.env.APP_URL}/api/oauth/instagram/callback`,
    scope: ['user_profile', 'user_media']
  },
  facebook: {
    authUrl: 'https://www.facebook.com/v18.0/dialog/oauth',
    tokenUrl: 'https://graph.facebook.com/v18.0/oauth/access_token',
    clientId: process.env.FACEBOOK_CLIENT_ID!,
    clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
    redirectUri: `${process.env.APP_URL}/api/oauth/facebook/callback`,
    scope: ['pages_manage_posts', 'pages_read_engagement', 'business_management']
  },
  linkedin: {
    authUrl: 'https://www.linkedin.com/oauth/v2/authorization',
    tokenUrl: 'https://www.linkedin.com/oauth/v2/accessToken',
    clientId: process.env.LINKEDIN_CLIENT_ID!,
    clientSecret: process.env.LINKEDIN_CLIENT_SECRET!,
    redirectUri: `${process.env.APP_URL}/api/oauth/linkedin/callback`,
    scope: ['w_member_social', 'r_liteprofile', 'r_emailaddress']
  },
  twitter: {
    authUrl: 'https://twitter.com/i/oauth2/authorize',
    tokenUrl: 'https://api.twitter.com/2/oauth2/token',
    clientId: process.env.TWITTER_CLIENT_ID!,
    clientSecret: process.env.TWITTER_CLIENT_SECRET!,
    redirectUri: `${process.env.APP_URL}/api/oauth/twitter/callback`,
    scope: ['tweet.read', 'tweet.write', 'users.read']
  },
  google_business: {
    authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenUrl: 'https://oauth2.googleapis.com/token',
    clientId: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    redirectUri: `${process.env.APP_URL}/api/oauth/google/callback`,
    scope: ['https://www.googleapis.com/auth/business.manage']
  }
};

export function generateOAuthUrl(platform: Platform, brandId: string): OAuthFlow {
  const config = OAUTH_CONFIGS[platform];
  const state = crypto.randomBytes(32).toString('hex');
  const codeVerifier = crypto.randomBytes(32).toString('base64url');

  // Store state and code verifier in secure cache with 10-minute expiration
  // This prevents CSRF attacks and ensures state can only be used once
  oauthStateCache.store(state, brandId, platform, codeVerifier);
  
  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    scope: config.scope.join(' '),
    state: `${state}:${brandId}`,
    response_type: 'code'
  });
  
  // Add platform-specific parameters
  if (platform === 'twitter') {
    const codeChallenge = crypto
      .createHash('sha256')
      .update(codeVerifier)
      .digest('base64url');
    params.append('code_challenge', codeChallenge);
    params.append('code_challenge_method', 'S256');
  }
  
  const authUrl = `${config.authUrl}?${params.toString()}`;
  
  return {
    platform,
    authUrl,
    state: `${state}:${brandId}`,
    codeVerifier: platform === 'twitter' ? codeVerifier : undefined,
    expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString() // 10 minutes
  };
}

export async function exchangeCodeForToken(
  platform: Platform,
  code: string,
  state: string
): Promise<{
  accessToken: string;
  refreshToken?: string;
  expiresIn?: number;
  accountInfo: unknown;
}> {
  const config = OAUTH_CONFIGS[platform];

  // ✅ SECURE: Retrieve and validate state from cache
  // This prevents CSRF attacks and verifies we initiated this OAuth flow
  const stateData = oauthStateCache.retrieve(state);
  if (!stateData) {
    throw new Error(
      'Invalid or expired OAuth state. The authorization request may have expired. Please start again.'
    );
  }

  // Verify platform matches
  if (stateData.platform !== platform) {
    throw new Error(
      `Platform mismatch: expected ${stateData.platform}, got ${platform}`
    );
  }

  const { __brandId, codeVerifier } = stateData;

  const tokenParams = new URLSearchParams({
    client_id: config.clientId,
    client_secret: config.clientSecret,
    redirect_uri: config.redirectUri,
    code,
    grant_type: 'authorization_code'
  });

  // Add platform-specific parameters
  if (platform === 'twitter') {
    // ✅ SECURE: Retrieve code_verifier from cache (PKCE verification)
    // This ensures the token exchange came from the same client that initiated the OAuth flow
    tokenParams.append('code_verifier', codeVerifier);
  }
  
  const response = await fetch(config.tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept': 'application/json'
    },
    body: tokenParams.toString()
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Token exchange failed: ${error}`);
  }
  
  const tokenData = await response.json();
  
  // Get account information
  const accountInfo = await getAccountInfo(platform, tokenData.access_token);
  
  return {
    accessToken: tokenData.access_token,
    refreshToken: tokenData.refresh_token,
    expiresIn: tokenData.expires_in,
    accountInfo
  };
}

async function getAccountInfo(platform: Platform, accessToken: string): Promise<unknown> {
  const endpoints = {
    instagram: 'https://graph.instagram.com/me?fields=id,username,account_type,media_count',
    facebook: 'https://graph.facebook.com/me?fields=id,name,picture',
    linkedin: 'https://api.linkedin.com/v2/me?projection=(id,firstName,lastName,profilePicture)',
    twitter: 'https://api.twitter.com/2/users/me?user.fields=id,name,username,profile_image_url',
    google_business: 'https://mybusinessaccountmanagement.googleapis.com/v1/accounts'
  };
  
  const response = await fetch(endpoints[platform], {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Accept': 'application/json'
    }
  });
  
  if (!response.ok) {
    throw new Error(`Failed to get account info: ${response.statusText}`);
  }
  
  return response.json();
}

export async function refreshAccessToken(connection: PlatformConnection): Promise<{
  accessToken: string;
  refreshToken?: string;
  expiresIn?: number;
}> {
  if (!connection.refreshToken) {
    throw new Error('No refresh token available');
  }
  
  const config = OAUTH_CONFIGS[connection.platform];
  
  const params = new URLSearchParams({
    client_id: config.clientId,
    client_secret: config.clientSecret,
    refresh_token: connection.refreshToken,
    grant_type: 'refresh_token'
  });
  
  const response = await fetch(config.tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept': 'application/json'
    },
    body: params.toString()
  });
  
  if (!response.ok) {
    throw new Error(`Token refresh failed: ${response.statusText}`);
  }
  
  const tokenData = await response.json();
  
  return {
    accessToken: tokenData.access_token,
    refreshToken: tokenData.refresh_token || connection.refreshToken,
    expiresIn: tokenData.expires_in
  };
}

export function isTokenExpired(connection: PlatformConnection): boolean {
  if (!connection.tokenExpiresAt) {
    return false; // Assume valid if no expiry set
  }
  
  const expiryTime = new Date(connection.tokenExpiresAt).getTime();
  const now = Date.now();
  const buffer = 5 * 60 * 1000; // 5 minute buffer
  
  return now >= (expiryTime - buffer);
}
