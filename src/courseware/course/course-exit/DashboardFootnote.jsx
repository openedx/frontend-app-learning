import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { getConfig } from '@edx/frontend-platform';
import { getAuthenticatedUser } from '@edx/frontend-platform/auth';
import { useIntl } from '@edx/frontend-platform/i18n';
import { Hyperlink } from '@openedx/paragon';
import { faCalendarAlt } from '@fortawesome/free-regular-svg-icons';

import { useModel } from '../../../generic/model-store';

import Footnote from './Footnote';
import messages from './messages';
import { logClick } from './utils';

const DashboardFootnote = ({ variant, content }) => {
  const intl = useIntl();
  const { courseId } = useSelector(state => state.courseware);
  const { org } = useModel('courseHomeMeta', courseId);
  const { administrator } = getAuthenticatedUser();

  const dashboardLink = (
    <Hyperlink
      style={{ textDecoration: 'underline' }}
      destination={content?.dashboardFootnoteUrl || `${getConfig().LMS_BASE_URL}/dashboard`}
      className="text-reset"
      onClick={() => logClick(org, courseId, administrator, 'dashboard_footnote', { variant })}
    >
      {intl.formatMessage(messages.dashboardLink)}
    </Hyperlink>
  );

  return (
    <Footnote
      icon={faCalendarAlt}
      text={intl.formatMessage(messages.dashboardInfo, { dashboardLink })}
    />
  );
};

DashboardFootnote.propTypes = {
  content: PropTypes.shape({
    dashboardFootnoteUrl: PropTypes.string,
  }),
  variant: PropTypes.string.isRequired,
};

export default DashboardFootnote;
