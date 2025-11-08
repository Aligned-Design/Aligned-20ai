/**
 * Publishing Routes
 * Platform connections, OAuth, and publishing job management
 */

import { Router } from 'express';
import {
  initiateOAuth,
  handleOAuthCallback,
  getConnections,
  disconnectPlatform,
  publishContent,
  getPublishingJobs,
  retryJob,
  cancelJob,
  refreshToken,
  verifyConnection
} from './publishing';
import { oauthRateLimiters } from '../lib/rate-limiting';
import { validateOAuthState } from '../lib/csrf-middleware';
import { extractAuthMiddleware } from '../lib/auth-middleware';

const router = Router();

/**
 * ✅ SECURE: OAuth routes with rate limiting and CSRF validation
 * - Rate limited to prevent brute force attacks
 * - CSRF state validation on callback
 * - Auth context extraction on callback (required by handler)
 */
router.post('/oauth/initiate', oauthRateLimiters.initiate, initiateOAuth);
router.get(
  '/oauth/callback/:platform',
  oauthRateLimiters.callback,
  validateOAuthState,
  extractAuthMiddleware,
  handleOAuthCallback
);

// Connection management routes
router.get('/:brandId/connections', getConnections);
router.post('/:brandId/:platform/disconnect', disconnectPlatform);
router.post('/:brandId/:platform/refresh', refreshToken);
router.get('/:brandId/:platform/verify', verifyConnection);

// Publishing routes
router.post('/:brandId/publish', publishContent);
router.get('/:brandId/jobs', getPublishingJobs);
router.post('/:jobId/retry', retryJob);
router.post('/:jobId/cancel', cancelJob);

export default router;
