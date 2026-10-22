import { App } from '@openedx/frontend-base';
import { appId } from '@src/constants';
import provides from '@src/provides';
import routes from '@src/routes';
import slots from '@src/slots';

const app: App = {
  appId,
  routes,
  provides,
  slots,
};

export default app;
