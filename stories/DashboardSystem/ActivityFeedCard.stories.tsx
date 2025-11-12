import type { Meta, StoryObj } from '@storybook/react';
import { ActivityFeedCard, type ActivityItem } from '@/components/DashboardSystem';
import { FileText, CheckCircle, MessageSquare } from 'lucide-react';

const meta: Meta<typeof ActivityFeedCard> = {
  title: 'DashboardSystem/ActivityFeedCard',
  component: ActivityFeedCard,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ActivityFeedCard>;

const mockItems: ActivityItem[] = [
  {
    id: '1',
    title: 'Post published',
    description: 'Instagram carousel went live',
    timestamp: '2 hours ago',
    icon: FileText,
  },
  {
    id: '2',
    title: 'Campaign approved',
    description: 'Summer Sale Campaign ready to launch',
    timestamp: '5 hours ago',
    icon: CheckCircle,
    iconColor: 'text-green-600',
  },
  {
    id: '3',
    title: 'Comment replied',
    description: 'Responded to customer inquiry',
    timestamp: '1 day ago',
    icon: MessageSquare,
    iconColor: 'text-blue-600',
  },
];

export const Default: Story = {
  args: {
    title: 'Recent Activity',
    description: 'Latest actions',
    items: mockItems,
  },
};

export const Loading: Story = {
  args: {
    title: 'Loading Activity',
    items: [],
    isLoading: true,
  },
};

export const Empty: Story = {
  args: {
    title: 'No Activity',
    items: [],
    emptyMessage: 'No recent activity to show',
  },
};

export const Error: Story = {
  args: {
    title: 'Activity Feed',
    items: [],
    error: new Error('Failed to load activity'),
    onRetry: () => alert('Retrying...'),
  },
};
