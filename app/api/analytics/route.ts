import { NextResponse } from 'next/server';
import { getDuckDBConnection } from '@/lib/duckdb';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  function generateUniqueInt32(): number {
    const now = Date.now();
    const random = Math.floor(Math.random() * 1000); // Random number between 0 and 999
    return (now % 2147483648) + random;
  }
  try {
    const { event } = await req.json();

    if (!event) {
      return NextResponse.json({ error: 'Event is required' }, { status: 400 });
    }

    const db = await getDuckDBConnection();

    return new Promise((resolve) => {
      const insertQuery = 'INSERT INTO analytics (id, event) VALUES (?, ?);';
      const id = generateUniqueInt32();
      db.run(insertQuery, id, event, (err: Error | null) => {
        if (err) {
          console.error('Error inserting event:', err);
          console.error('Query:', insertQuery);
          console.error('Parameters:', [id, event]);
          resolve(
            NextResponse.json({ error: 'Failed to record event', details: err.message }, { status: 500 })
          );
        } else {
          resolve(NextResponse.json({ message: 'Event recorded successfully', id }));
        }
      });
    });
  } catch (error) {
    console.error('Error in POST /api/analytics:', error);
    return NextResponse.json({ error: 'Server error', details: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}

export async function GET() {
  try {
    const db = await getDuckDBConnection();

    return new Promise((resolve) => {
      const selectQuery = 'SELECT * FROM analytics ORDER BY timestamp DESC LIMIT 10;';
      db.all(selectQuery, (err: Error | null, rows: any[]) => {
        if (err) {
          console.error('Error fetching analytics data:', err);
          resolve(
            NextResponse.json({ error: 'Failed to fetch analytics data' }, { status: 500 })
          );
        } else {
          resolve(NextResponse.json({ data: rows }));
        }
      });
    });
  } catch (error) {
    console.error('Error in GET /api/analytics:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}