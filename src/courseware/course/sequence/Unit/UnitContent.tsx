import React from "react";
import { useUnitContents } from "./data/apiHooks";
import { Spinner } from "@openedx/paragon";
import { AutoXBlock } from "../../../component/XBlock";
import { XBlockRenderContextProvider } from "../../../component/XBlockRenderContext";


interface Props {
    unitId: string;
}

export const UnitContent: React.FC<Props> = ({ unitId, ...props }) => {
    const {data: unitContents, isError, isLoading} = useUnitContents(unitId);

    if (isError) {
        return <p><strong>Error:</strong> Unable to load unit contents.</p>
    }

    if (isLoading || !unitContents) {
        return (
            <Spinner
                animation="border"
                size="xl"
                screenReaderText={"loading"}
            />
        );
    }

    return <main>
        <XBlockRenderContextProvider>
            {unitContents.blocks.map((blockData) => (
                <AutoXBlock key={blockData.id} {...blockData} />
            ))}
        </XBlockRenderContextProvider>
    </main>;
};

export default UnitContent;
