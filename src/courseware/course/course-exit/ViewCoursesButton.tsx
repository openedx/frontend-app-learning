import { getLinkProps, getUrlByRouteRole, useIntl } from '@openedx/frontend-base';
import { Button } from '@openedx/paragon';

import { dashboardRole } from '@src/constants';
import messages from './messages';

// Links to the learner's dashboard, wherever the site provides it; nothing when no route provides the dashboard role.
const ViewCoursesButton = () => {
  const intl = useIntl();
  const dashboardUrl = getUrlByRouteRole(dashboardRole);
  if (!dashboardUrl) {
    return null;
  }
  return (
    <div className="row w-100 mt-2 mb-4 justify-content-end">
      <Button variant="outline-primary" {...getLinkProps(dashboardUrl)}>
        {intl.formatMessage(messages.viewCoursesButton)}
      </Button>
    </div>
  );
};

export default ViewCoursesButton;
