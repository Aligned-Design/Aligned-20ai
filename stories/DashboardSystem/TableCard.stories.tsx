import type { Meta, StoryObj } from "@storybook/react";
import { TableCard } from "@/components/DashboardSystem";
import { Users } from "lucide-react";

const meta: Meta<typeof TableCard> = {
  title: "DashboardSystem/TableCard",
  component: TableCard,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof TableCard>;

const SampleTable = () => (
  <table className="w-full">
    <thead>
      <tr className="border-b border-slate-200 dark:border-slate-700">
        <th className="text-left py-3 px-4 text-sm font-semibold">Name</th>
        <th className="text-left py-3 px-4 text-sm font-semibold">Email</th>
        <th className="text-right py-3 px-4 text-sm font-semibold">Status</th>
      </tr>
    </thead>
    <tbody>
      {[
        { name: "John Doe", email: "john@example.com", status: "Active" },
        { name: "Jane Smith", email: "jane@example.com", status: "Active" },
        { name: "Bob Johnson", email: "bob@example.com", status: "Pending" },
      ].map((row, i) => (
        <tr key={i} className="border-b border-slate-100 dark:border-slate-800">
          <td className="py-3 px-4 text-sm">{row.name}</td>
          <td className="py-3 px-4 text-sm">{row.email}</td>
          <td className="py-3 px-4 text-sm text-right">
            <span
              className={`px-2 py-1 rounded-full text-xs ${
                row.status === "Active"
                  ? "bg-green-100 text-green-700"
                  : "bg-yellow-100 text-yellow-700"
              }`}
            >
              {row.status}
            </span>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
);

// Default Table
export const Default: Story = {
  args: {
    title: "User Accounts",
    description: "Active users in the system",
    icon: Users,
    children: <SampleTable />,
  },
};

// Loading State
export const Loading: Story = {
  args: {
    title: "Loading Table",
    description: "Fetching data...",
    isLoading: true,
    children: <div />,
  },
};

// Error State
export const Error: Story = {
  args: {
    title: "Table Error",
    description: "Failed to load",
    error: new Error("Failed to fetch table data"),
    onRetry: () => alert("Retrying..."),
    children: <div />,
  },
};

// Empty State
export const Empty: Story = {
  args: {
    title: "No Data",
    description: "No users found",
    isEmpty: true,
    emptyMessage: "No users match your filters",
    children: <div />,
  },
};

// Dark Mode
export const DarkMode: Story = {
  args: {
    title: "User Accounts",
    description: "Active users in the system",
    icon: Users,
    children: <SampleTable />,
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
