import * as system from './system';
interface NeedOptions {
    forceFetch?: boolean;
    forceBuild?: boolean;
    dryRun?: boolean;
    output?: string;
    nodeRange: string;
    platform: string;
    arch: string;
}
export declare function need(opts: NeedOptions): Promise<string>;
export { system };
//# sourceMappingURL=index.d.ts.map