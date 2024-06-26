import React from "react";
import { XBlockDataV1 } from "./types";

export const LegacyXBlock: React.FC<XBlockDataV1> = ({ id, embedUri }) => {

    const ref = React.useRef<HTMLIFrameElement>(null);

    const handleMessage = React.useCallback((event: MessageEvent<any>) => {
        const iframe = ref.current;
        if (iframe && event.data.type === "plugin.resize" && event.source === iframe.contentWindow) {
            iframe.height = event.data.payload.height + 80;
        }
    }, [ref.current])

    React.useEffect(() => {
        window.addEventListener('message', handleMessage)
        return () => window.removeEventListener('message', handleMessage)
    }, [handleMessage]);

    return (
        <iframe
            ref={ref}
            data-block-id={id}
            src={embedUri}
            style={{border: "none", width: "100%"}}
        />
    );
};

export default LegacyXBlock;
