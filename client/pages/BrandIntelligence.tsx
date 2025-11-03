import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Brain, 
  Target, 
  TrendingUp, 
  Users, 
  Clock, 
  Lightbulb,
  BarChart3,
  Eye,
  Heart,
  Share2,
  ThumbsUp,
  ThumbsDown,
  RefreshCw,
  Zap,
  Award,
  AlertTriangle
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { cn } from '@/lib/utils';
import { BrandIntelligence, StrategicRecommendation, ContentSuggestion } from '@shared/brand-intelligence';

export default function BrandIntelligencePage() {
  const [intelligence, setIntelligence] = useState<BrandIntelligence | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadBrandIntelligence();
  }, []);

  const loadBrandIntelligence = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/brand-intelligence/brand_1');
      if (response.ok) {
        const data = await response.json();
        setIntelligence(data);
      }
    } catch (error) {
      console.error('Failed to load brand intelligence:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRecommendationFeedback = async (recommendationId: string, action: 'accepted' | 'rejected') => {
    try {
      await fetch('/api/brand-intelligence/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recommendationId, action })
      });
      // Refresh intelligence data
      await loadBrandIntelligence();
    } catch (error) {
      console.error('Failed to submit feedback:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!intelligence) {
    return <div>Failed to load brand intelligence</div>;
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Brain className="h-8 w-8 text-blue-600" />
            Brand Intelligence
          </h1>
          <p className="text-gray-600">AI-powered insights to optimize your brand strategy</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="bg-green-100 text-green-800">
            Confidence: {Math.round(intelligence.confidenceScore * 100)}%
          </Badge>
          <Button onClick={loadBrandIntelligence} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Key Insights Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <InsightCard
          title="Brand Differentiation"
          value={`${intelligence.brandProfile.differentiators.length} key factors`}
          icon={<Target className="h-6 w-6" />}
          color="blue"
        />
        <InsightCard
          title="Competitor Advantage"
          value={`${intelligence.competitorInsights.gapAnalysis.opportunityAreas.length} opportunities`}
          icon={<TrendingUp className="h-6 w-6" />}
          color="green"
        />
        <InsightCard
          title="Audience Insights"
          value={`${intelligence.audienceInsights.contentPreferences.topPerformingTypes.length} content types`}
          icon={<Users className="h-6 w-6" />}
          color="purple"
        />
        <InsightCard
          title="Recommendations"
          value={`${intelligence.recommendations.strategic.length + intelligence.recommendations.tactical.length} active`}
          icon={<Lightbulb className="h-6 w-6" />}
          color="orange"
        />
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">🎯 Overview</TabsTrigger>
          <TabsTrigger value="competitors">📊 Competitors</TabsTrigger>
          <TabsTrigger value="audience">👥 Audience</TabsTrigger>
          <TabsTrigger value="content">📝 Content</TabsTrigger>
          <TabsTrigger value="recommendations">💡 Recommendations</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <BrandOverview intelligence={intelligence} />
        </TabsContent>

        <TabsContent value="competitors" className="space-y-6">
          <CompetitorAnalysis intelligence={intelligence} />
        </TabsContent>

        <TabsContent value="audience" className="space-y-6">
          <AudienceInsights intelligence={intelligence} />
        </TabsContent>

        <TabsContent value="content" className="space-y-6">
          <ContentIntelligence intelligence={intelligence} />
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-6">
          <RecommendationsPanel 
            intelligence={intelligence}
            onFeedback={handleRecommendationFeedback}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function InsightCard({ title, value, icon, color }: {
  title: string;
  value: string;
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'purple' | 'orange';
}) {
  const colorClasses = {
    blue: 'text-blue-600 bg-blue-100',
    green: 'text-green-600 bg-green-100',
    purple: 'text-purple-600 bg-purple-100',
    orange: 'text-orange-600 bg-orange-100'
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={cn("p-3 rounded-full", colorClasses[color])}>
            {icon}
          </div>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function BrandOverview({ intelligence }: { intelligence: BrandIntelligence }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Unique Selling Propositions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {intelligence.brandProfile.usp.map((usp, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                <Award className="h-5 w-5 text-blue-600 mt-0.5" />
                <span className="text-blue-900">{usp}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Key Differentiators
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {intelligence.brandProfile.differentiators.map((diff, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                <TrendingUp className="h-5 w-5 text-green-600 mt-0.5" />
                <span className="text-green-900">{diff}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Brand Personality & Voice</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-3">Personality Traits</h4>
              <div className="flex flex-wrap gap-2">
                {intelligence.brandProfile.brandPersonality.traits.map((trait, index) => (
                  <Badge key={index} variant="outline" className="capitalize">
                    {trait}
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-3">Communication Style</h4>
              <p className="text-sm text-gray-700">
                <strong>Tone:</strong> {intelligence.brandProfile.brandPersonality.tone}
              </p>
              <p className="text-sm text-gray-700 mt-1">
                <strong>Style:</strong> {intelligence.brandProfile.brandPersonality.communicationStyle}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function CompetitorAnalysis({ intelligence }: { intelligence: BrandIntelligence }) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Competitive Landscape</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {intelligence.competitorInsights.primaryCompetitors.map((competitor) => (
              <div key={competitor.id} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold">{competitor.name}</h4>
                  <Badge variant="outline">{competitor.platform}</Badge>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Followers:</span>
                    <span className="font-medium">{formatNumber(competitor.followers)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Avg Engagement:</span>
                    <span className="font-medium">{competitor.avgEngagement}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Posting Frequency:</span>
                    <span className="font-medium">{competitor.postingFrequency}/week</span>
                  </div>
                </div>
                <div className="mt-3">
                  <p className="text-xs text-gray-600 mb-2">Content Themes:</p>
                  <div className="flex flex-wrap gap-1">
                    {competitor.contentThemes.map((theme, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {theme}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Opportunity Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="font-medium mb-3 text-red-700">Content Gaps</h4>
              <ul className="space-y-2">
                {intelligence.competitorInsights.gapAnalysis.contentGaps.map((gap, index) => (
                  <li key={index} className="text-sm flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                    {gap}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-3 text-green-700">Opportunities</h4>
              <ul className="space-y-2">
                {intelligence.competitorInsights.gapAnalysis.opportunityAreas.map((opp, index) => (
                  <li key={index} className="text-sm flex items-start gap-2">
                    <TrendingUp className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    {opp}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-3 text-blue-700">Differentiation</h4>
              <ul className="space-y-2">
                {intelligence.competitorInsights.gapAnalysis.differentiationOpportunities.map((diff, index) => (
                  <li key={index} className="text-sm flex items-start gap-2">
                    <Zap className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                    {diff}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function AudienceInsights({ intelligence }: { intelligence: BrandIntelligence }) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Optimal Posting Times</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.entries(intelligence.audienceInsights.activityPatterns).map(([platform, data]) => (
              <div key={platform} className="space-y-3">
                <h4 className="font-medium capitalize">{platform}</h4>
                <div className="space-y-2">
                  <div>
                    <p className="text-sm text-gray-600">Peak Hours</p>
                    <div className="flex gap-2">
                      {data.peakHours.map((hour, index) => (
                        <Badge key={index} variant="outline">{hour}</Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Best Days</p>
                    <div className="flex gap-2">
                      {data.peakDays.map((day, index) => (
                        <Badge key={index} variant="outline">{day}</Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Content Preferences</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-3">Top Performing Content Types</h4>
              <div className="space-y-2">
                {intelligence.audienceInsights.contentPreferences.topPerformingTypes.map((type, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-sm">{type}</span>
                    <Badge variant="secondary">#{index + 1}</Badge>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-3">Engagement Triggers</h4>
              <div className="space-y-2">
                {intelligence.audienceInsights.contentPreferences.engagementTriggers.map((trigger, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-blue-50 rounded">
                    <Heart className="h-4 w-4 text-blue-600" />
                    <span className="text-sm">{trigger}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ContentIntelligence({ intelligence }: { intelligence: BrandIntelligence }) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Time vs Engagement Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={intelligence.contentIntelligence.performanceCorrelations.timeVsEngagement}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="avgEngagement" stroke="#3b82f6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Content Type Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={intelligence.contentIntelligence.performanceCorrelations.contentTypeVsGrowth}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="type" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="growthImpact" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}

function RecommendationsPanel({ intelligence, onFeedback }: {
  intelligence: BrandIntelligence;
  onFeedback: (id: string, action: 'accepted' | 'rejected') => void;
}) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            Strategic Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {intelligence.recommendations.strategic.map((rec) => (
              <StrategicRecommendationCard
                key={rec.id}
                recommendation={rec}
                onFeedback={onFeedback}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Content Suggestions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {intelligence.recommendations.contentSuggestions.map((suggestion) => (
              <ContentSuggestionCard
                key={suggestion.id}
                suggestion={suggestion}
                onFeedback={onFeedback}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function StrategicRecommendationCard({ recommendation, onFeedback }: {
  recommendation: StrategicRecommendation;
  onFeedback: (id: string, action: 'accepted' | 'rejected') => void;
}) {
  return (
    <div className="p-4 border rounded-lg">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h4 className="font-medium">{recommendation.title}</h4>
          <p className="text-sm text-gray-600 mt-1">{recommendation.description}</p>
        </div>
        <div className="flex gap-2 ml-4">
          <Badge variant={recommendation.impact === 'high' ? 'default' : 'secondary'}>
            {recommendation.impact} impact
          </Badge>
          <Badge variant="outline">
            {recommendation.effort} effort
          </Badge>
        </div>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">
          <span className="font-medium">Timeline:</span> {recommendation.timeframe}
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={() => onFeedback(recommendation.id, 'accepted')}
            className="gap-1"
          >
            <ThumbsUp className="h-3 w-3" />
            Accept
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onFeedback(recommendation.id, 'rejected')}
            className="gap-1"
          >
            <ThumbsDown className="h-3 w-3" />
            Reject
          </Button>
        </div>
      </div>
    </div>
  );
}

function ContentSuggestionCard({ suggestion, onFeedback }: {
  suggestion: ContentSuggestion;
  onFeedback: (id: string, action: 'accepted' | 'rejected') => void;
}) {
  return (
    <div className="p-4 border rounded-lg">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h4 className="font-medium">{suggestion.suggestedTopic}</h4>
          <p className="text-sm text-gray-600 mt-1">{suggestion.angle}</p>
          <p className="text-xs text-blue-600 mt-2">{suggestion.reasoning}</p>
        </div>
        <Badge variant="outline" className="capitalize">
          {suggestion.platform}
        </Badge>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="text-sm">
          <span className="text-gray-600">Expected engagement:</span>
          <span className="font-medium ml-1">{suggestion.expectedEngagement}%</span>
          <span className="text-gray-600 ml-3">Best time:</span>
          <span className="font-medium ml-1">{suggestion.bestPostingTime}</span>
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={() => onFeedback(suggestion.id, 'accepted')}
            className="gap-1"
          >
            <ThumbsUp className="h-3 w-3" />
            Use
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onFeedback(suggestion.id, 'rejected')}
            className="gap-1"
          >
            <ThumbsDown className="h-3 w-3" />
            Skip
          </Button>
        </div>
      </div>
    </div>
  );
}

function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
}
