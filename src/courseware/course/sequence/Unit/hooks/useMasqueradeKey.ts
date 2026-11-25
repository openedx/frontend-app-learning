import { useState } from 'react';

import { useMasquerade } from '@src/courseware/data/apiHooks';

const unchanged = 'unchanged';

/*
 * A React key for what the unit shows from the LMS, which renders it for whoever the session masquerades as. After a
 * change, the shell's masquerade bar refetches every query, but the unit's address is the same as before, so nothing
 * loads it again: mounting it anew under this key does. The first answer is what the unit loaded under, so it changes
 * nothing. Only course staff can masquerade, and only they ask.
 */
const useMasqueradeKey = (courseId: string, canMasquerade: boolean) => {
  const { data: masquerade } = useMasquerade(courseId, { enabled: canMasquerade });
  const [loadedUnder, setLoadedUnder] = useState(masquerade);
  if (loadedUnder == null && masquerade != null) {
    setLoadedUnder(masquerade);
  }
  return masquerade == null || loadedUnder == null || masquerade === loadedUnder ? unchanged : masquerade;
};

export default useMasqueradeKey;
