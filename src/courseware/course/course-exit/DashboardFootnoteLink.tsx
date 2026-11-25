import {
  getAuthenticatedUser, getLinkProps, getUrlByRouteRole, useIntl,
} from '@openedx/frontend-base';
import { Hyperlink } from '@openedx/paragon';

import { dashboardRole } from '@src/constants';
import { useCourseHomeMeta } from '@src/course-home/data/apiHooks';
import messages from './messages';
import { logClick } from './utils';

interface DashboardFootnoteLinkProps {
  courseId: string;
  variant: string;
}

// The dashboard link in the course exit footnote; nothing when no route provides the dashboard role.
const DashboardFootnoteLink = ({ courseId, variant }: DashboardFootnoteLinkProps) => {
  const intl = useIntl();
  const org = useCourseHomeMeta(courseId, { enabled: false }).data?.org;
  const dashboardUrl = getUrlByRouteRole(dashboardRole);
  if (!dashboardUrl) {
    return null;
  }
  return (
    <Hyperlink
      style={{ textDecoration: 'underline' }}
      className="text-reset"
      {...getLinkProps(dashboardUrl)}
      onClick={() => logClick(org, courseId, getAuthenticatedUser()?.administrator, 'dashboard_footnote', { variant })}
    >
      {intl.formatMessage(messages.dashboardLink)}
    </Hyperlink>
  );
};

export default DashboardFootnoteLink;
