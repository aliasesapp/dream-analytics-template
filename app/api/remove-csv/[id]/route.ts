import { NextResponse } from "next/server"
import { removeCSVFile } from "@/lib/csv-manager"

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get("id")

  if (!id) {
    return NextResponse.json({ error: "No file ID provided" }, { status: 400 })
  }

  try {
    await removeCSVFile(id)
    return NextResponse.json({ message: "File removed successfully" })
  } catch (error) {
    console.error("Error removing file:", error)
    return NextResponse.json({ error: "Failed to remove file" }, { status: 500 })
  }
}