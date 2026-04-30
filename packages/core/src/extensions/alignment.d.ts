import { Extension } from "./Extension";
export declare const TEXT_ALIGN: {
    readonly LEFT: "left";
    readonly CENTER: "center";
    readonly RIGHT: "right";
    readonly JUSTIFY: "justify";
};
export type TextAlign = (typeof TEXT_ALIGN)[keyof typeof TEXT_ALIGN];
export declare function createTextAlign(): Extension;
