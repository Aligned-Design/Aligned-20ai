import type { Preview, Decorator } from '@storybook/react';
import '../client/global.css';

/**
 * Storybook Preview Configuration
 * 
 * Configures light/dark theme support using design tokens
 * All stories inherit the global CSS variables automatically
 */

const preview: Preview = {
  parameters: {
    layout: 'centered',
    docs: {
      autodocs: true,
    },
    themes: {
      default: 'light',
      list: [
        { name: 'Light', value: 'light', class: '', color: '#ffffff' },
        { name: 'Dark', value: 'dark', class: 'dark', color: '#0F172A' },
      ],
    },
    darkMode: {
      current: 'light',
      dark: { name: 'dark', appBg: '#0F172A', appContentBg: '#1E293B', barBg: '#0F172A' },
      light: { name: 'light', appBg: '#ffffff', appContentBg: '#F9FAFB', barBg: '#ffffff' },
    },
  },
  decorators: [
    (Story, context) => {
      const isDark = context.parameters.themes?.default === 'dark' || 
                     (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches);
      
      return (
        <div style={{ 
          backgroundColor: isDark ? 'var(--color-dark-surface)' : 'var(--color-surface)',
          color: isDark ? 'var(--color-dark-foreground)' : 'var(--color-foreground)',
          padding: '2rem',
          minHeight: '100vh',
        }}>
          <Story />
        </div>
      );
    },
  ],
};

export default preview;