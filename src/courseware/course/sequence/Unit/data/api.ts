import { camelCaseObject, getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

import { XBlockData } from '../../../../component/types';

export interface UnitContentsData {
    unit: {
        displayName: string;
    };
    blocks: XBlockData[];
}


/**
 * Fetch the data required to render all of the components (XBlocks) in a unit.
 * @param unitId The usage key (ID) of the unit to render
 */
export async function getUnitContentsData(unitId: string): Promise<UnitContentsData> {
    const { data } = await getAuthenticatedHttpClient().get(
        `${getConfig().LMS_BASE_URL}/api/xblock/v1/${unitId}/unit_contents`
    );
    return camelCaseObject(data);
}
