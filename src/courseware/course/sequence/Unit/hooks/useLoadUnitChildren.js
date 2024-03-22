import React from 'react';

import { getConfig } from '@edx/frontend-platform';
import { StrictDict, useKeyedState } from '@edx/react-unit-test-utils';
import { logError } from '@edx/frontend-platform/logging';
import { getBlockMetadataWithChildren } from '../../../../data/api';

export const stateKeys = StrictDict({
  unitChildren: 'unitChildren',
});
const useLoadUnitChildren = (usageId) => {
  const [unitChildren, setUnitChildren] = useKeyedState(stateKeys.unitChildren, []);

  if (getConfig().RENDER_XBLOCKS_EXPERIMENTAL === true || getConfig().RENDER_XBLOCKS_EXPERIMENTAL === 'true') {
    React.useEffect(() => {
      (async () => {
        try {
          const response = await getBlockMetadataWithChildren(usageId);
          setUnitChildren(response.children);
        } catch (error) {
          logError(error);
        }
      })();
    }, [usageId]);
  }

  return unitChildren;
};

export default useLoadUnitChildren;
