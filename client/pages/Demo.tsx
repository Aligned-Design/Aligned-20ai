import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Eye, 
  Heart, 
  MousePointer,
  Calendar,
  BarChart3,
  Zap,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Sample data for Nike brand
const DEMO_DATA = {
  brand: {
    name: 'Nike',
    logo: '👟',
    tagline: 'Just Do It',
    colors: {
      primary: '#000000',
      accent: '#FF6B35'
    }
  },
  metrics: {
    totalReach: 2847293,
    totalEngagement: 142847,
    followers: 89472,
    avgEngagementRate: 8.7,
    monthlyGrowth: 12.4
  },
  posts: [
    {
      id: '1',
      platform: 'instagram',
      content: 'New Air Max collection drops tomorrow! Get ready to step into the future of comfort and style. 👟✨',
      status: 'published',
      publishedAt: '2024-01-15T09:00:00Z',
      metrics: {
        reach: 45230,
        engagement: 3420,
        likes: 2890,
        comments: 430,
        shares: 100
      },
      image: '🏃‍♂️'
    },
    {
      id: '2',
      platform: 'twitter',
      content: 'Athletes don\'t just wear Nike. They embody the spirit of pushing limits. What\'s your limit today?',
      status: 'scheduled',
      scheduledFor: '2024-01-16T14:00:00Z',
      image: '🏆'
    },
    {
      id: '3',
      platform: 'linkedin',
      content: 'Behind every great athlete is years of dedication, training, and the right gear. Here\'s how Nike supports champions at every level.',
      status: 'in_review',
      metrics: {
        reach: 12890,
        engagement: 890,
        likes: 650,
        comments: 180,
        shares: 60
      },
      image: '💪'
    }
  ],
  insights: [
    {
      id: '1',
      type: 'recommendation',
      title: 'Video Content Driving 45% Higher Engagement',
      description: 'Your video posts significantly outperform static images, with an average engagement rate of 12.4% vs 8.7%.',
      impact: 'high',
      suggestions: [
        'Increase video content frequency to 3-4 posts per week',
        'Focus on workout tutorials and athlete spotlights',
        'Create behind-the-scenes content from product development'
      ]
    },
    {
      id: '2',
      type: 'observation',
      title: 'Peak Engagement During Morning Hours',
      description: 'Your audience shows 28% higher engagement between 7-9 AM, particularly on fitness-related content.',
      impact: 'medium',
      suggestions: [
        'Schedule workout motivation posts for 7:30 AM',
        'Share daily fitness tips during commute hours',
        'Post athlete training sessions in the morning'
      ]
    }
  ],
  calendar: [
    { date: '2024-01-16', posts: 2, status: 'scheduled' },
    { date: '2024-01-17', posts: 1, status: 'draft' },
    { date: '2024-01-18', posts: 3, status: 'scheduled' },
    { date: '2024-01-19', posts: 1, status: 'in_review' },
    { date: '2024-01-20', posts: 2, status: 'scheduled' }
  ]
};

export default function Demo() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [animatedMetrics, setAnimatedMetrics] = useState({
    reach: 0,
    engagement: 0,
    followers: 0,
    rate: 0
  });

  // Animate metrics on page load
  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const stepTime = duration / steps;

    let currentStep = 0;
    const interval = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;
      const easeOut = 1 - Math.pow(1 - progress, 3);

      setAnimatedMetrics({
        reach: Math.floor(DEMO_DATA.metrics.totalReach * easeOut),
        engagement: Math.floor(DEMO_DATA.metrics.totalEngagement * easeOut),
        followers: Math.floor(DEMO_DATA.metrics.followers * easeOut),
        rate: parseFloat((DEMO_DATA.metrics.avgEngagementRate * easeOut).toFixed(1))
      });

      if (currentStep >= steps) {
        clearInterval(interval);
      }
    }, stepTime);

    return () => clearInterval(interval);
  }, []);

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800 border-green-200';
      case 'scheduled': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'in_review': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'draft': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'published': return <CheckCircle className="h-4 w-4" />;
      case 'scheduled': return <Clock className="h-4 w-4" />;
      case 'in_review': return <AlertCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case 'instagram': return 'bg-gradient-to-r from-purple-500 to-pink-500';
      case 'twitter': return 'bg-blue-500';
      case 'linkedin': return 'bg-blue-700';
      case 'facebook': return 'bg-blue-600';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Demo Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="text-center">
            <div className="flex items-center justify-center mb-6">
              <span className="text-6xl mr-4">{DEMO_DATA.brand.logo}</span>
              <div>
                <h1 className="text-4xl font-bold text-slate-900">{DEMO_DATA.brand.name}</h1>
                <p className="text-xl text-slate-600">{DEMO_DATA.brand.tagline}</p>
              </div>
            </div>
            <div className="max-w-3xl mx-auto">
              <h2 className="text-2xl font-semibold mb-4 text-slate-900">A Peek Inside the Dashboard</h2>
              <p className="text-lg text-slate-600">
                Experience how Nike's social media strategy comes to life with Aligned AI.
                Explore real-time analytics, content planning, and AI-powered insights.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Demo Dashboard */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="dashboard">📊 Dashboard</TabsTrigger>
            <TabsTrigger value="content">📝 Content Pipeline</TabsTrigger>
            <TabsTrigger value="analytics">📈 Analytics</TabsTrigger>
            <TabsTrigger value="calendar">📅 Calendar</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <MetricCard
                title="Total Reach"
                value={formatNumber(animatedMetrics.reach)}
                growth={DEMO_DATA.metrics.monthlyGrowth}
                icon={<Eye className="h-5 w-5" />}
                color="blue"
              />
              <MetricCard
                title="Engagement"
                value={formatNumber(animatedMetrics.engagement)}
                growth={15.8}
                icon={<Heart className="h-5 w-5" />}
                color="red"
              />
              <MetricCard
                title="Followers"
                value={formatNumber(animatedMetrics.followers)}
                growth={8.2}
                icon={<Users className="h-5 w-5" />}
                color="green"
              />
              <MetricCard
                title="Engagement Rate"
                value={`${animatedMetrics.rate}%`}
                growth={3.4}
                icon={<TrendingUp className="h-5 w-5" />}
                color="purple"
              />
            </div>

            {/* Recent Posts & AI Insights */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    Recent Posts
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {DEMO_DATA.posts.slice(0, 3).map((post) => (
                    <div key={post.id} className="flex items-start gap-3 p-3 rounded-lg border">
                      <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-white text-sm", getPlatformColor(post.platform))}>
                        {post.image}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className={getStatusColor(post.status)}>
                            {getStatusIcon(post.status)}
                            <span className="ml-1 capitalize">{post.status.replace('_', ' ')}</span>
                          </Badge>
                          <span className="text-sm text-gray-500 capitalize">{post.platform}</span>
                        </div>
                        <p className="text-sm text-gray-700 mb-2 line-clamp-2">{post.content}</p>
                        {post.metrics && (
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span>{formatNumber(post.metrics.reach)} reach</span>
                            <span>{formatNumber(post.metrics.engagement)} engagement</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    AI Insights
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {DEMO_DATA.insights.map((insight) => (
                    <div key={insight.id} className="p-4 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                          {insight.type}
                        </Badge>
                        <Badge variant="outline" className={
                          insight.impact === 'high' ? 'border-red-300 text-red-700' :
                          insight.impact === 'medium' ? 'border-yellow-300 text-yellow-700' :
                          'border-green-300 text-green-700'
                        }>
                          {insight.impact} impact
                        </Badge>
                      </div>
                      <h4 className="font-medium text-gray-900 mb-1">{insight.title}</h4>
                      <p className="text-sm text-gray-600 mb-3">{insight.description}</p>
                      <div className="space-y-1">
                        {insight.suggestions.slice(0, 2).map((suggestion, index) => (
                          <p key={index} className="text-xs text-gray-500 flex items-center gap-2">
                            <span className="w-1 h-1 bg-blue-500 rounded-full"></span>
                            {suggestion}
                          </p>
                        ))}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="content" className="space-y-6">
            <ContentPipelineView posts={DEMO_DATA.posts} />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <AnalyticsView metrics={DEMO_DATA.metrics} />
          </TabsContent>

          <TabsContent value="calendar" className="space-y-6">
            <CalendarView calendar={DEMO_DATA.calendar} />
          </TabsContent>
        </Tabs>

        {/* CTA Section */}
        <div className="mt-12 text-center bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white">
          <h3 className="text-2xl font-bold mb-4">Ready to Transform Your Social Media Strategy?</h3>
          <p className="text-lg mb-6 text-blue-100">
            Join Nike and hundreds of other brands using Aligned AI to create, schedule, and optimize their social media presence.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
              Start Free Trial
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
              Schedule Demo
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

interface MetricCardProps {
  title: string;
  value: string;
  growth: number;
  icon: React.ReactNode;
  color: 'blue' | 'red' | 'green' | 'purple';
}

function MetricCard({ title, value, growth, icon, color }: MetricCardProps) {
  const colorClasses = {
    blue: 'text-blue-600 bg-blue-100',
    red: 'text-red-600 bg-red-100',
    green: 'text-green-600 bg-green-100',
    purple: 'text-purple-600 bg-purple-100'
  };

  return (
    <Card className="transition-all hover:shadow-lg">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
          </div>
          <div className={cn("p-3 rounded-full", colorClasses[color])}>
            {icon}
          </div>
        </div>
        <div className="mt-4 flex items-center">
          {growth > 0 ? (
            <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
          ) : (
            <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
          )}
          <span className={cn("text-sm font-medium", growth > 0 ? "text-green-600" : "text-red-600")}>
            {growth > 0 ? '+' : ''}{growth}%
          </span>
          <span className="text-sm text-gray-500 ml-1">vs last month</span>
        </div>
      </CardContent>
    </Card>
  );
}

function ContentPipelineView({ posts }: { posts: any[] }) {
  const statusGroups = posts.reduce((groups: Record<string, any[]>, post: any) => {
    const status = post.status;
    if (!groups[status]) groups[status] = [];
    groups[status].push(post);
    return groups;
  }, {} as Record<string, any[]>);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {Object.entries(statusGroups).map(([status, statusPosts]: [string, any[]]) => (
        <Card key={status}>
          <CardHeader>
            <CardTitle className="capitalize flex items-center gap-2">
              {status === 'published' && <CheckCircle className="h-5 w-5 text-green-500" />}
              {status === 'scheduled' && <Clock className="h-5 w-5 text-blue-500" />}
              {status === 'in_review' && <AlertCircle className="h-5 w-5 text-yellow-500" />}
              {status.replace('_', ' ')} ({statusPosts.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {statusPosts.map((post: any) => (
              <div key={post.id} className="p-3 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">{post.image}</span>
                  <span className="text-sm font-medium capitalize">{post.platform}</span>
                </div>
                <p className="text-sm text-gray-700 mb-2 line-clamp-3">{post.content}</p>
                {post.metrics && (
                  <div className="text-xs text-gray-500">
                    {formatNumber(post.metrics.likes)} likes • {formatNumber(post.metrics.comments)} comments
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function AnalyticsView({ metrics }: { metrics: any }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Engagement Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-end justify-between gap-2">
              {[65, 78, 82, 71, 89, 95, 87].map((value, index) => (
                <div key={index} className="flex-1 bg-blue-100 rounded-t flex items-end justify-center" style={{ height: `${value}%` }}>
                  <div className="w-full bg-blue-500 rounded-t" style={{ height: '20px' }}></div>
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-2 text-xs text-gray-500">
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
              <span>Sun</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Platform Performance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { platform: 'Instagram', percentage: 45, color: 'bg-gradient-to-r from-purple-500 to-pink-500' },
              { platform: 'Twitter', percentage: 30, color: 'bg-blue-500' },
              { platform: 'LinkedIn', percentage: 25, color: 'bg-blue-700' }
            ].map((item) => (
              <div key={item.platform}>
                <div className="flex justify-between text-sm mb-1">
                  <span>{item.platform}</span>
                  <span>{item.percentage}%</span>
                </div>
                <Progress value={item.percentage} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function CalendarView({ calendar }: { calendar: any[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Content Calendar
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-4">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="text-center font-medium text-gray-600 py-2">
              {day}
            </div>
          ))}
          
          {/* Calendar grid with posts */}
          {Array.from({ length: 35 }, (_, i) => {
            const date = new Date(2024, 0, i - 7); // Start from a week before
            const dayOfMonth = date.getDate();
            const isCurrentMonth = date.getMonth() === 0;
            const calendarEntry = calendar.find(entry => 
              new Date(entry.date).getDate() === dayOfMonth
            );

            return (
              <div
                key={i}
                className={cn(
                  "min-h-[80px] p-2 border rounded-lg",
                  isCurrentMonth ? "bg-white" : "bg-gray-50 text-gray-400",
                  calendarEntry && "border-blue-200 bg-blue-50"
                )}
              >
                <div className="text-sm font-medium">{dayOfMonth}</div>
                {calendarEntry && (
                  <div className="mt-1">
                    <div className="text-xs bg-blue-100 text-blue-800 rounded px-1 py-0.5">
                      {calendarEntry.posts} post{calendarEntry.posts !== 1 ? 's' : ''}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
}
