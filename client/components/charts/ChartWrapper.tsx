/**
 * ChartWrapper Component
 *
 * Wrapper for Recharts with consistent styling and accessibility.
 * Supports line, area, and bar charts.
 */

import { ReactNode } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

export type ChartType = "line" | "area" | "bar";

interface ChartWrapperProps {
  type: ChartType;
  data: Array<Record<string, any>>;
  dataKeys: string[];
  xAxisKey: string;
  colors?: string[];
  showGrid?: boolean;
  showLegend?: boolean;
  height?: number;
  ariaLabel?: string;
}

const DEFAULT_COLORS = [
  "var(--color-primary)", // Purple
  "#3b82f6", // Blue
  "#10b981", // Green
  "#f59e0b", // Orange
  "#ef4444", // Red
];

export function ChartWrapper({
  type,
  data,
  dataKeys,
  xAxisKey,
  colors = DEFAULT_COLORS,
  showGrid = true,
  showLegend = false,
  height = 280,
  ariaLabel = "Dashboard chart",
}: ChartWrapperProps) {
  const chartProps = {
    data,
    margin: { top: 5, right: 10, left: 0, bottom: 5 },
  };

  const commonAxisProps = {
    stroke: "var(--color-subtle)",
    style: {
      fontSize: "12px",
      fontFamily: "var(--font-family)",
    },
  };

  const renderChart = () => {
    switch (type) {
      case "line":
        return (
          <LineChart {...chartProps}>
            {showGrid && (
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--color-border)"
              />
            )}
            <XAxis dataKey={xAxisKey} {...commonAxisProps} />
            <YAxis {...commonAxisProps} />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--color-surface)",
                border: "1px solid var(--color-border)",
                borderRadius: "var(--radius-lg)",
              }}
            />
            {showLegend && <Legend />}
            {dataKeys.map((key, index) => (
              <Line
                key={key}
                type="monotone"
                dataKey={key}
                stroke={colors[index % colors.length]}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
            ))}
          </LineChart>
        );

      case "area":
        return (
          <AreaChart {...chartProps}>
            {showGrid && (
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--color-border)"
              />
            )}
            <XAxis dataKey={xAxisKey} {...commonAxisProps} />
            <YAxis {...commonAxisProps} />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--color-surface)",
                border: "1px solid var(--color-border)",
                borderRadius: "var(--radius-lg)",
              }}
            />
            {showLegend && <Legend />}
            {dataKeys.map((key, index) => (
              <Area
                key={key}
                type="monotone"
                dataKey={key}
                stroke={colors[index % colors.length]}
                fill={colors[index % colors.length]}
                fillOpacity={0.2}
              />
            ))}
          </AreaChart>
        );

      case "bar":
        return (
          <BarChart {...chartProps}>
            {showGrid && (
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--color-border)"
              />
            )}
            <XAxis dataKey={xAxisKey} {...commonAxisProps} />
            <YAxis {...commonAxisProps} />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--color-surface)",
                border: "1px solid var(--color-border)",
                borderRadius: "var(--radius-lg)",
              }}
            />
            {showLegend && <Legend />}
            {dataKeys.map((key, index) => (
              <Bar
                key={key}
                dataKey={key}
                fill={colors[index % colors.length]}
                radius={[4, 4, 0, 0]}
              />
            ))}
          </BarChart>
        );
    }
  };

  return (
    <div role="img" aria-label={ariaLabel}>
      <ResponsiveContainer width="100%" height={height}>
        {renderChart()}
      </ResponsiveContainer>
      {/* Screen reader text summary */}
      <span className="sr-only">
        Chart showing {dataKeys.join(", ")} over {xAxisKey}. Contains{" "}
        {data.length} data points.
      </span>
    </div>
  );
}
