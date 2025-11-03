import { RequestHandler } from 'express';
import { WhiteLabelConfig, WhiteLabelRequest, WhiteLabelResponse } from '@shared/branding';

// Mock white-label configs - in production this would be in database
const mockConfigs: Record<string, WhiteLabelConfig> = {
  'agency-123': {
    id: 'wl-123',
    agencyId: 'agency-123',
    isActive: true,
    branding: {
      companyName: 'Creative Agency Pro',
      logoUrl: 'https://example.com/logo.png',
      tagline: 'Elevating Brands Through Social Media',
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
      custom: 'clients.creativeagency.com',
      isPrimary: true
    },
    footer: {
      copyrightText: '© 2024 Creative Agency Pro. All rights reserved.',
      showPoweredBy: false,
      customLinks: [
        { label: 'Support', url: 'mailto:support@creativeagency.com', openInNewTab: false }
      ],
      supportEmail: 'support@creativeagency.com'
    },
    email: {
      fromName: 'Creative Agency Pro',
      fromEmail: 'noreply@creativeagency.com',
      headerColor: '#2563eb',
      footerText: 'Creative Agency Pro - Social Media Management'
    },
    features: {
      hideAlignedAIBranding: true,
      customLoginPage: true,
      customDashboardTitle: 'Client Portal',
      allowClientBranding: true
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
};

export const getWhiteLabelConfig: RequestHandler = async (req, res) => {
  try {
    // TODO: Get agencyId from authentication
    const agencyId = 'agency-123';
    
    const config = mockConfigs[agencyId];
    
    const response: WhiteLabelResponse = {
      success: true,
      config: config || getDefaultConfig(agencyId)
    };

    res.json(response);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch white-label config'
    });
  }
};

export const getConfigByDomain: RequestHandler = async (req, res) => {
  try {
    const { domain } = req.query;
    
    if (!domain) {
      return res.status(400).json({
        success: false,
        error: 'Domain parameter required'
      });
    }

    // Find config by custom domain
    const config = Object.values(mockConfigs).find(
      config => config.domain.custom === domain
    );

    const response: WhiteLabelResponse = {
      success: true,
      config: config || null
    };

    res.json(response);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch config by domain'
    });
  }
};

export const updateWhiteLabelConfig: RequestHandler = async (req, res) => {
  try {
    const { config: updates, previewMode }: WhiteLabelRequest = req.body;
    const agencyId = 'agency-123'; // TODO: Get from auth

    if (!updates) {
      return res.status(400).json({
        success: false,
        error: 'Config updates required'
      });
    }

    let currentConfig = mockConfigs[agencyId] || getDefaultConfig(agencyId);

    // Deep merge updates
    currentConfig = {
      ...currentConfig,
      ...updates,
      branding: { ...currentConfig.branding, ...updates.branding },
      colors: { ...currentConfig.colors, ...updates.colors },
      domain: { ...currentConfig.domain, ...updates.domain },
      footer: { ...currentConfig.footer, ...updates.footer },
      email: { ...currentConfig.email, ...updates.email },
      features: { ...currentConfig.features, ...updates.features },
      updatedAt: new Date().toISOString()
    };

    if (!previewMode) {
      // TODO: Save to database
      mockConfigs[agencyId] = currentConfig;
    }

    const response: WhiteLabelResponse = {
      success: true,
      config: currentConfig,
      previewUrl: previewMode ? `https://preview.alignedai.com/${agencyId}` : undefined
    };

    res.json(response);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update white-label config'
    });
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
