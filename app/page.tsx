import { CSVFile, getCSVFiles } from "@/lib/csv-manager"
import { getDuckDBConnection } from "@/lib/duckdb"
import DashboardClient from "@/components/dashboard-client"

interface DashboardData {
  [key: string]: any
}

const DashboardPage = async () => {
  const db = await getDuckDBConnection()
  const csvFiles = await getCSVFiles()

  const allData: { [key: string]: DashboardData[] } = {}

  for (const csvFile of csvFiles) {
    const query = `
      SELECT *
      FROM read_csv_auto('${csvFile.path}')
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

    allData[csvFile.id] = rows
  }

  return <DashboardClient csvFiles={csvFiles} allData={allData} />
}

export default DashboardPage
