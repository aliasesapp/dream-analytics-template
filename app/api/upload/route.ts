// app/api/upload/route.ts
import { NextResponse } from 'next/server';
import { getDuckDBConnection, initializeDatabase, runQuery } from '@/lib/duckdb-server';
import Papa from 'papaparse';

export const runtime = 'nodejs'; // Use 'nodejs' runtime instead of 'edge'

interface UploadResponse {
  message: string;
  tableName: string;
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'CSV file is required' }, { status: 400 });
    }

    const csvText = await file.text();
    const results = Papa.parse<Record<string, string>>(csvText, {
      header: true,
      skipEmptyLines: true,
    });

    const records = results.data;

    if (records.length === 0) {
      return NextResponse.json({ error: 'CSV file is empty' }, { status: 400 });
    }

    const db = await getDuckDBConnection();

    // Dynamically generate table name and columns
    const tableName = `table_${Date.now()}`;
    const columns = Object.keys(records[0])
      .map((key) => `"${key}" VARCHAR`)
      .join(', ');

    await initializeDatabase(db, tableName, columns);

    // Prepare insert query with placeholders
    const columnNames = Object.keys(records[0]).map((key) => `"${key}"`).join(', ');
    const placeholders = Object.keys(records[0]).map((_, index) => `$${index + 1}`).join(', ');
    const insertQuery = `INSERT INTO "${tableName}" (${columnNames}) VALUES (${placeholders});`;

    // Begin transaction for bulk insertion
    await runQuery(db, 'BEGIN TRANSACTION;');

    // Insert each record
    for (const record of records) {
      const values = Object.values(record).map(value => value === '' ? null : value);

      // Log for debugging
      console.log(`Inserting into ${tableName}:`, values);
      console.log(`Expected placeholders: ${placeholders.split(',').length}, Provided values: ${values.length}`);

      // Ensure the number of values matches the number of placeholders
      if (values.length !== Object.keys(records[0]).length) {
        throw new Error(`Mismatch between number of values (${values.length}) and placeholders (${Object.keys(records[0]).length})`);
      }

      await runQuery(db, insertQuery, values);
    }

    // Commit transaction
    await runQuery(db, 'COMMIT;');

    return NextResponse.json(
      { message: 'CSV uploaded and data inserted successfully', tableName },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in POST /api/upload:', error);
    return NextResponse.json(
      {
        error: 'Server error',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}