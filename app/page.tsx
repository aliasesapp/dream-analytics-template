// app/page.tsx

import path from "path"
import dynamic from "next/dynamic"

import { getDuckDBConnection } from "@/lib/duckdb"

/**
 * Dynamically import the DashboardClient component as a client-side component.
 */
const DashboardClient = dynamic(() => import("@/components/dashboard-client"), {
  ssr: false, // Ensure this component is only rendered on the client
})

interface DashboardData {
  [key: string]: any
}

const DashboardPage = async () => {
  const db = await getDuckDBConnection()
  const csvPath = path.join(process.cwd(), "data", "example.csv")
  const query = `
    SELECT *
    FROM read_csv_auto('${csvPath}')
    LIMIT 100
  `

  const rows: DashboardData[] = await new Promise((resolve, reject) => {
    db.all(query, (err: Error | null, rows: DashboardData[]) => {
      if (err) {
        console.error("Error querying CSV:", err)
        reject(err)
      } else {
        resolve(rows)
      }
    })
  })

  return <DashboardClient rows={rows} />
}

export default DashboardPage
