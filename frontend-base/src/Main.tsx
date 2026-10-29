import { CurrentAppProvider, getSiteConfig, useIntl } from '@openedx/frontend-base';
import { Helmet } from 'react-helmet';
import { Outlet } from 'react-router-dom';

import NoticesProvider from './generic/notices';
import { ToastProvider } from './generic/ToastContext';
import { UserMessagesProvider } from './generic/user-messages';
import { appId } from './constants';
import messages from './messages';
import { useQueryErrorLogging } from './queryClient';

import './style.scss';

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
        <UserMessagesProvider>
          <ToastProvider>
            <div className="d-flex flex-column flex-grow-1">
              <Outlet />
            </div>
          </ToastProvider>
        </UserMessagesProvider>
      </NoticesProvider>
    </CurrentAppProvider>
  );
};

export default Main;
