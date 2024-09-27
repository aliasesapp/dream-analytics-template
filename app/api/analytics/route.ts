// app/api/analytics/route.ts
import { NextResponse } from 'next/server';
import { getDuckDBConnection, allQuery } from '@/lib/duckdb-server';

export const runtime = 'nodejs'; // Use 'nodejs' runtime instead of 'edge'

/**
 * Expects a JSON body with:
 * {
 *   tableName: string,
 *   query: string
 * }
 */
export async function POST(req: Request) {
  try {
    const { tableName, query } = await req.json();

    if (!tableName || !query) {
      return NextResponse.json({ error: 'tableName and query are required' }, { status: 400 });
    }

    const db = await getDuckDBConnection();

    // **Important**: To prevent SQL injection, sanitize or validate the `query` and `tableName`.
    // For demonstration, we'll execute the provided query directly.

    // Recommended: Only allow SELECT queries
    if (!/^SELECT\s+/i.test(query.trim())) {
      return NextResponse.json({ error: 'Only SELECT queries are allowed.' }, { status: 400 });
    }

    const sanitizedTableName = tableName.replace(/[^a-zA-Z0-9_]/g, '');

    const sanitizedQuery = query.replace(new RegExp(`\\b${tableName}\\b`, 'g'), `"${sanitizedTableName}"`);

    // Execute the query and fetch results
    const results = await allQuery(db, sanitizedQuery);

    return NextResponse.json({ data: results }, { status: 200 });
  } catch (error) {
    console.error('Error in POST /api/query:', error);
    return NextResponse.json(
      { error: 'Server error', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}