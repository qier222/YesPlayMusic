/// <reference types="node" />
import { SpawnSyncOptions } from 'child_process';
export declare function downloadUrl(url: string, file: string): Promise<void>;
export declare function hash(filePath: string): Promise<string>;
export declare function plusx(file: string): Promise<void>;
export declare function spawn(command: string, args?: ReadonlyArray<string>, options?: SpawnSyncOptions): Promise<void>;
//# sourceMappingURL=utils.d.ts.map