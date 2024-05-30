import React from "react";
import { XBlockData, XBlockDataV2 } from "./types";
import LegacyXBlock from "./LegacyXBlock";

export const XBlock: React.FC<XBlockDataV2> = ({ id, ...props }) => {
    return <div className="xblock-component xblock-v2">
        {props.blockType} (v2 block) to be displayed here, as a web component.
    </div>;
};

/**
 * Render a courseware component (XBlock) which may be V1 or V2.
 */
export const AutoXBlock: React.FC<XBlockData> = (props) => {
    if (props.xblockApiVersion === 2) {
        return <XBlock {...props} />;
    }
    return <LegacyXBlock {...props} />;
};

export default XBlock;
