import type { Meta, StoryObj } from "@storybook/react";
import { KpiCard } from "@/components/DashboardSystem";
import { TrendingUp, Users, Target, Activity, DollarSign } from "lucide-react";

const meta: Meta<typeof KpiCard> = {
  title: "DashboardSystem/KpiCard",
  component: KpiCard,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
  argTypes: {
    title: {
      control: "text",
      description: "Card title/label",
    },
    value: {
      control: "text",
      description: "Main metric value (number or string)",
    },
    delta: {
      control: "object",
      description: "Change percentage with trend indicator",
    },
    icon: {
      control: false,
      description: "Lucide icon component",
    },
    sparkline: {
      control: "object",
      description: "Array of numbers for sparkline chart",
    },
    description: {
      control: "text",
      description: "Additional description text",
    },
  },
};

export default meta;
type Story = StoryObj<typeof KpiCard>;

// Default
export const Default: Story = {
  args: {
    title: "Total Revenue",
    value: "$12,450",
    delta: {
      value: 12.5,
      trend: "up",
      label: "vs last month",
    },
    icon: DollarSign,
  },
};

// Trending Up
export const TrendingUpExample: Story = {
  args: {
    title: "New Users",
    value: "1,847",
    delta: {
      value: 18.3,
      trend: "up",
      label: "vs last week",
    },
    icon: Users,
    description: "Active signups this week",
  },
};

// Trending Down
export const TrendingDown: Story = {
  args: {
    title: "Bounce Rate",
    value: "32.4%",
    delta: {
      value: -5.2,
      trend: "down",
      label: "vs last week",
    },
    icon: Target,
    description: "Lower is better",
  },
};

// Neutral (No Change)
export const Neutral: Story = {
  args: {
    title: "Engagement Rate",
    value: "8.3%",
    delta: {
      value: 0,
      trend: "neutral",
      label: "no change",
    },
    icon: Activity,
  },
};

// With Sparkline
export const WithSparkline: Story = {
  args: {
    title: "Total Impressions",
    value: "45.2K",
    delta: {
      value: 12.5,
      trend: "up",
      label: "vs last week",
    },
    icon: TrendingUp,
    sparkline: [40, 45, 42, 48, 50, 45, 52],
  },
};

// No Delta
export const NoDelta: Story = {
  args: {
    title: "Total Posts",
    value: 24,
    icon: Activity,
    description: "Published this month",
  },
};

// Large Number
export const LargeNumber: Story = {
  args: {
    title: "Total Reach",
    value: "382K",
    delta: {
      value: 13.2,
      trend: "up",
      label: "vs last week",
    },
    icon: TrendingUp,
    sparkline: [320, 340, 350, 365, 375, 370, 382],
  },
};

// Loading State
export const Loading: Story = {
  args: {
    title: "Loading...",
    value: "---",
    icon: Activity,
  },
  parameters: {
    docs: {
      description: {
        story: "Loading state can be shown by passing placeholder values",
      },
    },
  },
};

// Dark Mode
export const DarkMode: Story = {
  args: {
    title: "Engagement Rate",
    value: "12.5%",
    delta: {
      value: 2.3,
      trend: "up",
      label: "vs last week",
    },
    icon: Target,
    sparkline: [10, 11, 11.5, 12, 11.8, 12.2, 12.5],
  },
  parameters: {
    backgrounds: {
      default: "dark",
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
