import React from "react";
import { AxiosHeaders, type AxiosInstance } from "axios";
import { getConfig } from "@edx/frontend-platform";
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

const globalStatus = (window as any as {_loadedBlockTypes: Set<string>});
if (!globalStatus._loadedBlockTypes) {
    globalStatus._loadedBlockTypes = new Set<string>();
}

// TODO: HandlerResponse and CallHandler type definitions should be in a 'xblock-client-api' package on NPM?
interface CallHandlerRaw {
    (
        usageKey: string,
        handlerName: string,
        body: Blob,
        method?: 'get'|'post'|'put'|'delete',
    ): Promise<Response>;
}

export function ensureBlockScript(blockType: string): void {
    if (!globalStatus._loadedBlockTypes.has(blockType)) {
        globalStatus._loadedBlockTypes.add(blockType);
        // We want the browser to handle this import(), not webpack, so the comment on the next line is essential.
        import(/* webpackIgnore: true */ `${getConfig().LMS_BASE_URL}/xblock/resource/${blockType}/public/learner-view-v2.js`).then(() => {
            console.log(`Loaded JavaScript for ${blockType} v2 XBlock.`);
        }, (err) => {
            console.error(`🛑 Unable to Load JavaScript for ${blockType} v2 XBlock: ${err}`);
            globalStatus._loadedBlockTypes.delete(blockType);
        });
    }
}

const callHandlerRaw: CallHandlerRaw = async (usageKey, handlerName, body, method = 'post'): Promise<Response> => {
    const client: AxiosInstance = getAuthenticatedHttpClient();
    const makeRequest = client[method];
    const axiosResponse = await makeRequest(
        `${getConfig().LMS_BASE_URL}/xblock/${usageKey}/handler/${handlerName}`,
        body,
        { transformResponse: (r) => r }
    );
    // Convert from the vague axios format to the standard Response format:
    const headers: Record<string, any> = (
        axiosResponse.headers instanceof AxiosHeaders ? axiosResponse.headers.toJSON(true) : axiosResponse.headers
    );
    const response = new Response(axiosResponse.data, {headers, status: axiosResponse.status});
    return response;
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
            (ref.current as any).callHandlerRaw = callHandlerRaw;
        }
    }, [ref.current]);
    return (
        <ContextElementType ref={ref}>
            {children}
        </ContextElementType>
    );
};