declare module 'duckdb' {
  export class Database {
    constructor(location: string);

    // Overloaded 'run' method to handle both with and without parameters
    run(query: string, callback?: (err: Error | null) => void): void;
    run(query: string, params: any[], callback: (err: Error | null) => void): void;

    // Overloaded 'all' method to handle both with and without parameters
    all(query: string, callback: (err: Error | null, rows: any[]) => void): void;
    all(query: string, params: any[], callback: (err: Error | null, rows: any[]) => void): void;

    // Add other methods as needed with appropriate typings
  }
}