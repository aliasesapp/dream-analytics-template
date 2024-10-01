import { NextResponse } from 'next/server';
import { getDuckDBConnection } from '@/lib/duckdb';
import { serializeData } from '@/lib/serialize';

export async function POST(req: Request) {
  try {
    const { filePath, selectedCategory, selectedValues, aggregations } = await req.json();

    const db = await getDuckDBConnection();

    // Step 1: Drop the temporary view if it exists
    const dropViewQuery = `
      DROP VIEW IF EXISTS temp_table;
    `;

    await new Promise<void>((resolve, reject) => {
      db.run(dropViewQuery, (err: Error | null) => {
        if (err) {
          console.error("Error dropping temporary view:", err);
          reject(err);
        } else {
          resolve();
        }
      });
    });

    // Step 2: Create a temporary view for the CSV file
    const createViewQuery = `
      CREATE TEMPORARY VIEW temp_table AS 
      SELECT * FROM read_csv_auto('${filePath}');
    `;

    await new Promise<void>((resolve, reject) => {
      db.run(createViewQuery, (err: Error | null) => {
        if (err) {
          console.error("Error creating temporary view:", err);
          reject(err);
        } else {
          resolve();
        }
      });
    });

    // Step 3: Retrieve column types from DuckDB using the temporary view
    const columnInfoQuery = `
      PRAGMA table_info(temp_table);
    `;

    const columnInfo = await new Promise<any[]>((resolve, reject) => {
      db.all(columnInfoQuery, (err: Error | null, rows: any[]) => {
        if (err) {
          console.error("Error fetching column info:", err);
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });

    const allColumns = columnInfo.map(col => col.name);

    // Step 4: Validate that selectedCategory exists
    if (!allColumns.includes(selectedCategory)) {
      return NextResponse.json(
        { error: `Selected category "${selectedCategory}" does not exist in the CSV.` },
        { status: 400 }
      );
    }

    // Step 5: Validate that all selectedValues exist
    const invalidValues = selectedValues.filter((value: string) => !allColumns.includes(value));
    if (invalidValues.length > 0) {
      return NextResponse.json(
        { error: `The following selected values do not exist in the CSV: ${invalidValues.join(', ')}` },
        { status: 400 }
      );
    }

    // Step 6: Identify numeric columns
    const numericColumns = columnInfo
      .filter(col => ['INTEGER', 'BIGINT', 'DECIMAL', 'DOUBLE'].includes(col.type.toUpperCase()))
      .map(col => col.name);

    // Step 7: Validate aggregations
    for (const [column, agg] of Object.entries(aggregations)) {
      if (agg && agg !== "None") {
        if (!numericColumns.includes(column)) {
          return NextResponse.json(
            { error: `Aggregation function "${agg}" cannot be applied to non-numeric column "${column}".` },
            { status: 400 }
          );
        }
      }
    }

    // Step 8: Prevent selectedCategory from being included in aggregations
    if (selectedValues.includes(selectedCategory)) {
      return NextResponse.json(
        { error: `The selected category "${selectedCategory}" cannot be used as an aggregation column.` },
        { status: 400 }
      );
    }

    // Step 9: Construct aggregation queries
    const aggregationQueries = selectedValues.map((value: string) => {
      const agg = aggregations[value];
      if (agg && agg !== "None") {
        switch (agg.toLowerCase()) {
          case "sum":
            return `SUM(${value}) AS sum_${value}`;
          case "average":
            return `AVG(${value}) AS avg_${value}`;
          case "count":
            return `COUNT(${value}) AS count_${value}`;
          case "min":
            return `MIN(${value}) AS min_${value}`;
          case "max":
            return `MAX(${value}) AS max_${value}`;
          default:
            return value;
        }
      }
      return value;
    });

    // Identify non-aggregated columns
    const nonAggregatedColumns = [
      selectedCategory,
      ...selectedValues.filter(
        (value: string) => !aggregations[value] || aggregations[value] === "None"
      ),
    ];

    const query = `
      SELECT 
        ${nonAggregatedColumns.join(", ")},
        ${aggregationQueries.filter((q: string) => q.includes(" AS ")).join(", ")}
      FROM temp_table
      GROUP BY ${nonAggregatedColumns.join(", ")}
    `;

    const rows = await new Promise<any[]>((resolve, reject) => {
      db.all(query, (err: Error | null, rows: any[]) => {
        if (err) {
          console.error("Error performing aggregation:", err);
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });

    const safeRows = serializeData(rows);

    return NextResponse.json({ data: safeRows });
  } catch (error) {
    console.error("Error in POST /api/aggregate-data:", error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}