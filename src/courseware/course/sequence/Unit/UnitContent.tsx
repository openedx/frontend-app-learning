import React from "react";
import { useUnitContents } from "./data/apiHooks";
import { Spinner } from "@openedx/paragon";
import { AutoXBlock } from "../../../component/XBlock";


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

    console.log(unitContents);
    return <main>
        {unitContents.blocks.map((blockData) => (
            <AutoXBlock key={blockData.id} {...blockData} />
        ))}
    </main>;
};

export default UnitContent;
