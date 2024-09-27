import duckdb from 'duckdb';

let db: duckdb.Database | null = null;

/**
 * Initializes and returns a DuckDB instance for server-side.
 */
export async function getDuckDBConnection(): Promise<duckdb.Database> {
  if (db) return db;

  // Initialize an in-memory DuckDB instance
  db = new duckdb.Database(':memory:');

  return db;
}

/**
 * Promisified version of db.run
 */
export function runQuery(
  dbInstance: duckdb.Database,
  query: string,
  params?: any[]
): Promise<void> {
  return new Promise((resolve, reject) => {
    console.log('Query:', query);
    console.log('Params:', params);

    const sanitizedParams = params ? params.map(p => p === null ? 'NULL' : p) : [];
    const parameterizedQuery = query.replace(/\$(\d+)/g, (_, index) => {
      const param = sanitizedParams[parseInt(index) - 1];
      return param === 'NULL' ? 'NULL' : `$${index}`;
    });

    console.log('Parameterized Query:', parameterizedQuery);
    console.log('Sanitized Params:', sanitizedParams.filter(p => p !== 'NULL'));

    dbInstance.run(parameterizedQuery, sanitizedParams.filter(p => p !== 'NULL'), (err: Error | null) => {
      if (err) {
        console.error('DuckDB query error:', err);
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

/**
 * Promisified version of db.all
 */
export function allQuery(
  dbInstance: duckdb.Database,
  query: string,
  params?: any[]
): Promise<any[]> {
  return new Promise((resolve, reject) => {
    dbInstance.all(query, params, (err: Error | null, rows: any[]) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

/**
 * Initializes the database (creates a new table).
 */
export function initializeDatabase(
  dbInstance: duckdb.Database,
  tableName: string,
  columns: string
): Promise<void> {
  const createTableQuery = `CREATE TABLE IF NOT EXISTS "${tableName}" (${columns});`;
  console.log('Create Table Query:', createTableQuery);
  return runQuery(dbInstance, createTableQuery);
}