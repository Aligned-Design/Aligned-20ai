import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { 
  TrendingUp, 
  TrendingDown,
  Eye, 
  Heart, 
  MousePointer,
  Share2,
  Download,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  BarChart3,
  Users,
  Calendar,
  ExternalLink,
  RefreshCw,
  Plus,
  Settings,
  Mail,
  Clock
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { cn } from '@/lib/utils';
import { AnalyticsPortalData, CustomReport } from '@shared/analytics-portal';

interface AnalyticsPortalProps {
  brandId: string;
  isSharedView?: boolean;
}

export default function AnalyticsPortal({ brandId, isSharedView = false }: AnalyticsPortalProps) {
  const [data, setData] = useState<AnalyticsPortalData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackType, setFeedbackType] = useState<'general' | 'revision'>('general');
  const [showReportBuilder, setShowReportBuilder] = useState(false);
  const [customReports, setCustomReports] = useState<CustomReport[]>([]);

  useEffect(() => {
    loadAnalyticsData();
    loadCustomReports();
  }, [brandId, selectedPeriod]);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/analytics-portal/${brandId}?period=${selectedPeriod}`);
      if (response.ok) {
        const analyticsData = await response.json();
        setData(analyticsData);
      }
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCustomReports = async () => {
    try {
      const response = await fetch(`/api/analytics-portal/${brandId}/reports`);
      if (response.ok) {
        const reports = await response.json();
        setCustomReports(reports);
      }
    } catch (error) {
      console.error('Failed to load custom reports:', error);
    }
  };

  const handleFeedbackSubmit = async (contentId?: string) => {
    if (!feedbackText.trim()) return;

    try {
      await fetch('/api/analytics-portal/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contentId,
          type: feedbackType,
          message: feedbackText,
          priority: 'medium'
        })
      });
      
      setFeedbackText('');
      // Show success message
    } catch (error) {
      console.error('Failed to submit feedback:', error);
    }
  };

  const handleCreateShareLink = async () => {
    try {
      const response = await fetch('/api/analytics-portal/share-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brandId,
          name: `${data?.brandInfo.name} Analytics - ${new Date().toLocaleDateString()}`,
          includeMetrics: ['reach', 'engagement', 'conversions'],
          dateRange: data?.timeRange,
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          passwordProtected: false
        })
      });

      if (response.ok) {
        const result = await response.json();
        navigator.clipboard.writeText(result.url);
        // Show success message
      }
    } catch (error) {
      console.error('Failed to create share link:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return <div>Failed to load analytics data</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {data?.brandInfo.logo && (
                <div className="text-4xl">{data.brandInfo.logo}</div>
              )}
              <div>
                <h1 className="text-3xl font-bold" style={{ color: data?.brandInfo.colors.primary }}>
                  {data?.brandInfo.name} Analytics
                </h1>
                <p className="text-gray-600">
                  Performance insights for {data?.timeRange.period}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">Week</SelectItem>
                  <SelectItem value="month">Month</SelectItem>
                  <SelectItem value="quarter">Quarter</SelectItem>
                  <SelectItem value="year">Year</SelectItem>
                </SelectContent>
              </Select>
              
              {!isSharedView && (
                <>
                  <Button variant="outline" onClick={() => setShowReportBuilder(true)}>
                    <Settings className="h-4 w-4 mr-2" />
                    Custom Reports
                  </Button>
                  <Button variant="outline" onClick={handleCreateShareLink}>
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                  <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </>
              )}
              
              <Button variant="outline" onClick={loadAnalyticsData}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">📊 Overview</TabsTrigger>
            <TabsTrigger value="content">📝 Content Performance</TabsTrigger>
            <TabsTrigger value="audience">👥 Audience</TabsTrigger>
            <TabsTrigger value="feedback">💬 Feedback</TabsTrigger>
            {!isSharedView && (
              <TabsTrigger value="reports">📧 Custom Reports</TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Key Metrics */}
            {data && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard
                  title="Total Reach"
                  current={data.metrics.reach.current}
                  previous={data.metrics.reach.previous}
                  change={data.metrics.reach.change}
                  icon={<Eye className="h-6 w-6" />}
                  color="blue"
                />
                <MetricCard
                  title="Engagement"
                  current={data.metrics.engagement.current}
                  previous={data.metrics.engagement.previous}
                  change={data.metrics.engagement.change}
                  icon={<Heart className="h-6 w-6" />}
                  color="red"
                />
                <MetricCard
                  title="Conversions"
                  current={data.metrics.conversions.current}
                  previous={data.metrics.conversions.previous}
                  change={data.metrics.conversions.change}
                  icon={<MousePointer className="h-6 w-6" />}
                  color="green"
                />
                <MetricCard
                  title="Engagement Rate"
                  current={data.metrics.engagementRate.current}
                  previous={data.metrics.engagementRate.previous}
                  change={data.metrics.engagementRate.change}
                  icon={<BarChart3 className="h-6 w-6" />}
                  color="purple"
                  isPercentage
                />
              </div>
            )}

            {/* Charts */}
            {data && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Reach Over Time</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={data.charts.reachOverTime}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Engagement by Platform</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={data.charts.engagementByPlatform}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="platform" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="value" fill="#10b981" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Top Content */}
            <Card>
              <CardHeader>
                <CardTitle>Top Performing Content</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.charts.topContent.map((content, index) => (
                    <div key={content.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <h4 className="font-medium">{content.title}</h4>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span>{formatNumber(content.reach)} reach</span>
                            <span>{formatNumber(content.engagement)} engagement</span>
                          </div>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="content" className="space-y-6">
            <ContentPerformanceView data={data} onFeedback={handleFeedbackSubmit} />
          </TabsContent>

          <TabsContent value="audience" className="space-y-6">
            <AudienceGrowthView data={data} />
          </TabsContent>

          <TabsContent value="feedback" className="space-y-6">
            <FeedbackPanel
              onSubmit={handleFeedbackSubmit}
              feedbackText={feedbackText}
              setFeedbackText={setFeedbackText}
              feedbackType={feedbackType}
              setFeedbackType={setFeedbackType}
            />
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <CustomReportsManager
              brandId={brandId}
              reports={customReports}
              onUpdate={loadCustomReports}
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* Report Builder Modal */}
      {showReportBuilder && (
        <ReportBuilderModal
          brandId={brandId}
          onClose={() => setShowReportBuilder(false)}
          onSave={loadCustomReports}
        />
      )}
    </div>
  );
}

// Component implementations for MetricCard, ContentPerformanceView, etc.
function MetricCard({ title, current, _previous, change, icon, color, isPercentage = false }: {
  title: string;
  current: number;
  previous: number;
  change: number;
  icon: React.ReactNode;
  color: string;
  isPercentage?: boolean;
}) {
  const isPositive = change > 0;
  const displayValue = isPercentage ? `${current}%` : formatNumber(current);

  return (
    <Card className="transition-all hover:shadow-lg">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-full bg-${color}-100 text-${color}-600`}>
            {icon}
          </div>
          <div className="flex items-center gap-1">
            {isPositive ? (
              <TrendingUp className="h-4 w-4 text-green-500" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-500" />
            )}
            <span className={cn(
              "text-sm font-medium",
              isPositive ? "text-green-600" : "text-red-600"
            )}>
              {isPositive ? '+' : ''}{change.toFixed(1)}%
            </span>
          </div>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{displayValue}</p>
          <p className="text-sm text-gray-500 mt-1">vs previous period</p>
        </div>
      </CardContent>
    </Card>
  );
}

function ContentPerformanceView({ data, _onFeedback }: { 
  data: AnalyticsPortalData; 
  onFeedback: (contentId?: string) => void; 
}) {
  return (
    <div className="space-y-4">
      {data.contentPerformance.map((content) => (
        <Card key={content.id}>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-medium">{content.title}</h3>
                  <Badge variant="outline">{content.platform}</Badge>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  Published {new Date(content.publishedAt).toLocaleDateString()}
                </p>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Reach</p>
                    <p className="text-lg font-semibold">{formatNumber(content.metrics.reach)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Engagement</p>
                    <p className="text-lg font-semibold">{formatNumber(content.metrics.engagement)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Clicks</p>
                    <p className="text-lg font-semibold">{formatNumber(content.metrics.clicks)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Saves</p>
                    <p className="text-lg font-semibold">{formatNumber(content.metrics.saves)}</p>
                  </div>
                </div>
              </div>
              
              {content.canProvideFeedback && (
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Feedback
                  </Button>
                  <Button size="sm">
                    <ThumbsUp className="h-4 w-4 mr-2" />
                    Approve
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function AudienceGrowthView({ data }: { data: AnalyticsPortalData }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Audience Growth</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={data.charts.audienceGrowth}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="followers" stroke="#8b5cf6" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

function FeedbackPanel({ 
  onSubmit, 
  feedbackText, 
  setFeedbackText, 
  feedbackType, 
  setFeedbackType 
}: {
  onSubmit: () => void;
  feedbackText: string;
  setFeedbackText: (text: string) => void;
  feedbackType: 'general' | 'revision';
  setFeedbackType: (type: 'general' | 'revision') => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Provide Feedback</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium">Feedback Type</label>
          <Select value={feedbackType} onValueChange={(value: 'general' | 'revision') => setFeedbackType(value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="general">General Feedback</SelectItem>
              <SelectItem value="revision">Request Revision</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <label className="text-sm font-medium">Message</label>
          <Textarea
            value={feedbackText}
            onChange={(e) => setFeedbackText(e.target.value)}
            placeholder="Share your thoughts or request specific changes..."
            className="min-h-32"
          />
        </div>
        
        <Button onClick={onSubmit} disabled={!feedbackText.trim()}>
          Submit Feedback
        </Button>
      </CardContent>
    </Card>
  );
}

function CustomReportsManager({ brandId, reports, onUpdate }: {
  brandId: string;
  reports: CustomReport[];
  onUpdate: () => void;
}) {
  const [showBuilder, setShowBuilder] = useState(false);

  const handleToggleReport = async (reportId: string, isActive: boolean) => {
    try {
      await fetch(`/api/analytics-portal/${brandId}/reports/${reportId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive })
      });
      onUpdate();
    } catch (error) {
      console.error('Failed to toggle report:', error);
    }
  };

  const handleSendNow = async (reportId: string) => {
    try {
      await fetch(`/api/analytics-portal/${brandId}/reports/${reportId}/send`, {
        method: 'POST'
      });
      // Show success message
    } catch (error) {
      console.error('Failed to send report:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Custom Reports</h2>
          <p className="text-gray-600">Automated analytics reports delivered to your inbox</p>
        </div>
        <Button onClick={() => setShowBuilder(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Create Report
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {reports.map((report) => (
          <Card key={report.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{report.name}</CardTitle>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={report.isActive}
                    onCheckedChange={(checked) => handleToggleReport(report.id, checked)}
                  />
                  <Badge variant={report.isActive ? 'default' : 'secondary'}>
                    {report.isActive ? 'Active' : 'Paused'}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-2">{report.description}</p>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span>Every {report.schedule.frequency}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span>{report.delivery.recipients.length} recipient{report.delivery.recipients.length > 1 ? 's' : ''}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {report.content.includeMetrics.map((metric) => (
                  <Badge key={metric} variant="outline" className="text-xs">
                    {metric}
                  </Badge>
                ))}
              </div>

              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => handleSendNow(report.id)}
                  className="gap-1"
                >
                  <Mail className="h-3 w-3" />
                  Send Now
                </Button>
                <Button size="sm" variant="ghost">
                  <Settings className="h-3 w-3 mr-1" />
                  Edit
                </Button>
              </div>

              {report.lastSent && (
                <p className="text-xs text-gray-500">
                  Last sent: {new Date(report.lastSent).toLocaleDateString()}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {showBuilder && (
        <ReportBuilderModal
          brandId={brandId}
          onClose={() => setShowBuilder(false)}
          onSave={onUpdate}
        />
      )}
    </div>
  );
}

interface ReportFormData {
  name: string;
  description: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  dayOfWeek: number;
  time: string;
  recipients: string;
  subject: string;
  includeMetrics: string[];
  includePlatforms: string[];
  format: 'html' | 'pdf' | 'csv';
}

function ReportBuilderModal({ brandId, onClose, onSave, report }: {
  brandId: string;
  onClose: () => void;
  onSave: () => void;
  report?: CustomReport;
}) {
  const [formData, setFormData] = useState<ReportFormData>({
    name: report?.name || '',
    description: report?.description || '',
    frequency: (report?.schedule.frequency as 'daily' | 'weekly' | 'monthly' | 'quarterly') || 'weekly',
    dayOfWeek: report?.schedule.dayOfWeek || 1,
    time: report?.schedule.time || '09:00',
    recipients: report?.delivery.recipients.join(', ') || '',
    subject: report?.delivery.subject || '',
    includeMetrics: report?.content.includeMetrics || ['reach', 'engagement'],
    includePlatforms: report?.content.includePlatforms || ['instagram', 'facebook'],
    format: (report?.delivery.format as 'html' | 'pdf' | 'csv') || 'pdf'
  });

  const handleSave = async () => {
    try {
      const reportData: Partial<CustomReport> = {
        name: formData.name,
        description: formData.description,
        brandId,
        schedule: {
          frequency: formData.frequency,
          dayOfWeek: formData.dayOfWeek,
          time: formData.time,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        },
        content: {
          includeMetrics: formData.includeMetrics,
          includePlatforms: formData.includePlatforms,
          includeCharts: ['reachOverTime', 'engagementByPlatform']
        },
        delivery: {
          format: formData.format,
          recipients: formData.recipients.split(',').map(email => email.trim()),
          subject: formData.subject,
          attachAnalytics: true
        },
        dateRange: {
          type: 'relative',
          relativePeriod: 'last_30_days'
        },
        isActive: true
      };

      const url = report 
        ? `/api/analytics-portal/${brandId}/reports/${report.id}`
        : `/api/analytics-portal/${brandId}/reports`;
      
      const method = report ? 'PUT' : 'POST';

      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reportData)
      });

      onSave();
      onClose();
    } catch (error) {
      console.error('Failed to save report:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle>Create Custom Report</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Report Name</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Monthly Performance Report"
              />
            </div>
            <div>
              <Label>Frequency</Label>
              <Select
                value={formData.frequency}
                onValueChange={(value) => setFormData(prev => ({ ...prev, frequency: value as 'daily' | 'weekly' | 'monthly' | 'quarterly' }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>Description</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe what this report includes..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Send Time</Label>
              <Input
                type="time"
                value={formData.time}
                onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
              />
            </div>
            <div>
              <Label>Format</Label>
              <Select
                value={formData.format}
                onValueChange={(value) => setFormData(prev => ({ ...prev, format: value as 'html' | 'pdf' | 'csv' }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="html">HTML Email</SelectItem>
                  <SelectItem value="csv">CSV Data</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>Email Recipients</Label>
            <Input
              value={formData.recipients}
              onChange={(e) => setFormData(prev => ({ ...prev, recipients: e.target.value }))}
              placeholder="email1@example.com, email2@example.com"
            />
            <p className="text-xs text-gray-500 mt-1">Separate multiple emails with commas</p>
          </div>

          <div>
            <Label>Email Subject</Label>
            <Input
              value={formData.subject}
              onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
              placeholder="Your Monthly Analytics Report"
            />
          </div>

          <div>
            <Label>Include Metrics</Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {['reach', 'engagement', 'conversions', 'followers'].map((metric) => (
                <label key={metric} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.includeMetrics.includes(metric)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFormData(prev => ({ 
                          ...prev, 
                          includeMetrics: [...prev.includeMetrics, metric] 
                        }));
                      } else {
                        setFormData(prev => ({ 
                          ...prev, 
                          includeMetrics: prev.includeMetrics.filter(m => m !== metric) 
                        }));
                      }
                    }}
                  />
                  <span className="text-sm capitalize">{metric}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              {report ? 'Update Report' : 'Create Report'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
}
