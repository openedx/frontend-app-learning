import { App } from '@openedx/frontend-base';
import { appId } from '@src/constants';
import provides from '@src/provides';
import routes from '@src/routes';
import slots from '@src/slots';

const app: App = {
  appId,
  defaultConfig: {
    CREDIT_HELP_LINK_URL: null,
    ENABLE_NOTICES: null,
    EXAMS_BASE_URL: null,
    SHOW_UNGRADED_ASSIGNMENT_PROGRESS: false,
    SUPPORT_URL_ID_VERIFICATION: null,
  },
  routes,
  provides,
  slots,
};

export default app;
