import React from "react";
import type { AxiosInstance } from "axios";
import { getConfig } from "@edx/frontend-platform";
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

const globalStatus = (window as any as {_loadedBlockTypes: Set<string>});
if (!globalStatus._loadedBlockTypes) {
    globalStatus._loadedBlockTypes = new Set<string>();
}

// TODO: HandlerResponse and CallHandler type definitions should be in a 'xblock-client-api' package on NPM?
export interface HandlerResponse {
    data: Record<string, any>;
    updatedFields: Record<string, any>;
}

export interface CallHandler {
    (
        usageKey: string,
        handlerName: string,
        body: Record<string, any> | ReadableStream | Blob,
        method?: 'GET'|'POST',
    ): Promise<HandlerResponse>;
}

export function ensureBlockScript(blockType: string): void {
    if (!globalStatus._loadedBlockTypes.has(blockType)) {
        globalStatus._loadedBlockTypes.add(blockType);
        // We want the browser to handle this import(), not webpack, so the comment on the next line is essential.
        import(/* webpackIgnore: true */ `${getConfig().LMS_BASE_URL}/xblock/resource-v2/${blockType}/public/learner-view-v2.js`).then(() => {
            console.log(`Loaded JavaScript for ${blockType} v2 XBlock.`);
        }, (err) => {
            console.error(`🛑 Unable to Load JavaScript for ${blockType} v2 XBlock: ${err}`);
            globalStatus._loadedBlockTypes.delete(blockType);
        });
    }
}

const callHandler: CallHandler = async (usageKey, handlerName, body, method): Promise<HandlerResponse> => {
    const client: AxiosInstance = getAuthenticatedHttpClient();
    const makeRequest = client[method === "POST" ? 'post' : 'get'];
    const response = await makeRequest(`${getConfig().LMS_BASE_URL}/api/xblock/v1/${usageKey}/handler_v2/${handlerName}`, body);
    return response.data;
}

/**
 * Context Provider for rendering XBlocks (v2). Any use of the <XBlock /> component must be inside one of these
 * contexts. This provides the functionality for those XBlocks to interact with the runtime, e.g. by calling handlers.
 */
export const XBlockRenderContextProvider: React.FC<{children: React.ReactNode}> = ({children}) => {
    // Place an actual element into the DOM so that descendants can find us even if they're not using React
    const ContextElementType = "xblock-render-context" as any as React.FC<{ref: any}>;
    const ref = React.useRef<HTMLElement>(null);
    React.useEffect(() => {
        if (ref.current) {
            (ref.current as any).callHandler = callHandler;
        }
    }, [ref.current]);
    return (
        <ContextElementType ref={ref}>
            {children}
        </ContextElementType>
    );
};