/**
 * Client Portal Authentication Routes
 * Handles token validation and generation for client portal access
 */

import { Router, RequestHandler } from 'express';
import { z } from 'zod';

const router = Router();

/**
 * In-memory token store (replace with database in production)
 * In real implementation, tokens would be stored in database with expiry
 */
interface StoredToken {
  token: string;
  brandId: string;
  brandName: string;
  clientId: string;
  clientEmail: string;
  createdAt: Date;
  expiresAt: Date;
  permissions: string[];
}

// Mock token store (replace with DB)
const tokenStore = new Map<string, StoredToken>();

// Token validation schema
const validateTokenSchema = z.object({
  token: z.string().min(1),
});

/**
 * POST /api/client-portal/validate-token
 * Validate a client portal access token
 */
export const validateToken: RequestHandler = (req, res) => {
  try {
    const { token } = validateTokenSchema.parse(req.body);

    // Check if token exists in store
    const storedToken = tokenStore.get(token);

    if (!storedToken) {
      return res.status(404).json({
        error: 'Token not found',
        code: 'INVALID_TOKEN',
      });
    }

    // Check if token is expired
    if (storedToken.expiresAt < new Date()) {
      // Remove expired token
      tokenStore.delete(token);
      return res.status(401).json({
        error: 'Token expired',
        code: 'EXPIRED_TOKEN',
      });
    }

    // Token is valid
    return res.json({
      valid: true,
      token: {
        token: storedToken.token,
        brandId: storedToken.brandId,
        brandName: storedToken.brandName,
        clientId: storedToken.clientId,
        clientEmail: storedToken.clientEmail,
        expiresAt: storedToken.expiresAt.toISOString(),
        permissions: storedToken.permissions,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Invalid request',
        details: error.errors,
      });
    }

    console.error('Token validation error:', error);
    return res.status(500).json({
      error: 'Server error',
    });
  }
};

/**
 * POST /api/client-portal/generate-token
 * Generate a new client portal access token (admin only)
 * 
 * In production, this would be called by the agency admin
 * to create portal links for their clients
 */
const generateTokenSchema = z.object({
  brandId: z.string(),
  brandName: z.string(),
  clientEmail: z.string().email(),
  expiryDays: z.number().min(1).max(90).default(30),
  permissions: z.array(z.string()).default(['view', 'approve', 'comment']),
});

export const generateToken: RequestHandler = (req, res) => {
  try {
    const data = generateTokenSchema.parse(req.body);

    // Generate secure token (in production, use crypto.randomBytes)
    const token = `cpt_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;

    // Calculate expiry
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + data.expiryDays);

    // Store token
    const storedToken: StoredToken = {
      token,
      brandId: data.brandId,
      brandName: data.brandName,
      clientId: `client_${data.clientEmail.split('@')[0]}`,
      clientEmail: data.clientEmail,
      createdAt: new Date(),
      expiresAt,
      permissions: data.permissions,
    };

    tokenStore.set(token, storedToken);

    // Return token details
    return res.json({
      token,
      portalUrl: `${req.protocol}://${req.get('host')}/client-portal/${token}`,
      expiresAt: expiresAt.toISOString(),
      brandId: data.brandId,
      brandName: data.brandName,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Invalid request',
        details: error.errors,
      });
    }

    console.error('Token generation error:', error);
    return res.status(500).json({
      error: 'Server error',
    });
  }
};

/**
 * POST /api/client-portal/revoke-token
 * Revoke a client portal token (admin only)
 */
const revokeTokenSchema = z.object({
  token: z.string(),
});

export const revokeToken: RequestHandler = (req, res) => {
  try {
    const { token } = revokeTokenSchema.parse(req.body);

    const existed = tokenStore.delete(token);

    if (!existed) {
      return res.status(404).json({
        error: 'Token not found',
      });
    }

    return res.json({
      success: true,
      message: 'Token revoked',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Invalid request',
        details: error.errors,
      });
    }

    console.error('Token revocation error:', error);
    return res.status(500).json({
      error: 'Server error',
    });
  }
};

/**
 * Initialize demo tokens for development
 * Creates a test token for brand "Aligned By Design"
 */
export function initializeDemoTokens(): void {
  const demoToken: StoredToken = {
    token: 'demo_client_token_123',
    brandId: 'brand_aligned_by_design',
    brandName: 'Aligned By Design',
    clientId: 'client_demo',
    clientEmail: 'client@alignedbydesign.com',
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
    permissions: ['view', 'approve', 'comment', 'upload'],
  };

  tokenStore.set(demoToken.token, demoToken);
  console.log('✅ Demo client portal token created: demo_client_token_123');
  console.log('   Access URL: /client-portal/demo_client_token_123');
}

// Routes
router.post('/validate-token', validateToken);
router.post('/generate-token', generateToken);
router.post('/revoke-token', revokeToken);

export default router;
