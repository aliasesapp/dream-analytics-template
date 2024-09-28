// components/chart-settings.tsx

"use client"

import React from "react"

interface ChartSettingsProps {
  columns: string[]
  selectedCategory: string
  selectedValues: string[]
  onCategoryChange: (category: string) => void
  onValuesChange: (values: string[]) => void
  chartType: "bar" | "line" | "pie"
  onChartTypeChange: (type: "bar" | "line" | "pie") => void
}

const ChartSettings: React.FC<ChartSettingsProps> = ({
  columns,
  selectedCategory,
  selectedValues,
  onCategoryChange,
  onValuesChange,
  chartType,
  onChartTypeChange,
}) => {
  return (
    <div className="mb-4 flex flex-col space-y-4">
      <div>
        <label className="block mb-1 font-semibold" htmlFor="category">
          Category:
        </label>
        <select
          value={selectedCategory}
          onChange={(e) => onCategoryChange(e.target.value)}
          className="w-full border rounded p-2"
          id="category"
        >
          {columns.map((col) => (
            <option key={col} value={col}>
              {col}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block mb-1 font-semibold" htmlFor="values">
          Values:
        </label>
        <select
          multiple
          value={selectedValues}
          onChange={(e) => {
            const selected = Array.from(e.target.selectedOptions).map(
              (option) => option.value
            )
            onValuesChange(selected)
          }}
          className="w-full border rounded p-2 h-32"
          id="values"
        >
          {columns.map((col) => (
            <option key={col} value={col}>
              {col}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block mb-1 font-semibold" htmlFor="chart-type">
          Chart Type:
        </label>
        <select
          value={chartType}
          onChange={(e) =>
            onChartTypeChange(e.target.value as "bar" | "line" | "pie")
          }
          className="w-full border rounded p-2"
          id="chart-type"
        >
          <option value="bar">Bar</option>
          <option value="line">Line</option>
          <option value="pie">Pie</option>
        </select>
      </div>
    </div>
  )
}

export default ChartSettings
