declare class Log {
    debugMode: boolean;
    private bar?;
    private lines;
    debug(text: string, lines?: string[] | string): void;
    info(text: string, lines?: string[] | string): void;
    warn(text: string, lines?: string[] | string): void;
    error(text: Error | string, lines?: string[] | string): void;
    enableProgress(text: string): void;
    showProgress(percentage: number): void;
    disableProgress(): void;
}
export declare const log: Log;
declare class ReportedError extends Error {
    name: string;
    wasReported: boolean;
}
export declare function wasReported(error?: string, lines?: string[] | string | string): ReportedError;
export {};
//# sourceMappingURL=log.d.ts.map