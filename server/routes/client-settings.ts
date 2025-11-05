/**
 * Client Settings API routes
 * Manages email preferences, notification settings, and account preferences
 */

import { RequestHandler } from 'express';
import {
  ClientSettings,
  ClientSettingsSchema,
  UpdateClientSettingsSchema,
  DEFAULT_CLIENT_SETTINGS,
  UnsubscribeRequest,
  EmailNotificationType,
} from '@shared/client-settings';
import { logAuditAction } from '../lib/audit-logger';
import crypto from 'crypto';

// Mock storage for client settings (replace with database)
const clientSettingsStore: Map<string, ClientSettings> = new Map();

/**
 * GET /api/client/settings
 * Retrieve client settings for current user
 */
export const getClientSettings: RequestHandler = async (req, res) => {
  try {
    const clientId = req.headers['x-client-id'] as string;
    const brandId = req.headers['x-brand-id'] as string;

    if (!clientId || !brandId) {
      return res.status(400).json({
        error: 'Missing required headers: x-client-id, x-brand-id',
      });
    }

    const key = `${clientId}:${brandId}`;
    let settings = clientSettingsStore.get(key);

    if (!settings) {
      // Create default settings if not found
      settings = {
        id: `settings_${Date.now()}`,
        clientId,
        brandId,
        ...DEFAULT_CLIENT_SETTINGS,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      clientSettingsStore.set(key, settings);
    }

    res.json({
      success: true,
      settings,
    });
  } catch (error) {
    console.error('[Client Settings] Get error:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to retrieve settings',
    });
  }
};

/**
 * PUT /api/client/settings
 * Update client settings
 */
export const updateClientSettings: RequestHandler = async (req, res) => {
  try {
    const clientId = req.headers['x-client-id'] as string;
    const brandId = req.headers['x-brand-id'] as string;
    const userId = req.headers['x-user-id'] as string;
    const userEmail = req.headers['x-user-email'] as string;

    if (!clientId || !brandId) {
      return res.status(400).json({
        error: 'Missing required headers: x-client-id, x-brand-id',
      });
    }

    // Validate update payload
    const validationResult = UpdateClientSettingsSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: validationResult.error.errors,
      });
    }

    const key = `${clientId}:${brandId}`;
    let settings = clientSettingsStore.get(key);

    if (!settings) {
      settings = {
        id: `settings_${Date.now()}`,
        clientId,
        brandId,
        ...DEFAULT_CLIENT_SETTINGS,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }

    // Merge updates
    const updates = validationResult.data;
    const updatedSettings: ClientSettings = {
      ...settings,
      ...updates,
      emailPreferences: {
        ...settings.emailPreferences,
        ...(updates.emailPreferences || {}),
      },
      unsubscribedTypes: (updates.unsubscribedTypes || settings.unsubscribedTypes) as EmailNotificationType[],
      updatedAt: new Date().toISOString(),
      lastModifiedBy: userEmail,
    };

    clientSettingsStore.set(key, updatedSettings);

    // Log the change
    await logAuditAction(
      brandId,
      'settings',
      userId || 'system',
      userEmail || 'system',
      'SETTINGS_UPDATED',
      {
        changes: {
          emailPreferences: updates.emailPreferences ? true : false,
          timezone: updates.timezone ? true : false,
          language: updates.language ? true : false,
        },
      }
    );

    res.json({
      success: true,
      settings: updatedSettings,
      message: 'Settings updated successfully',
    });
  } catch (error) {
    console.error('[Client Settings] Update error:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to update settings',
    });
  }
};

/**
 * POST /api/client/settings/email-preferences
 * Update email preferences only
 */
export const updateEmailPreferences: RequestHandler = async (req, res) => {
  try {
    const clientId = req.headers['x-client-id'] as string;
    const brandId = req.headers['x-brand-id'] as string;
    const userId = req.headers['x-user-id'] as string;
    const userEmail = req.headers['x-user-email'] as string;

    const key = `${clientId}:${brandId}`;
    let settings = clientSettingsStore.get(key);

    if (!settings) {
      settings = {
        id: `settings_${Date.now()}`,
        clientId,
        brandId,
        ...DEFAULT_CLIENT_SETTINGS,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }

    const updatedSettings = {
      ...settings,
      emailPreferences: {
        ...settings.emailPreferences,
        ...req.body,
      },
      updatedAt: new Date().toISOString(),
      lastModifiedBy: userEmail,
    };

    clientSettingsStore.set(key, updatedSettings);

    // Log the change
    await logAuditAction(
      brandId,
      'settings',
      userId || 'system',
      userEmail || 'system',
      'EMAIL_PREFERENCES_UPDATED',
      {
        preferences: updatedSettings.emailPreferences,
      }
    );

    res.json({
      success: true,
      settings: updatedSettings,
    });
  } catch (error) {
    console.error('[Client Settings] Email preferences error:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to update email preferences',
    });
  }
};

/**
 * POST /api/client/settings/generate-unsubscribe-link
 * Generate unsubscribe link for client
 */
export const generateUnsubscribeLink: RequestHandler = async (req, res) => {
  try {
    const clientId = req.headers['x-client-id'] as string;
    const brandId = req.headers['x-brand-id'] as string;

    const key = `${clientId}:${brandId}`;
    let settings = clientSettingsStore.get(key);

    if (!settings) {
      settings = {
        id: `settings_${Date.now()}`,
        clientId,
        brandId,
        ...DEFAULT_CLIENT_SETTINGS,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }

    // Generate secure unsubscribe token
    const unsubscribeToken = crypto.randomBytes(32).toString('hex');
    const updatedSettings = {
      ...settings,
      unsubscribeToken,
      updatedAt: new Date().toISOString(),
    };

    clientSettingsStore.set(key, updatedSettings);

    // In production, this would be a full URL with client domain
    const unsubscribeUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/unsubscribe?token=${unsubscribeToken}`;

    res.json({
      success: true,
      unsubscribeUrl,
      token: unsubscribeToken,
    });
  } catch (error) {
    console.error('[Client Settings] Generate unsubscribe error:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to generate unsubscribe link',
    });
  }
};

/**
 * POST /api/client/unsubscribe
 * Process unsubscribe request (can be called without authentication for email links)
 */
export const unsubscribeFromEmails: RequestHandler = async (req, res) => {
  try {
    const { unsubscribeToken, fromType } = req.body as UnsubscribeRequest;

    if (!unsubscribeToken) {
      return res.status(400).json({
        error: 'Unsubscribe token is required',
      });
    }

    // Find settings by token
    let found = false;
    let updatedSettings: ClientSettings | null = null;

    for (const [key, settings] of clientSettingsStore.entries()) {
      if (settings.unsubscribeToken === unsubscribeToken) {
        found = true;

        if (fromType) {
          // Unsubscribe from specific notification type
          const unsubscribedTypes = new Set(settings.unsubscribedTypes || []);
          unsubscribedTypes.add(fromType);

          updatedSettings = {
            ...settings,
            unsubscribedTypes: Array.from(unsubscribedTypes) as EmailNotificationType[],
            updatedAt: new Date().toISOString(),
          };
        } else {
          // Unsubscribe from all
          updatedSettings = {
            ...settings,
            unsubscribedFromAll: true,
            unsubscribedTypes: [
              'approvals_needed',
              'approval_reminders',
              'publish_failures',
              'publish_success',
              'weekly_digest',
              'daily_digest',
            ] as EmailNotificationType[],
            updatedAt: new Date().toISOString(),
          };
        }

        clientSettingsStore.set(key, updatedSettings);
        break;
      }
    }

    if (!found) {
      return res.status(404).json({
        error: 'Invalid or expired unsubscribe token',
      });
    }

    res.json({
      success: true,
      message: fromType
        ? `Unsubscribed from ${fromType}`
        : 'Unsubscribed from all email notifications',
      unsubscribedFromAll: updatedSettings?.unsubscribedFromAll,
      unsubscribedTypes: updatedSettings?.unsubscribedTypes,
    });
  } catch (error) {
    console.error('[Client Settings] Unsubscribe error:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to process unsubscribe',
    });
  }
};

/**
 * POST /api/client/settings/resubscribe
 * Resubscribe to email notifications
 */
export const resubscribeToEmails: RequestHandler = async (req, res) => {
  try {
    const clientId = req.headers['x-client-id'] as string;
    const brandId = req.headers['x-brand-id'] as string;
    const { notificationType } = req.body;

    const key = `${clientId}:${brandId}`;
    let settings = clientSettingsStore.get(key);

    if (!settings) {
      return res.status(404).json({
        error: 'Client settings not found',
      });
    }

    const unsubscribedTypes = new Set(settings.unsubscribedTypes || []);
    if (notificationType) {
      unsubscribedTypes.delete(notificationType);
    } else {
      // Resubscribe to all
      unsubscribedTypes.clear();
    }

    const updatedSettings = {
      ...settings,
      unsubscribedFromAll: unsubscribedTypes.size === 0 ? false : settings.unsubscribedFromAll,
      unsubscribedTypes: Array.from(unsubscribedTypes) as EmailNotificationType[],
      updatedAt: new Date().toISOString(),
    };

    clientSettingsStore.set(key, updatedSettings);

    res.json({
      success: true,
      message: notificationType ? `Resubscribed to ${notificationType}` : 'Resubscribed to all notifications',
      settings: updatedSettings,
    });
  } catch (error) {
    console.error('[Client Settings] Resubscribe error:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to resubscribe',
    });
  }
};

/**
 * GET /api/client/settings/verify-unsubscribe
 * Verify if unsubscribe token is valid
 */
export const verifyUnsubscribeToken: RequestHandler = async (req, res) => {
  try {
    const { token } = req.query as { token: string };

    if (!token) {
      return res.status(400).json({
        error: 'Token is required',
      });
    }

    // Find settings by token
    for (const settings of clientSettingsStore.values()) {
      if (settings.unsubscribeToken === token) {
        return res.json({
          valid: true,
          clientId: settings.clientId,
          unsubscribedTypes: settings.unsubscribedTypes,
          unsubscribedFromAll: settings.unsubscribedFromAll,
        });
      }
    }

    res.json({
      valid: false,
    });
  } catch (error) {
    console.error('[Client Settings] Verify token error:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to verify token',
    });
  }
};
