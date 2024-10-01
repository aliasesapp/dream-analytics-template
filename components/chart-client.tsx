// components/chart-client.tsx

"use client"

import React from "react"
import {
  Bar,
  BarChart,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

interface ChartClientProps {
  data: { [key: string]: any }[]
  categoryKey: string
  valueKeys: string[]
  chartType?: "bar" | "line" | "pie"
}

const COLORS = [
  "#4F46E5",
  "#EF4444",
  "#10B981",
  "#F59E0B",
  "#3B82F6",
  "#8B5CF6",
  "#6B7280",
  "#22C55E",
  "#F97316",
  "#EC4899",
]

const getColor = (index: number): string => COLORS[index % COLORS.length]

const ChartClient: React.FC<ChartClientProps> = ({
  data,
  categoryKey,
  valueKeys,
  chartType = "bar",
}) => {
  // Sort the data based on the categoryKey
  const sortedData = React.useMemo(() => {
    return [...data].sort((a, b) => {
      if (a[categoryKey] < b[categoryKey]) return -1
      if (a[categoryKey] > b[categoryKey]) return 1
      return 0
    })
  }, [data, categoryKey])

  /**
   * Generate dynamic Bar components based on valueKeys
   */
  const renderBars = () =>
    valueKeys.map((key, index) => (
      <Bar key={key} dataKey={key} fill={getColor(index)} name={key} />
    ))

  /**
   * Generate dynamic Line components based on valueKeys
   */
  const renderLines = () =>
    valueKeys.map((key, index) => (
      <Line
        key={key}
        type="monotone"
        dataKey={key}
        stroke={getColor(index)}
        name={key}
      />
    ))

  /**
   * Generate dynamic Pie slices based on valueKeys
   * Note: Pie charts typically represent a single dimension. Consider customizing as needed.
   */
  const renderPies = () =>
    valueKeys.map((key, index) => (
      <Pie
        key={key}
        data={data}
        dataKey={key}
        nameKey={categoryKey}
        cx={index === 0 ? "25%" : "75%"}
        cy="50%"
        outerRadius={80}
        fill={getColor(index)}
        label
      />
    ))

  /**
   * Render Chart based on chartType
   */
  const renderChart = () => {
    switch (chartType) {
      case "line":
        return (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={sortedData}>
              <XAxis dataKey={categoryKey} />
              <YAxis />
              <Tooltip />
              <Legend />
              {renderLines()}
            </LineChart>
          </ResponsiveContainer>
        )
      case "pie":
        return (
          <ResponsiveContainer width="100%" height={400}>
            <PieChart data={sortedData} dataKey={valueKeys[0]}>
              <Tooltip />
              <Legend />
              {renderPies()}
            </PieChart>
          </ResponsiveContainer>
        )
      case "bar":
      default:
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={sortedData}>
              <XAxis dataKey={categoryKey} />
              <YAxis />
              <Tooltip />
              <Legend />
              {renderBars()}
            </BarChart>
          </ResponsiveContainer>
        )
    }
  }

  return <div>{renderChart()}</div>
}

export default ChartClient
