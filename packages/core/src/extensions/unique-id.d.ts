import { Extension } from "./Extension";
export interface UniqueIdOptions {
    attributeName: string;
    types: string[];
    generateId: () => string;
    idleScanInterval?: number;
}
export declare const UniqueId: Extension<{
    attributeName: string;
    types: string[];
    generateId: () => string;
    idleScanInterval: number;
}, any>;
export declare function createUniqueId(options?: Partial<UniqueIdOptions>): Extension<any, any>;
