import path from 'path';
import DuckDB from 'duckdb';

/**
 * Establishes a connection to the DuckDB database.
 * Uses dynamic imports to prevent bundling issues.
 */
let db: DuckDB.Database | null = null;

export async function getDuckDBConnection(): Promise<DuckDB.Database> {
  if (!db) {
    if (typeof window === 'undefined') {
      try {
        const dbPath = path.join(process.cwd(), 'data', 'analytics.db');
        db = new DuckDB.Database(dbPath);
      } catch (error) {
        console.error('Error initializing DuckDB:', error);
        throw new Error('Failed to initialize DuckDB');
      }
    } else {
      throw new Error('DuckDB is not supported in the browser environment');
    }
  }
  return db;
}

/**
 * Initializes the analytics table if it doesn't exist.
 */
async function initializeDatabase(db: any): Promise<void> {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS analytics (
      id INTEGER PRIMARY KEY,
      event TEXT NOT NULL,
      timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  return new Promise((resolve, reject) => {
    db.run(createTableQuery, (err?: Error | null) => {
      if (err) {
        console.error('Error creating analytics table:', err);
        reject(err);
      } else {
        console.log('Analytics table created or already exists.');
        resolve();
      }
    });
  });
}