import { useIntl } from '@openedx/frontend-base';
import { ReactNode, Suspense } from 'react';

import PageLoading from '@src/generic/PageLoading';
import messages from '@src/tab-page/messages';

const TabLoading = () => {
  const intl = useIntl();
  return <PageLoading srMessage={intl.formatMessage(messages.loading)} />;
};

/**
 * The `Suspense` boundary around a tab widget's lazily loaded root, with the page spinner as fallback. A host's slot
 * provides no boundary of its own. `slots.tsx` loads this module with the site, so it stays light: no tab code.
 */
const TabWidgetSuspense = ({ children }: { children: ReactNode }) => (
  <Suspense fallback={<TabLoading />}>
    {children}
  </Suspense>
);

export default TabWidgetSuspense;
