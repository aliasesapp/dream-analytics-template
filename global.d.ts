// global.d.ts

declare module '@duckdb/duckdb-wasm' {
  export default class DuckDB {
    constructor(config: InitInput);
    instantiate(): Promise<IShellInitOutput>;
    run(query: string, params?: any[]): Promise<void>;
    all(query: string, params?: any[]): Promise<any[]>;
  }

  export interface InitInput {
    locateFile: (file: string) => string;
  }

  export interface IShellInitOutput {
    memory: WebAssembly.Memory;
    table: any;
    exports: any;
  }
}