import { CurrentAppProvider } from '@openedx/frontend-base';
import type { ReactNode } from 'react';

import { appId } from '@src/constants';
import { TourProvider } from '@src/product-tours/TourContext';
import { ToastProvider } from './ToastContext';
import { UserMessagesProvider } from './user-messages';

import '../style.scss';

/*
 * The context a tab needs and that nothing above it is relied on for: Learning's app config, user messages, the toast
 * and the product tours, plus the stylesheet. Each tab root mounts it once, above everything it renders, so the tab
 * works on a page Learning's `Main` is not on.
 */
const LearningWidgetProviders = ({ children }: { children: ReactNode }) => (
  <CurrentAppProvider appId={appId}>
    <UserMessagesProvider>
      <ToastProvider>
        <TourProvider>
          {children}
        </TourProvider>
      </ToastProvider>
    </UserMessagesProvider>
  </CurrentAppProvider>
);

export default LearningWidgetProviders;
