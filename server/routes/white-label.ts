import { RequestHandler } from 'express';
import { WhiteLabelConfig, WhiteLabelRequest, WhiteLabelResponse } from '@shared/branding';
import { whiteLabelDB } from '../lib/white-label-db-service';
import { AppError } from '../lib/error-middleware';
import { ErrorCode, HTTP_STATUS } from '../lib/error-responses';

// Helper function to map database record to API response
function mapWhiteLabelRecord(record: any): WhiteLabelConfig {
  return {
    id: record.id,
    agencyId: record.agency_id,
    isActive: record.is_active,
    branding: record.metadata?.branding || {},
    colors: record.metadata?.colors || {},
    domain: {
      custom: record.domain || '',
      isPrimary: true
    },
    footer: record.metadata?.footer || {},
    email: record.metadata?.email || {},
    features: record.metadata?.features || {},
    createdAt: record.created_at,
    updatedAt: record.updated_at
  };
}

export const getWhiteLabelConfig: RequestHandler = async (req, res, next) => {
  try {
    // Get agencyId from path parameter or authentication context
    const agencyId = (req.params.agencyId || (req as any).agencyId || (req as any).user?.agencyId);

    if (!agencyId) {
      throw new AppError(
        ErrorCode.MISSING_REQUIRED_FIELD,
        "agencyId is required",
        HTTP_STATUS.BAD_REQUEST,
        "warning"
      );
    }

    // Fetch config from database
    const configRecord = await whiteLabelDB.getWhiteLabelConfig(agencyId);

    const response: WhiteLabelResponse = {
      success: true,
      config: configRecord ? mapWhiteLabelRecord(configRecord) : getDefaultConfig(agencyId)
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

export const getConfigByDomain: RequestHandler = async (req, res, next) => {
  try {
    const { domain } = req.query;

    if (!domain) {
      throw new AppError(
        ErrorCode.MISSING_REQUIRED_FIELD,
        "domain parameter is required",
        HTTP_STATUS.BAD_REQUEST,
        "warning"
      );
    }

    // Find config by custom domain in database
    const configRecord = await whiteLabelDB.getConfigByDomain(domain as string);

    const response: WhiteLabelResponse = {
      success: true,
      config: configRecord ? mapWhiteLabelRecord(configRecord) : undefined
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

export const updateWhiteLabelConfig: RequestHandler = async (req, res, next) => {
  try {
    const { config: updates, previewMode }: WhiteLabelRequest = req.body;
    // Get agencyId from path parameter or authentication context
    const agencyId = (req.params.agencyId || (req as any).agencyId || (req as any).user?.agencyId);

    if (!agencyId) {
      throw new AppError(
        ErrorCode.MISSING_REQUIRED_FIELD,
        "agencyId is required",
        HTTP_STATUS.BAD_REQUEST,
        "warning"
      );
    }

    if (!updates) {
      throw new AppError(
        ErrorCode.MISSING_REQUIRED_FIELD,
        "config updates are required",
        HTTP_STATUS.BAD_REQUEST,
        "warning"
      );
    }

    if (previewMode) {
      // Return preview without saving to database
      const previewConfig = getDefaultConfig(agencyId);
      const response: WhiteLabelResponse = {
        success: true,
        config: previewConfig,
        previewUrl: `https://preview.alignedai.com/${agencyId}`
      };
      res.json(response);
      return;
    }

    // Update and save to database
    const updatedRecord = await whiteLabelDB.updateWhiteLabelConfig(agencyId, updates as any);
    const config = mapWhiteLabelRecord(updatedRecord);

    const response: WhiteLabelResponse = {
      success: true,
      config
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

function getDefaultConfig(agencyId: string): WhiteLabelConfig {
  return {
    id: `wl-${agencyId}`,
    agencyId,
    isActive: false,
    branding: {
      companyName: 'Your Agency',
      logoText: 'Your Agency',
      tagline: 'Professional Social Media Management'
    },
    colors: {
      primary: '#2563eb',
      secondary: '#64748b',
      accent: '#3b82f6',
      background: '#ffffff',
      surface: '#f8fafc',
      text: {
        primary: '#0f172a',
        secondary: '#475569',
        muted: '#94a3b8'
      },
      border: '#e2e8f0',
      success: '#059669',
      warning: '#d97706',
      error: '#dc2626'
    },
    domain: {
      custom: '',
      isPrimary: false
    },
    footer: {
      copyrightText: '© 2024 Your Agency. All rights reserved.',
      showPoweredBy: true,
      customLinks: []
    },
    email: {
      fromName: 'Your Agency',
      fromEmail: 'noreply@youragency.com',
      headerColor: '#2563eb',
      footerText: 'Your Agency - Social Media Management'
    },
    features: {
      hideAlignedAIBranding: false,
      customLoginPage: false,
      customDashboardTitle: 'Dashboard',
      allowClientBranding: true
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}
