import React from "react";

import { XBlockData, XBlockDataV2 } from "./types";
import LegacyXBlock from "./LegacyXBlock";
import { ensureBlockScript } from "./XBlockRenderContext";


export const XBlock: React.FC<XBlockDataV2> = ({ id, ...props }) => {

    const ComponentName = `xblock2-${props.blockType}`;
    const xblockProps = {
        class: 'xblock-component xblock-v2',  // For web components in React, the prop is 'class', not 'className'
        'usage-key': id,
        'content-fields': JSON.stringify(props.contentFields),
        'system-fields': JSON.stringify(props.systemFields),
        'user-fields': JSON.stringify(props.userFields),
    };

    React.useEffect(() => {
        ensureBlockScript(props.blockType);
    });

    // return React.createElement(componentName, xblockProps);
    return <ComponentName {...xblockProps as any} />
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
