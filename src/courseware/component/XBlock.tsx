import React from "react";
import { getConfig } from "@edx/frontend-platform";
import { Helmet } from 'react-helmet';

import { XBlockData, XBlockDataV2 } from "./types";
import LegacyXBlock from "./LegacyXBlock";

interface XBlockRenderContextData {
    ensureBlockScript(blockType: string);
}

const XBlockRenderContext = React.createContext<XBlockRenderContextData|undefined>(undefined);



export const XBlockRenderingContext: React.FC<{children: React.ReactNode}> = ({children}) => {
    const globalStatus = (window as any as {_loadedBlockTypes: Set<string>});
    if (!globalStatus._loadedBlockTypes) {
        globalStatus._loadedBlockTypes = new Set<string>();
    }
    const ensureBlockScript = React.useCallback((blockType: string) => {
        if (!globalStatus._loadedBlockTypes.has(blockType)) {
            globalStatus._loadedBlockTypes.add(blockType);
            // We want the browser to handle this import(), not webpack, so the comment on the next line is essential.
            import(/* webpackIgnore: true */ `${getConfig().LMS_BASE_URL}/xblock/resource-v2/${blockType}/public/learner-view-v2.js`).then(() => {
                console.log(`✅ Loaded JavaScript for ${blockType} v2 XBlock.`);
            }, (err) => {
                console.error(`🛑 Unable to Load JavaScript for ${blockType} v2 XBlock: ${err}`);
                globalStatus._loadedBlockTypes.delete(blockType);
            });
        }
    }, []);
    const ctx = {
        ensureBlockScript,
    };
    return <XBlockRenderContext.Provider value={ctx}>
        {children}
    </XBlockRenderContext.Provider>;
};




export const XBlock: React.FC<XBlockDataV2> = ({ id, ...props }) => {

    const ctx = React.useContext(XBlockRenderContext);
    if (!ctx) {
        return <p>Error: cannot display a v2 XBlock outside of an <code>XBlockRenderContext</code>.</p>
    }

    const ComponentName = `xblock2-${props.blockType}`;
    const xblockProps = {
        class: 'xblock-component xblock-v2',  // For web components in React, the prop is 'class', not 'className'
        'content-fields': JSON.stringify(props.contentFields),
        'system-fields': JSON.stringify(props.systemFields),
        'user-fields': JSON.stringify(props.userFields),
    };

    React.useEffect(() => {
        ctx.ensureBlockScript(props.blockType);
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
