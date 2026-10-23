import { App } from '@openedx/frontend-base';
import { appId } from '@src/constants';
import provides from '@src/provides';
import routes from '@src/routes';
import slots from '@src/slots';

const app: App = {
  appId,
  defaultConfig: {
    ENABLE_NOTICES: null,
    EXAMS_BASE_URL: null,
  },
  routes,
  provides,
  slots,
};

export default app;
