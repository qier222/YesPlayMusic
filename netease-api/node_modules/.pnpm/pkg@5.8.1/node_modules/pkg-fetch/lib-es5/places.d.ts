export declare const cachePath: string;
interface PlaceOptions {
    version: string;
    nodeVersion: string;
    platform: string;
    arch: string;
}
interface LocalPlaceOptions extends PlaceOptions {
    from: string;
    output?: string;
}
export declare function localPlace({ from, output, version, nodeVersion, platform, arch, }: LocalPlaceOptions): string;
export interface Remote {
    tag: string;
    name: string;
}
export declare function remotePlace({ version, nodeVersion, platform, arch, }: PlaceOptions): Remote;
export {};
//# sourceMappingURL=places.d.ts.map