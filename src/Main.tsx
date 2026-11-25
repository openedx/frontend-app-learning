import { CurrentAppProvider, getSiteConfig, useIntl } from '@openedx/frontend-base';
import { Helmet } from 'react-helmet';
import { Outlet } from 'react-router-dom';

import NoticesProvider from './generic/notices';
import { appId } from './constants';
import messages from './messages';
import { useQueryErrorLogging } from './queryClient';

import './style.scss';

// No user messages or toast provider here: each tab root mounts its own (LearningWidgetProviders) and the other pages
// mount what they use, so none is ever nested inside another copy of itself.
const Main = () => {
  const { formatMessage } = useIntl();
  useQueryErrorLogging();
  return (
    <CurrentAppProvider appId={appId}>
      <Helmet>
        <title>
          {formatMessage(messages['learning.page.title'], {
            siteName: getSiteConfig().siteName,
          })}
        </title>
      </Helmet>
      <NoticesProvider>
        <div className="d-flex flex-column flex-grow-1">
          <Outlet />
        </div>
      </NoticesProvider>
    </CurrentAppProvider>
  );
};

export default Main;
