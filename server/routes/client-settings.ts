/**
 * Client Settings API routes
 * Manages email preferences, notification settings, and account preferences
 * Now uses Supabase database for persistence
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
import { clientSettings as dbClientSettings, DatabaseError } from '../lib/dbClient';
import crypto from 'crypto';

/**
 * Helper function to convert database record to API response format
 */
function dbRecordToClientSettings(record: any): ClientSettings {
  return {
    id: record.id,
    clientId: record.client_id,
    brandId: record.brand_id,
    emailPreferences: record.email_preferences || DEFAULT_CLIENT_SETTINGS.emailPreferences,
    timezone: record.timezone,
    language: record.language,
    unsubscribeToken: record.unsubscribe_token,
    unsubscribedFromAll: record.unsubscribed_from_all,
    unsubscribedTypes: record.unsubscribed_types || [],
    createdAt: record.created_at,
    updatedAt: record.updated_at,
    lastModifiedBy: record.last_modified_by,
  };
}

/**
 * Helper function to convert API input to database format
 */
function clientSettingsToDbRecord(settings: Partial<ClientSettings>): any {
  return {
    client_id: settings.clientId,
    brand_id: settings.brandId,
    email_preferences: settings.emailPreferences,
    timezone: settings.timezone,
    language: settings.language,
    unsubscribe_token: settings.unsubscribeToken,
    unsubscribed_from_all: settings.unsubscribedFromAll,
    unsubscribed_types: settings.unsubscribedTypes,
    last_modified_by: settings.lastModifiedBy,
  };
}

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

    let settings = await dbClientSettings.get(clientId, brandId);

    if (!settings) {
      // Create default settings if not found
      const defaultSettings = {
        client_id: clientId,
        brand_id: brandId,
        email_preferences: DEFAULT_CLIENT_SETTINGS.emailPreferences,
        timezone: DEFAULT_CLIENT_SETTINGS.timezone,
        language: DEFAULT_CLIENT_SETTINGS.language,
        unsubscribed_from_all: false,
        unsubscribed_types: [],
      };
      settings = await dbClientSettings.create(defaultSettings);
    }

    const apiSettings = dbRecordToClientSettings(settings);

    res.json({
      success: true,
      settings: apiSettings,
    });
  } catch (error) {
    console.error('[Client Settings] Get error:', error);
    const statusCode = error instanceof DatabaseError ? 500 : 500;
    res.status(statusCode).json({
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

    // Get current settings or create defaults
    let currentSettings = await dbClientSettings.get(clientId, brandId);
    if (!currentSettings) {
      currentSettings = await dbClientSettings.create({
        client_id: clientId,
        brand_id: brandId,
        email_preferences: DEFAULT_CLIENT_SETTINGS.emailPreferences,
        timezone: DEFAULT_CLIENT_SETTINGS.timezone,
        language: DEFAULT_CLIENT_SETTINGS.language,
        unsubscribed_from_all: false,
        unsubscribed_types: [],
      });
    }

    // Merge updates
    const updates = validationResult.data;
    const mergedUpdates = {
      timezone: updates.timezone,
      language: updates.language,
      email_preferences: {
        ...currentSettings.email_preferences,
        ...(updates.emailPreferences || {}),
      },
      unsubscribed_types: updates.unsubscribedTypes || currentSettings.unsubscribed_types,
      last_modified_by: userEmail,
    };

    // Update in database
    const updatedSettings = await dbClientSettings.update(clientId, brandId, mergedUpdates);
    const apiSettings = dbRecordToClientSettings(updatedSettings);

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
      settings: apiSettings,
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

    // Get current settings or create defaults
    let currentSettings = await dbClientSettings.get(clientId, brandId);
    if (!currentSettings) {
      currentSettings = await dbClientSettings.create({
        client_id: clientId,
        brand_id: brandId,
        email_preferences: DEFAULT_CLIENT_SETTINGS.emailPreferences,
        timezone: DEFAULT_CLIENT_SETTINGS.timezone,
        language: DEFAULT_CLIENT_SETTINGS.language,
        unsubscribed_from_all: false,
        unsubscribed_types: [],
      });
    }

    // Merge email preferences
    const updatedPreferences = {
      ...currentSettings.email_preferences,
      ...req.body,
    };

    // Update in database
    const updatedSettings = await dbClientSettings.update(clientId, brandId, {
      email_preferences: updatedPreferences,
      last_modified_by: userEmail,
    });
    const apiSettings = dbRecordToClientSettings(updatedSettings);

    // Log the change
    await logAuditAction(
      brandId,
      'settings',
      userId || 'system',
      userEmail || 'system',
      'EMAIL_PREFERENCES_UPDATED',
      {
        preferences: updatedPreferences,
      }
    );

    res.json({
      success: true,
      settings: apiSettings,
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

    // Get current settings or create defaults
    let currentSettings = await dbClientSettings.get(clientId, brandId);
    if (!currentSettings) {
      currentSettings = await dbClientSettings.create({
        client_id: clientId,
        brand_id: brandId,
        email_preferences: DEFAULT_CLIENT_SETTINGS.emailPreferences,
        timezone: DEFAULT_CLIENT_SETTINGS.timezone,
        language: DEFAULT_CLIENT_SETTINGS.language,
        unsubscribed_from_all: false,
        unsubscribed_types: [],
      });
    }

    // Generate secure unsubscribe token
    const unsubscribeToken = crypto.randomBytes(32).toString('hex');

    // Update in database
    const __updatedSettings = await dbClientSettings.update(clientId, brandId, {
      unsubscribe_token: unsubscribeToken,
    });

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
    const settings = await dbClientSettings.findByUnsubscribeToken(unsubscribeToken);

    if (!settings) {
      return res.status(404).json({
        error: 'Invalid or expired unsubscribe token',
      });
    }

    let updatePayload: unknown;

    if (fromType) {
      // Unsubscribe from specific notification type
      const unsubscribedTypes = new Set(settings.unsubscribed_types || []);
      unsubscribedTypes.add(fromType);

      updatePayload = {
        unsubscribedTypes: Array.from(unsubscribedTypes) as EmailNotificationType[],
      };
    } else {
      // Unsubscribe from all
      updatePayload = {
        unsubscribedFromAll: true,
        unsubscribedTypes: [
          'approvals_needed',
          'approval_reminders',
          'publish_failures',
          'publish_success',
          'weekly_digest',
          'daily_digest',
        ] as EmailNotificationType[],
      };
    }

    // Update in database
    const updatedSettings = await dbClientSettings.update(
      settings.client_id,
      settings.brand_id,
      updatePayload
    );
    const apiSettings = dbRecordToClientSettings(updatedSettings);

    res.json({
      success: true,
      message: fromType
        ? `Unsubscribed from ${fromType}`
        : 'Unsubscribed from all email notifications',
      unsubscribedFromAll: apiSettings.unsubscribedFromAll,
      unsubscribedTypes: apiSettings.unsubscribedTypes,
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

    // Get current settings
    const settings = await dbClientSettings.get(clientId, brandId);

    if (!settings) {
      return res.status(404).json({
        error: 'Client settings not found',
      });
    }

    const unsubscribedTypes = new Set(settings.unsubscribed_types || []);
    if (notificationType) {
      unsubscribedTypes.delete(notificationType);
    } else {
      // Resubscribe to all
      unsubscribedTypes.clear();
    }

    // Update in database
    const updatedSettings = await dbClientSettings.update(clientId, brandId, {
      unsubscribed_from_all: unsubscribedTypes.size === 0 ? false : settings.unsubscribed_from_all,
      unsubscribed_types: Array.from(unsubscribedTypes) as EmailNotificationType[],
    });
    const apiSettings = dbRecordToClientSettings(updatedSettings);

    res.json({
      success: true,
      message: notificationType ? `Resubscribed to ${notificationType}` : 'Resubscribed to all notifications',
      settings: apiSettings,
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
    const settings = await dbClientSettings.findByUnsubscribeToken(token);

    if (settings) {
      return res.json({
        valid: true,
        clientId: settings.client_id,
        unsubscribedTypes: settings.unsubscribed_types,
        unsubscribedFromAll: settings.unsubscribed_from_all,
      });
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
