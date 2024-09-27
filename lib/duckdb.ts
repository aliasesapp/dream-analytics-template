// lib/duckdb-client.ts
import DuckDB from '@duckdb/duckdb-wasm';
import type { InitInput, IShellInitOutput } from '@duckdb/duckdb-wasm';

let dbInstance: DuckDB | null = null;

/**
 * Initializes and returns a DuckDB Wasm instance for client-side.
 */
export async function getDuckDBConnection(): Promise<DuckDB> {
  if (dbInstance) return dbInstance;

  const input: InitInput = {
    locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@duckdb/duckdb-wasm@1.28.1-dev106.0/dist/${file}`,
  };

  dbInstance = new DuckDB(input);
  await dbInstance.instantiate(); // Wait for the WASM module to initialize

  return dbInstance;
}

/**
 * Initializes the database (creates a new table).
 */
export async function initializeDatabase(db: DuckDB, tableName: string, columns: string): Promise<void> {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS "${tableName}" (${columns});
  `;
  await db.run(createTableQuery);
}