"use client"

import React, { useState } from "react"

import DataTable from "@/components/data-table"
import FileUpload from "@/components/file-upload"
import QueryForm from "@/components/query-form"

interface UploadResponse {
  message: string
  tableName: string
}

export default function DashboardPage() {
  const [tableName, setTableName] = useState("")
  const [data, setData] = useState<Record<string, any>[]>([])
  const [error, setError] = useState<string | null>(null)

  const handleFileUpload = async (file: File) => {
    const formData = new FormData()
    formData.append("file", file)

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      const responseData: UploadResponse = await res.json()

      if (!res.ok) {
        setError(responseData.message)
        return
      }

      setTableName(responseData.tableName)
      setError(null)

      // Optionally, fetch the inserted data
      const fetchData = await fetch("/api/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tableName: responseData.tableName,
          query: `SELECT * FROM "${responseData.tableName}"`,
        }),
      })

      const queryData = await fetchData.json()

      if (fetchData.ok) {
        setData(queryData.data)
      } else {
        setError(queryData.error || "Failed to fetch data")
      }
    } catch (err) {
      console.error("Upload error:", err)
      setError("Failed to upload file")
    }
  }

  return (
    <section className="container p-8">
      <h1 className="text-2xl font-bold mb-4">Generic CSV Dashboard</h1>
      <FileUpload onUpload={handleFileUpload} />
      {error && <p className="text-red-500 mt-4">{error}</p>}
      {tableName && (
        <>
          <h2 className="text-xl font-semibold mt-8">Data from {tableName}</h2>
          <DataTable data={data} />
        </>
      )}
      {tableName && <QueryForm />}
    </section>
  )
}
