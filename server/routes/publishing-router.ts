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

const router = Router();

// OAuth routes
router.post('/oauth/initiate', initiateOAuth);
router.get('/oauth/callback/:platform', handleOAuthCallback);

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
