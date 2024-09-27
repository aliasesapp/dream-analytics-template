"use client"

import React, { useState } from "react"

export default function FileUpload({
  onUpload,
}: {
  onUpload: (file: File) => void
}) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0])
    }
  }

  const handleUpload = () => {
    if (selectedFile) {
      onUpload(selectedFile)
      setSelectedFile(null)
    }
  }

  return (
    <div className="flex flex-col items-center p-4 border-dashed border-2 border-gray-300 rounded-md">
      <input
        type="file"
        accept=".csv"
        onChange={handleFileChange}
        className="mb-4"
      />
      {selectedFile && (
        <button
          onClick={handleUpload}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          Upload CSV
        </button>
      )}
    </div>
  )
}
