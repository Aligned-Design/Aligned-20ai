import { RequestHandler } from 'express';
import { ClientDashboardData, ContentComment } from '@shared/client-portal';

// Mock data for client dashboard
const mockDashboardData: ClientDashboardData = {
  brandInfo: {
    name: 'Nike',
    logo: '👟',
    colors: {
      primary: '#000000',
      secondary: '#FF6B35'
    }
  },
  metrics: {
    totalReach: 1247293,
    totalEngagement: 89472,
    followers: 52847,
    postsThisMonth: 24,
    engagementRate: 7.2,
    pendingApprovals: 3,
    campaignProgress: 65,
    growth: {
      reach: 12.4,
      engagement: 18.7,
      followers: 5.3
    }
  },
  recentContent: [
    {
      id: 'content_1',
      platform: 'instagram',
      content: 'New Air Max collection drops tomorrow! Get ready to step into the future of comfort and style. 👟✨',
      status: 'published',
      publishedAt: '2024-01-15T09:00:00Z',
      thumbnail: '🏃‍♂️',
      metrics: {
        reach: 45230,
        engagement: 3420,
        likes: 2890,
        comments: 430,
        shares: 156
      },
      complianceBadges: [],
      version: 1,
      comments: [
        {
          id: 'comment_1',
          contentId: 'content_1',
          userId: 'user_1',
          userName: 'Sarah Johnson',
          userRole: 'client',
          message: 'Love the energy in this post!',
          isInternal: false,
          createdAt: '2024-01-15T10:00:00Z'
        }
      ],
      approvalRequired: false
    }
  ],
  upcomingPosts: [
    {
      id: 'content_2',
      platform: 'twitter',
      content: 'Athletes don\'t just wear Nike. They embody the spirit of pushing limits. What\'s your limit today? #JustDoIt',
      status: 'scheduled',
      scheduledFor: '2024-01-16T14:00:00Z',
      comments: [],
      approvalRequired: false,
      complianceBadges: [],
      version: 1
    }
  ],
  pendingApprovals: [
    {
      id: 'content_3',
      platform: 'linkedin',
      content: 'Behind every great athlete is years of dedication, training, and the right gear. Here\'s how Nike supports champions at every level.',
      status: 'in_review',
      comments: [
        {
          id: 'comment_2',
          contentId: 'content_3',
          userId: 'agency_1',
          userName: 'Marketing Team',
          userRole: 'agency',
          message: 'Ready for your review - what do you think?',
          isInternal: false,
          createdAt: '2024-01-15T16:00:00Z'
        }
      ],
      approvalRequired: true,
      complianceBadges: [],
      version: 1
    }
  ],
  recentComments: [
    {
      id: 'comment_1',
      contentId: 'content_1',
      userId: 'user_1',
      userName: 'Sarah Johnson',
      userRole: 'client',
      message: 'Love the energy in this post!',
      isInternal: false,
      createdAt: '2024-01-15T10:00:00Z'
    }
  ],
  agencyInfo: {
    name: 'Nike Marketing Agency',
    logo: '🎯',
    contactEmail: 'contact@nikeagency.com',
    supportUrl: 'https://support.nikeagency.com'
  },
  aiInsight: {
    title: 'Peak Engagement Opportunity',
    description: 'Your audience is most active on Instagram between 6-8 PM EST. Consider scheduling high-engagement content during these hours.',
    impact: 'actionable'
  },
  topPerformingContent: [
    {
      id: 'content_1',
      platform: 'instagram',
      content: 'New Air Max collection drops tomorrow!',
      status: 'published',
      publishedAt: '2024-01-15T09:00:00Z',
      thumbnail: '🏃‍♂️',
      metrics: {
        reach: 45230,
        engagement: 3420,
        likes: 2890,
        comments: 430,
        shares: 156
      },
      comments: [],
      approvalRequired: false,
      complianceBadges: [],
      version: 1
    }
  ],
  quickActions: {
    approvalsNeeded: 3,
    reviewsAvailable: 2,
    eventsUpcoming: 1
  }
};

export const getClientDashboard: RequestHandler = async (req, res) => {
  try {
    // TODO: Get client info from authentication middleware
    // TODO: Filter data based on client's brand and permissions
    
    res.json(mockDashboardData);
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to load dashboard'
    });
  }
};

export const approveContent: RequestHandler = async (req, res) => {
  try {
    const { contentId } = req.params;
    const { approved } = req.body;

    // TODO: Update content approval status in database
    // TODO: Send notification to agency team
    // TODO: Log approval action for audit trail

    res.json({ 
      success: true, 
      contentId, 
      approved,
      message: approved ? 'Content approved successfully' : 'Feedback requested'
    });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to process approval'
    });
  }
};

export const addContentComment: RequestHandler = async (req, res) => {
  try {
    const { contentId } = req.params;
    const { message } = req.body;

    if (!message?.trim()) {
      return res.status(400).json({ error: 'Comment message is required' });
    }

    // TODO: Get user info from authentication
    const comment: ContentComment = {
      id: `comment_${Date.now()}`,
      contentId,
      userId: 'client_user_123', // TODO: Get from auth
      userName: 'Client User', // TODO: Get from auth
      userRole: 'client',
      message: message.trim(),
      isInternal: false,
      createdAt: new Date().toISOString()
    };

    // TODO: Save comment to database
    // TODO: Send notification to agency team

    res.json({ success: true, comment });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to add comment'
    });
  }
};

export const uploadClientMedia: RequestHandler = async (req, res) => {
  try {
    // TODO: Handle file uploads from client
    // TODO: Store files with proper client branding/organization
    // TODO: Apply client-specific file size/type restrictions
    
    res.json({ 
      success: true, 
      message: 'Files uploaded successfully',
      uploads: [] // TODO: Return uploaded file info
    });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to upload media'
    });
  }
};
