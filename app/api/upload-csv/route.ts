import { NextResponse } from "next/server"
import { addCSVFile } from "@/lib/csv-manager"

export async function POST(req: Request) {
  const formData = await req.formData()
  const file = formData.get("file") as File

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 })
  }

  try {
    await addCSVFile(file)
    return NextResponse.json({ message: "File uploaded successfully" })
  } catch (error) {
    console.error("Error uploading file:", error)
    return NextResponse.json({ error: "Failed to upload file" }, { status: 500 })
  }
}
