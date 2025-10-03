export = DebugPortAllocator;
declare function DebugPortAllocator(): void;
declare class DebugPortAllocator {
    ports: any;
    length: number;
    nextAvailableStartingAt(starting: any): any;
    releasePort(port: any): void;
}
