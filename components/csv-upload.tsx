"use client"

import React from "react"
import { useRouter } from "next/navigation"

const CSVUpload: React.FC = () => {
  const router = useRouter()

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0]
    if (!file) return

    const formData = new FormData()
    formData.append("file", file)

    try {
      const response = await fetch("/api/upload-csv", {
        method: "POST",
        body: formData,
      })

      if (response.ok) {
        router.refresh()
      } else {
        console.error("Failed to upload CSV")
      }
    } catch (error) {
      console.error("Error uploading CSV:", error)
    }
  }

  return (
    <div>
      <input type="file" accept=".csv" onChange={handleFileUpload} />
    </div>
  )
}

export default CSVUpload
