import { CurrentAppProvider, getSiteConfig, useIntl } from '@openedx/frontend-base';
import { Helmet } from 'react-helmet';
import { Outlet } from 'react-router-dom';
import { appId } from './constants';
import messages from './messages';

import './style.scss';

const Main = () => {
  const { formatMessage } = useIntl();
  return (
    <CurrentAppProvider appId={appId}>
      <Helmet>
        <title>
          {formatMessage(messages['template.page.title'], {
            siteName: getSiteConfig().siteName,
          })}
        </title>
      </Helmet>
      <main className="d-flex flex-column flex-grow-1">
        <Outlet />
      </main>
    </CurrentAppProvider>
  );
};

export default Main;
