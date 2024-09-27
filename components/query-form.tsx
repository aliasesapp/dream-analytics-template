// components/query-form.tsx
"use client"

import React, { useState } from "react"

import DataTable from "@/components/data-table"

export default function QueryForm() {
  const [tableName, setTableName] = useState("")
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<Record<string, any>[]>([])
  const [error, setError] = useState<string | null>(null)

  const handleQuery = async () => {
    if (!tableName.trim() || !query.trim()) {
      setError("Table Name and Query are required.")
      return
    }

    try {
      const res = await fetch("/api/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tableName, query }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Unknown error")
        return
      }

      setResults(data.data)
      setError(null)
    } catch (err) {
      setError("Failed to execute query")
    }
  }

  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold">Execute Query</h2>
      <div className="flex flex-col space-y-4">
        <input
          type="text"
          value={tableName}
          onChange={(e) => setTableName(e.target.value)}
          placeholder="Table Name"
          className="p-2 border rounded"
        />
        <textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="SQL Query"
          className="p-2 border rounded"
          rows={4}
        />
        <button
          onClick={handleQuery}
          className="px-4 py-2 bg-green-500 text-white rounded"
        >
          Run Query
        </button>
      </div>
      {error && <p className="text-red-500 mt-4">{error}</p>}
      {results.length > 0 && <DataTable data={results} />}
    </div>
  )
}
