export interface XBlockDataV1 {
    xblockApiVersion: 1;
    id: string;
    blockType: string;
    embedUri: string;
}

export interface XBlockDataV2 {
    xblockApiVersion: 2;
    id: string;
    blockType: string;
    contentFields: { displayName: string } & Record<string, any>;
    systemFields: Record<string, any>;
    userFields: Record<string, any>;
}

/**
 * The data required by the frontend in order to render an XBlock
 */
export type XBlockData = XBlockDataV1 | XBlockDataV2;
