import type { Meta, StoryObj } from '@storybook/react';
import { ChartCard } from '@/components/DashboardSystem';
import { ChartWrapper } from '@/components/charts/ChartWrapper';
import { TrendingUp, BarChart3 } from 'lucide-react';

const meta: Meta<typeof ChartCard> = {
  title: 'DashboardSystem/ChartCard',
  component: ChartCard,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ChartCard>;

const mockData = [
  { x: 'Mon', y: 4200 },
  { x: 'Tue', y: 5100 },
  { x: 'Wed', y: 4800 },
  { x: 'Thu', y: 6200 },
  { x: 'Fri', y: 7100 },
  { x: 'Sat', y: 5900 },
  { x: 'Sun', y: 6400 },
];

// Default Line Chart
export const LineChart: Story = {
  args: {
    title: 'Impressions Over Time',
    description: 'Weekly performance',
    icon: TrendingUp,
    children: (
      <ChartWrapper
        type="line"
        data={mockData}
        dataKeys={['y']}
        xAxisKey="x"
        ariaLabel="Impressions trend chart"
      />
    ),
  },
};

// Area Chart
export const AreaChart: Story = {
  args: {
    title: 'Engagement Trend',
    description: 'Last 7 days',
    icon: BarChart3,
    children: (
      <ChartWrapper
        type="area"
        data={mockData}
        dataKeys={['y']}
        xAxisKey="x"
        ariaLabel="Engagement trend chart"
      />
    ),
  },
};

// Bar Chart
export const BarChart: Story = {
  args: {
    title: 'Daily Posts',
    description: 'Posts published per day',
    children: (
      <ChartWrapper
        type="bar"
        data={mockData}
        dataKeys={['y']}
        xAxisKey="x"
        ariaLabel="Daily posts bar chart"
      />
    ),
  },
};

// Loading State
export const Loading: Story = {
  args: {
    title: 'Loading Chart',
    description: 'Fetching data...',
    isLoading: true,
    children: <div />,
  },
};

// Error State
export const Error: Story = {
  args: {
    title: 'Chart Error',
    description: 'Failed to load',
    error: new Error('Failed to fetch chart data'),
    onRetry: () => alert('Retrying...'),
    children: <div />,
  },
};

// Dark Mode
export const DarkMode: Story = {
  args: {
    title: 'Revenue Trend',
    description: 'Last 30 days',
    icon: TrendingUp,
    children: (
      <ChartWrapper
        type="line"
        data={mockData}
        dataKeys={['y']}
        xAxisKey="x"
        ariaLabel="Revenue trend chart"
      />
    ),
  },
  parameters: {
    backgrounds: {
      default: 'dark',
    },
  },
  decorators: [
    (Story) => (
      <div className="dark">
        <Story />
      </div>
    ),
  ],
};
