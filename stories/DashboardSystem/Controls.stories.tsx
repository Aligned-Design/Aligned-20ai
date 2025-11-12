import type { Meta, StoryObj } from '@storybook/react';
import { SegmentedControl, FilterBar, EmptyState, ErrorState } from '@/components/DashboardSystem';
import { Inbox } from 'lucide-react';
import { useState } from 'react';

// SegmentedControl Story
const SegmentedControlMeta: Meta<typeof SegmentedControl> = {
  title: 'DashboardSystem/SegmentedControl',
  component: SegmentedControl,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
};

export default SegmentedControlMeta;

export const SegmentedControlDefault: StoryObj<typeof SegmentedControl> = {
  render: () => {
    const [value, setValue] = useState<'day' | 'week' | 'month' | 'custom'>('week');
    return <SegmentedControl value={value} onChange={setValue} />;
  },
};

// FilterBar Story
export const FilterBarStory: StoryObj<typeof FilterBar> = {
  render: () => {
    const [filters, setFilters] = useState([
      { type: 'platform', value: 'instagram', label: 'Instagram' },
      { type: 'status', value: 'active', label: 'Active' },
    ]);
    return (
      <FilterBar
        activeFilters={filters}
        onRemoveFilter={(filter) => setFilters(filters.filter(f => f !== filter))}
        onClearAll={() => setFilters([])}
      >
        <div className="text-sm text-slate-600">Filter controls go here</div>
      </FilterBar>
    );
  },
};

// EmptyState Story
export const EmptyStateStory: StoryObj<typeof EmptyState> = {
  render: () => (
    <EmptyState
      icon={Inbox}
      title="No data available"
      description="There's nothing to show right now. Try adjusting your filters."
      action={{
        label: 'Create New',
        onClick: () => alert('Create clicked'),
      }}
    />
  ),
};

// ErrorState Story
export const ErrorStateStory: StoryObj<typeof ErrorState> = {
  render: () => (
    <ErrorState
      title="Something went wrong"
      message="We couldn't load this data. Please try again."
      onRetry={() => alert('Retry clicked')}
      onSupport={() => alert('Support clicked')}
    />
  ),
};
