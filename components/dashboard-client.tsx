// components/dashboard-client.tsx

"use client"

import React, { useEffect, useMemo, useState } from "react"
import dynamic from "next/dynamic"
import { useRouter } from "next/navigation"

import { CSVFile } from "@/lib/csv-manager"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import ChartSettings from "@/components/chart-settings"
import CSVUpload from "@/components/csv-upload"

/**
 * Dynamically import the ChartClient component to ensure it's treated as a client component.
 */
const ChartClient = dynamic(() => import("@/components/chart-client"), {
  ssr: false,
})

interface DashboardData {
  [key: string]: any
}
interface DashboardClientProps {
  csvFiles: CSVFile[]
  allData: { [key: string]: DashboardData[] }
}

const DashboardClient: React.FC<DashboardClientProps> = ({
  csvFiles,
  allData,
}) => {
  const router = useRouter()
  const [selectedFile, setSelectedFile] = useState<string>(
    csvFiles[0]?.id || ""
  )
  const [selectedCategory, setSelectedCategory] = useState<string>("")
  const [selectedValues, setSelectedValues] = useState<string[]>([])
  const [chartType, setChartType] = useState<"bar" | "line" | "pie">("bar")

  const rows = allData[selectedFile] || []

  // Safely access the first row if available
  const sampleRow = rows.length > 0 ? rows[0] : null
  const columns = useMemo(
    () => (sampleRow ? Object.keys(sampleRow) : []),
    [sampleRow]
  )

  // Identify numeric columns
  const numericColumns = useMemo(
    () =>
      sampleRow
        ? columns.filter(
            (key) =>
              typeof sampleRow[key] === "number" ||
              !isNaN(parseFloat(sampleRow[key]))
          )
        : [],
    [sampleRow, columns]
  )

  // Identify string columns for category
  const stringColumns = useMemo(
    () =>
      sampleRow
        ? columns.filter((key) => typeof sampleRow[key] === "string")
        : [],
    [sampleRow, columns]
  )

  // Set default selections if not set
  useEffect(() => {
    if (sampleRow) {
      if (!selectedCategory && stringColumns.length > 0) {
        setSelectedCategory(stringColumns[0])
      }

      if (selectedValues.length === 0 && numericColumns.length > 0) {
        setSelectedValues([numericColumns[0]])
      }
    }
  }, [
    sampleRow,
    stringColumns,
    numericColumns,
    selectedCategory,
    selectedValues,
  ])
  // Early return if no data is available
  if (rows.length === 0) {
    return (
      <div className="container p-4">
        <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
        <p className="mb-4">
          No data available. Please upload a CSV file to get started.
        </p>
        <div className="mb-4">
          <h2 className="text-xl font-semibold mb-2">CSV Files</h2>
          <select
            value={selectedFile}
            onChange={(e) => setSelectedFile(e.target.value)}
            className="mr-2"
          >
            {csvFiles.map((file) => (
              <option key={file.id} value={file.id}>
                {file.name}
              </option>
            ))}
          </select>
          <button
            onClick={() => handleRemoveCSV(selectedFile)}
            disabled={!selectedFile}
          >
            Remove Selected CSV
          </button>
          <CSVUpload />
        </div>
      </div>
    )
  }

  // Early return if chart configurations are not set
  if (!selectedCategory || selectedValues.length === 0) {
    return <div>Loading chart configurations...</div>
  }

  // Prepare chart data based on selections
  const chartData = rows.map((row) => {
    const dataPoint: { [key: string]: any } = {
      category: row[selectedCategory],
    }
    selectedValues.forEach((key) => {
      const parsedValue = parseFloat(row[key])
      dataPoint[key] = isNaN(parsedValue) ? 0 : parsedValue
    })
    return dataPoint
  })

  const handleRemoveCSV = async (id: string) => {
    try {
      const response = await fetch(`/api/remove-csv?id=${id}`, {
        method: "DELETE",
      })
      if (response.ok) {
        router.refresh()
      } else {
        console.error("Failed to remove CSV")
      }
    } catch (error) {
      console.error("Error removing CSV:", error)
    }
  }

  return (
    <section className="container p-4">
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="w-full sm:w-2/3 md:w-3/4 order-2 sm:order-1">
          <h1 className="text-2xl font-bold mb-4">Dashboard</h1>

          <div className="mb-8">
            <ChartClient
              data={chartData}
              categoryKey="category"
              valueKeys={selectedValues}
              chartType={chartType}
            />
          </div>

          <h2 className="text-xl font-semibold mb-2">Recent Data</h2>
          <div className="overflow-x-auto">
            <Table className="min-w-full">
              <TableHeader>
                <TableRow>
                  {columns.map((header) => (
                    <TableHead key={header}>{header}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row, index) => (
                  <TableRow key={index}>
                    {columns.map((col) => (
                      <TableCell key={col}>
                        {row[col] instanceof Date
                          ? row[col].toLocaleString()
                          : String(row[col])}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
        <div className="w-full sm:w-1/3 md:w-1/4 order-1 sm:order-2">
          <div className="mb-4">
            <h2 className="text-xl font-semibold mb-2">CSV Files</h2>
            <select
              value={selectedFile}
              onChange={(e) => setSelectedFile(e.target.value)}
              className="mr-2"
            >
              {csvFiles.map((file) => (
                <option key={file.id} value={file.id}>
                  {file.name}
                </option>
              ))}
            </select>
            <button onClick={() => handleRemoveCSV(selectedFile)}>
              Remove Selected CSV
            </button>
            <CSVUpload />
          </div>
          <ChartSettings
            columns={columns}
            selectedCategory={selectedCategory}
            selectedValues={selectedValues}
            onCategoryChange={setSelectedCategory}
            onValuesChange={setSelectedValues}
            chartType={chartType}
            onChartTypeChange={setChartType}
          />
        </div>
      </div>
    </section>
  )
}

export default DashboardClient
